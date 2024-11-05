import mongoose from "mongoose";
import AddressModel from "../../models/addressModel.js";
import CartModel from "../../models/cartModel.js";
import CouponModel from "../../models/coupenModel.js";
import OrderModel from "../../models/orderModel.js";
import ProductModel from "../../models/prodectsModel.js";


export const getCheckout = async (req, res) => {
  try {
    const { user, WishlistQty, cartQty } = req.session;
    const [cartDetails, addresses,coupens] = await Promise.all([
      CartModel.findOne({ userId: user._id }).lean(),
      AddressModel.find({ userId: user._id }).sort({ createdAt: -1 }).lean(),
      CouponModel.find({isActive:true})
    ]);

    if (!cartDetails || cartDetails.products.length === 0) {
      return res.render("user/checkout", { user, WishlistQty, cartQty, cartItems: [], addresses,coupens });
    }

    const productIds = cartDetails.products.map((cartItem) => cartItem.productId);
    const products = await ProductModel.find({ _id: { $in: productIds } }).lean();
    const productMap = new Map(products.map(product => [product._id.toString(), product]));
    const cartItemsWithDetails = cartDetails.products.map((cartItem) => {
      return {
        product: productMap.get(cartItem.productId.toString()),
        quantity: cartItem.quantity,
        size: cartItem.size
      };
    });

    res.render("user/checkout", {
      user,
      WishlistQty,
      cartQty,
      cartItems: cartItemsWithDetails,
      addresses,
      coupens
    });
  } catch (error) {
    console.error("Error fetching checkout details:", error.message);
   
    return res.render("user/error");
  }
};
export const checkoutFn = async (req, res) => {
  try {
    const { cartItems, selectedAddresses, coupenId, paymentMethod } = req.body;

  

    const orderItems = cartItems.map(item => ({
      productId: item.productId,
      name: item.name,
      size: item.size,
      description: item.description,
      imageUrl: item.imageUrl,
      price: item.price,
      quantity: item.quantity,
    }));

    const totalAmount = parseInt(
      orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
    );

    let totelOrginalPrice = 0;
    let categoryDiscountValue = 0;

    for (const item of orderItems) {
      const product = await ProductModel.findById(item.productId);
      if (product) {
        totelOrginalPrice += product.originalPrice * item.quantity;
        const discountAmount = (product.originalPrice * (product.discountApplied / 100)) * item.quantity;
        categoryDiscountValue += discountAmount;
      }
    }

    const userId = req.session.user._id;
    const selectedAddress = selectedAddresses[0];

    let coupon = null;
    let cvalue=0
    let finalAmount = totalAmount + 50;

    if (coupenId && mongoose.Types.ObjectId.isValid(coupenId)) {
      coupon = await CouponModel.findById(coupenId);
      if (!coupon || !coupon.isActive) {
        return res.json({ ok: false, msg: "Invalid or inactive coupon.", red: "/cart" });
      }
      if (finalAmount < coupon.minimumAmount) {
        return res.json({
          msg: `Coupon cannot be applied. Minimum order total should be ₹${coupon.minimumPrice}.`
        });
      }
      if (coupon.discountType === "fixed") {
        finalAmount -= coupon.discountValue;
      } else if (coupon.discountType === "percentage") {
        finalAmount -= (totalAmount * coupon.discountValue) / 100;
         cvalue=(totalAmount * coupon.discountValue) / 100 
      }

      if (finalAmount < 0) {
        finalAmount = 0;
      }
    }

    for (const item of orderItems) {
      const product = await ProductModel.findById(item.productId);
      if (!product) {
        return res.json({ ok: false, msg: "Product not found", red: "/cart" });
      }

      const sizeVariantIndex = product.availableSize.findIndex(size => size.size === item.size);
      if (sizeVariantIndex === -1) {
        return res.json({ ok: false, msg: `Size ${item.size} not found`, red: "/cart" });
      }

      const sizeVariant = product.availableSize[sizeVariantIndex];
      if (sizeVariant.stock < item.quantity) {
        return res.json({ ok: false, msg: `Insufficient stock for size ${item.size}`, red: "/cart" });
      }

      sizeVariant.stock -= item.quantity;
      await product.save();
    }

    function generateOrderId() {
      return 'COD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    const orderId = generateOrderId();
    const newOrder = new OrderModel({
      user: userId,
      items: orderItems,
      address: {
        type: selectedAddress.type,
        streetAddress: selectedAddress.streetAddress,
        city: selectedAddress.city,
        state: selectedAddress.state,
        postalCode: selectedAddress.zip,
        country: selectedAddress.country,
      },
      
      totalAmount: Math.round(finalAmount),
      totelOrginalPrice,
      totelDiscountValue:totelOrginalPrice-totalAmount,
      categoryDiscountValue,
      orderId: orderId,
      coupenValue:cvalue,
      paymentMethod,
      couponId: coupon ? coupon._id : null,
    });

    await newOrder.save();
    await CartModel.deleteOne({ userId: userId });

    return res.json({ ok: true, msg: "Order placed successfully!", red: "/orders" });
  } catch (error) {
    console.error("Error processing checkout:", error);
    return res.render("user/error");
  }
};
