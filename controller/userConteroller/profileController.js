import userModel from "../../models/userModel.js";
import AddressModel from "../../models/addressModel.js";
import Wishlist from "../../models/whislistModel.js";
import CartModel from "../../models/cartModel.js";
import OrderModel from "../../models/orderModel.js";
import ProductModel from "../../models/prodectsModel.js";
import CouponModel from "../../models/coupenModel.js";
import WalletModel from "../../models/wallet.js";

export const profileRender = async (req, res) => {
  try {
    const id = req.session.user?._id;
    if (!id) return res.redirect("/");

    const [user, addresses] = await Promise.all([
      userModel.findById(id),
      AddressModel.find({ userId: id }),
    ]);

    if (!user) return res.redirect("/");

    const { WishlistQty, cartQty } = req.session;
    res.render("user/profile", { user, cartQty, WishlistQty, addresses });
  } catch {
    res.redirect("/");
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { username, phone } = req.body;
    const user = await userModel.findByIdAndUpdate(
      req.params.id,
      { username, phone },
      { new: true }
    );

    if (!user) return res.json({ ok: false, msg: "User not found" });

    req.session.user.username = username;
    res.status(200).json({ ok: true, msg: "Profile updated successfully" });
  } catch {
    res.status(500).json({ ok: false, msg: "Server error" });
  }
};

export const renderAddressPage = async (req, res) => {
  try {
    const id = req.session.user._id;
    const user = await userModel.findById(id);
    const addresses = await AddressModel.find({ userId: id });
    const wishlist = await Wishlist.findOne({ user: id });

    const wishlistProducts = wishlist?.products || [];
    const WishlistQty = new Set(wishlistProducts).size;

    req.session.WishlistQty = WishlistQty;
    const cartQty = req.session.cartQty;

    if (!user) {
      return res.redirect("/");
    }

    res.render("user/address", { user, cartQty, WishlistQty, addresses });
  } catch (error) {
    return res.render("user/error");
  }
};

export const addAddress = async (req, res) => {
  const { name, userId, type, streetAddress, city, state, postalCode, country } = req.body;

  try {
    await new AddressModel({ userId, name, type, streetAddress, city, state, postalCode, country }).save();
    res.json({ ok: true, msg: "Address added successfully" });
  } catch (error) {
    res.render("user/error");
  }
};

export const removeAddress = async (req, res) => {
  try {
    const result = await AddressModel.findByIdAndDelete(req.params.id);

    if (!result) {
      return res.json({ ok: false, msg: "Address not found." });
    }

    res.json({ ok: true, msg: "Address removed successfully." });
  } catch (error) {
    res.status(500).json({ ok: false, msg: "An error occurred while removing the address." });
  }
};


export const updateAddress = async (req, res) => {
  try {
    const { name, addressId, type, streetAddress, city, state, postalCode, country } = req.body;

    const updatedAddress = await AddressModel.findByIdAndUpdate(
      addressId,
      { name, type, streetAddress, city, state, postalCode, country },
      { new: true }
    );

    if (!updatedAddress) {
      return res.status(404).json({ ok: false, msg: "Address not found" });
    }

    res.status(200).json({ ok: true, msg: "Address updated successfully" });
  } catch (error) {
    return res.render("user/error");
  }
};

export const getOrderReanderPage = async (req, res) => {
  const user = req.session.user;

  const wishlist = await Wishlist.findOne({ user: user._id });
  const WishlistQty = wishlist?.products ? [...new Set(wishlist.products)].length : 0;

  const cartItem = await CartModel.findOne({ userId: user._id }).populate("products.productId");
  const cartQty = cartItem?.products?.length || 0;

  req.session.cartQty = cartQty;
  req.session.WishlistQty = WishlistQty;

  const orders = await OrderModel.find({ user: user._id }).sort({ orderDate: -1 });

  res.render("user/orders", { WishlistQty, cartQty, user, orders });
};

export const removeOrders = async (req, res) => {
  const { id: orderId } = req.params;

  try {
    const order = await OrderModel.findById(orderId);
    if (!order) return res.status(404).json({ ok: false, msg: "Order not found." });
    if (order.isCanceld) return res.status(400).json({ ok: false, msg: "Order is already canceled." });

    const productUpdates = order.items.map(async (item) => {
      const product = await ProductModel.findById(item.productId);
      if (product) {
        const sizeUpdate = product.availableSize.find(sizeObj => sizeObj.size === item.size);
        if (sizeUpdate) sizeUpdate.stock += item.quantity;
        await product.save();
      }
    });

    await Promise.all(productUpdates);
    await OrderModel.findByIdAndUpdate(orderId, { isCanceld: true });

    return res.json({ ok: true, msg: "Order canceled successfully" });
  } catch (error) {
    return res.render("user/error");
  }
};

export const deletePerItemInOrder = async (req, res) => {
  const { orderId, productId } = req.params;
  const { size } = req.body;

  try {
    const order = await OrderModel.findById(orderId);
    if (!order) return res.json({ msg: 'Order not found' });

    const itemIndex = order.items.findIndex(i => i.productId.toString() === productId && i.size === parseInt(size));
    if (itemIndex === -1) return res.json({ msg: 'Item not found in the order.' });

    const item = order.items[itemIndex];

    const product = await ProductModel.findById(productId);
    if (product) {
      const sizeUpdate = product.availableSize.find(sizeObj => sizeObj.size === parseInt(size));
      if (sizeUpdate) sizeUpdate.stock += item.quantity;
      await product.save();
    }
    const itemTotal = item.price * item.quantity;
    order.totalAmount -= itemTotal;
    item.isCanceld = true;
  //  item.isReturned = true;
    if (order.items.every(i => i.isCanceld)) {
      order.isCanceld = true;
      order.totalAmount = 0;
    }
    let couponDiscountAmount = 0;
    if (order.couponId) {
      const coupon = await CouponModel.findById(order.couponId);
      if (coupon) {
        console.log("jfnbjfn");
        
        couponDiscountAmount = (order.totalAmount + itemTotal) * (coupon.discountValue / 100);
      }
    }
     console.log(couponDiscountAmount)
    const refundAmount = itemTotal - (couponDiscountAmount * (itemTotal / (order.totalAmount + itemTotal)));

    if (order.paymentStatus === "Paid") {
      const userId = order.user;
      let wallet = await WalletModel.findOne({ user: userId });

      if (!wallet) {
        wallet = new WalletModel({ user: userId, balance: 0 });
      }
      

      wallet.balance += refundAmount; 
      wallet.transactions.push({
        amount: refundAmount,
        transactionType: 'credit',
        description: `Refund for returned item in order ${product.name}`,
        size: item.size,
        qty: item.quantity,
        productId: item.productId,
        reason: 'Item return',
      });

      await wallet.save();
    }

    await order.save();

    res.status(200).json({
      msg: 'Item returned successfully, amount credited to wallet',
      totalAmount: order.totalAmount,
      allCanceled: order.items.every(i => i.isCanceld),
    });

    return true; 
  } catch (error) {
    console.error(error);
    res.render("user/error");
    return false; 
  }
};
