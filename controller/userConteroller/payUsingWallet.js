import CartModel from "../../models/cartModel.js";
import OrderModel from "../../models/orderModel.js";
import ProductModel from "../../models/prodectsModel.js";
import WalletModel from "../../models/wallet.js";

export const payWithWallet = async (req, res) => {
  const { orderDetails } = req.body;
  let { amount, cartItems, selectedAddresses, coupenId } = orderDetails;

  try {
    if (selectedAddresses[0].zip) {
      selectedAddresses[0].postalCode = selectedAddresses[0].zip;
      delete selectedAddresses[0].zip;
    }

    if (
      !selectedAddresses[0].country ||
      !selectedAddresses[0].postalCode ||
      !selectedAddresses[0].state ||
      !selectedAddresses[0].city ||
      !selectedAddresses[0].streetAddress ||
      !selectedAddresses[0].type
    ) {
      return res.json({ ok: false, msg: 'Incomplete address details.' });
    }

    const wallet = await WalletModel.findOne({ user: req.session.user._id });
    
    if (!wallet) {
      return res.json({ ok: false, msg: 'Wallet not found.' });
    }

    const orderTotal = Number(amount);
    
    if (wallet.balance < orderTotal) {
      return res.json({ ok: false, msg: 'Insufficient wallet balance.' });
    }

    let totalOriginalPrice = 0;
    let categoryDiscountValue = 0;

    for (const item of cartItems) {
      const product = await ProductModel.findById(item.productId);

      if (!product) {
        return res.json({ ok: false, msg: `Product not found for item ${item.name}`, red: "/cart" });
      }

      const sizeVariantIndex = product.availableSize.findIndex(size => size.size === item.size);
      if (sizeVariantIndex === -1) {
        return res.json({ ok: false, msg: `Size ${item.size} not found for product ${item.name}`, red: "/cart" });
      }

      const sizeVariant = product.availableSize[sizeVariantIndex];
      if (sizeVariant.stock < item.quantity) {
        return res.json({ ok: false, msg: `Insufficient stock for size ${item.size}`, red: "/cart" });
      }
      sizeVariant.stock -= item.quantity;
      await product.save();
      totalOriginalPrice += product.originalPrice * item.quantity;
      const discountAmount = (product.originalPrice * (product.discountApplied / 100)) * item.quantity;
      categoryDiscountValue += discountAmount;
    }
    function generateOrderId() {
      return 'WLT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    const orderId = generateOrderId();
    const newOrder = new OrderModel({
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
        type: selectedAddresses[0].type,
        streetAddress: selectedAddresses[0].streetAddress,
        city: selectedAddresses[0].city,
        state: selectedAddresses[0].state,
        postalCode: selectedAddresses[0].postalCode,
        country: selectedAddresses[0].country,
      },
      totalAmount: orderTotal,
      totelOrginalPrice:totalOriginalPrice, 
      categoryDiscountValue, 
      paymentMethod: 'Wallet',
      paymentStatus: 'Paid',
      coupenId
    });

    await newOrder.save();
    wallet.balance -= parseInt(orderTotal);

    wallet.transactions.push({
      amount: orderTotal,
      transactionType: 'debit',
      description: 'Order payment',
      productId: cartItems[0].productId,
      reason: 'Payment for order',
      size: cartItems[0].size,
      qty: cartItems[0].quantity
    });

    await wallet.save();
    await CartModel.deleteOne({ userId: req.session.user._id });

    return res.json({ ok: true, msg: "Order placed successfully!", red: "/orders" });

  } catch (error) {
    console.error('Payment processing error:', error);
    return res.json({ ok: false, msg: 'An error occurred while processing the payment. Please try again.' });
  }
};
