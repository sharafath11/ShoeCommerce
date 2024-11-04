import mongoose from "mongoose";
import CartModel from "../../models/cartModel.js";
import OrderModel from "../../models/orderModel.js";
import ProductModel from "../../models/prodectsModel.js";
import WalletModel from "../../models/wallet.js";
import CouponModel from "../../models/coupenModel.js";


export const payWithWallet = async (req, res) => {
  const { orderDetails } = req.body;
  let { amount, cartItems, selectedAddresses, coupenId } = orderDetails;

  try {
    const selectedAddress = selectedAddresses[0];
    if (selectedAddress.zip) {
      selectedAddress.postalCode = selectedAddress.zip;
      delete selectedAddress.zip;
    }

    if (
      !selectedAddress.country ||
      !selectedAddress.postalCode ||
      !selectedAddress.state ||
      !selectedAddress.city ||
      !selectedAddress.streetAddress ||
      !selectedAddress.type
    ) {
      return res.json({ ok: false, msg: 'Incomplete address details.' });
    }

    const wallet = await WalletModel.findOne({ user: req.session.user._id });
    if (!wallet) {
      return res.json({ ok: false, msg: 'Wallet not found.' });
    }

    let totalOriginalPrice = 0;
    let categoryDiscountValue = 0;
    let finalAmount = Number(amount);
    let couponDiscount = 0;

    let isValidCoupon = coupenId && mongoose.Types.ObjectId.isValid(coupenId);
    if (isValidCoupon) {
      const coupon = await CouponModel.findById(coupenId);
      if (!coupon || !coupon.isActive) {
        return res.json({ ok: false, msg: 'Invalid or inactive coupon.', red: '/cart' });
      }
      if (finalAmount < coupon.minimumAmount) {
        return res.json({
          message: `Coupon requires a minimum total of ₹${coupon.minimumAmount}.`
        });
      }
      if (coupon.discountType === 'fixed') {
        finalAmount -= coupon.discountValue;
        couponDiscount = coupon.discountValue;
      } else if (coupon.discountType === 'percentage') {
        couponDiscount = (finalAmount * coupon.discountValue) / 100;
        finalAmount -= couponDiscount;
      }
      if (finalAmount < 0) finalAmount = 0;
    }

    if (wallet.balance < finalAmount) {
      return res.json({ ok: false, msg: 'Insufficient wallet balance.' });
    }

    for (const item of cartItems) {
      const product = await ProductModel.findById(item.productId);
      if (!product) {
        return res.json({ ok: false, msg: `Product not found: ${item.name}`, red: '/cart' });
      }

      const sizeVariant = product.availableSize.find(size => size.size === item.size);
      if (!sizeVariant || sizeVariant.stock < item.quantity) {
        return res.json({ ok: false, msg: `Insufficient stock for ${item.size} in ${item.name}`, red: '/cart' });
      }

      sizeVariant.stock -= item.quantity;
      await product.save();
      totalOriginalPrice += product.originalPrice * item.quantity;
      const discountAmount = (product.originalPrice * (product.discountApplied / 100)) * item.quantity;
      categoryDiscountValue += discountAmount;
    }

    const orderId = 'WLT-' + Math.random().toString(36).substr(2, 9).toUpperCase();

 
    const newOrderData = {
      user: req.session.user._id,
      orderId,
      items: cartItems.map(item => ({
        productId: item.productId,
        name: item.name,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        total: item.total
      })),
      address: {
        type: selectedAddress.type,
        streetAddress: selectedAddress.streetAddress,
        city: selectedAddress.city,
        state: selectedAddress.state,
        postalCode: selectedAddress.postalCode,
        country: selectedAddress.country,
      },
      totalAmount: Math.round(finalAmount),
      totelOrginalPrice: totalOriginalPrice,
      totelDiscountValue: totalOriginalPrice - amount,
      categoryDiscountValue,
      coupenValue: couponDiscount,
      paymentMethod: 'Wallet',
      paymentStatus: 'Paid',
    };
    if (isValidCoupon) {
      newOrderData.couponId = coupenId;
    }

    const newOrder = new OrderModel(newOrderData);
    await newOrder.save();

    wallet.balance -= finalAmount;
    wallet.transactions.push({
      amount: finalAmount,
      transactionType: 'debit',
      description: 'Order payment',
      productId: cartItems[0].productId,
      reason: 'Payment for order',
      size: cartItems[0].size,
      qty: cartItems[0].quantity
    });
    await wallet.save();

    await CartModel.deleteOne({ userId: req.session.user._id });

    return res.json({ ok: true, msg: 'Order placed successfully!', red: '/orders' });
  } catch (error) {
    console.error('Error in payWithWallet:', error);
    return res.json({ ok: false, msg: 'An error occurred while processing the payment. Please try again.' });
  }
};
