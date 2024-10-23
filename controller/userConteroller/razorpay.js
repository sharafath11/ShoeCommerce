import Razorpay from "razorpay";
import crypto from 'crypto';
import OrderModel from "../../models/orderModel.js";
import ProductModel from "../../models/prodectsModel.js";
import CartModel from "../../models/cartModel.js";
import { log } from "console";

const razorpayI = new Razorpay({
    key_id:process.env.RKEY_ID,
    key_secret: process.env.RKEY_SECRET,
});
export const createOrder = async (req, res) => {
    try {
      const { amount, currency = 'INR', receipt, selectedAddresses, cartItems, couponId } = req.body;
      const userId = req.session.user._id;
      const selectedAddress = selectedAddresses[0];
  
      const orderItems = cartItems.map(item => ({
        productId: item.productId,
        name: item.name,
        size: item.size,
        description: item.description,
        imageUrl: item.imageUrl,
        price: item.price,
        quantity: item.quantity,
        paymentMethod: "Razorpay"
      }));
  
      let totalAmount = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
      let finalAmount = totalAmount + 50; 
  
      let coupon = null;
      if (couponId && mongoose.Types.ObjectId.isValid(couponId)) {
        coupon = await CouponModel.findById(couponId);
        if (!coupon || !coupon.isActive) {
          return res.status(400).json({ ok: false, msg: "Invalid or inactive coupon." });
        }
        if (finalAmount < coupon.minimumAmount) {
          return res.status(400).json({ msg: `Coupon cannot be applied. Minimum order total should be ₹${coupon.minimumAmount}.` });
        }
        if (coupon.discountType === "fixed") {
          finalAmount -= coupon.discountValue;
        } else if (coupon.discountType === "percentage") {
          finalAmount -= (totalAmount * coupon.discountValue) / 100;
        }
        if (finalAmount < 0) finalAmount = 0;
      }
  
      for (const item of orderItems) {
        const product = await ProductModel.findById(item.productId);
        if (!product) {
          return res.json({ ok: false, msg: "Product not found" });
        }
  
        const sizeVariantIndex = product.availableSize.findIndex(size => size.size === item.size);
        if (sizeVariantIndex === -1) {
          return res.json({ ok: false, msg: `Size ${item.size} not found` });
        }
  
        const sizeVariant = product.availableSize[sizeVariantIndex];
        if (sizeVariant.stock < item.quantity) {
          return res.json({ ok: false, msg: `Insufficient stock for size ${item.size}` });
        }
  
        sizeVariant.stock -= item.quantity;
        await product.save();
      }
  
      const razorpayOrder = await razorpayI.orders.create({
        amount: finalAmount * 100, 
        currency,
        receipt: receipt || `order_rcptid_${new Date().getTime()}`
      });
      function generateOrderId() {
        return 'OP-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      }
      const OP = generateOrderId();
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
        orderId: OP,
        totalAmount: finalAmount,
        couponId: coupon ? coupon._id : null,
        paymentMethod: 'Razorpay',
        paymentStatus: 'Pending',
        razorpayOrderId: razorpayOrder.id
      });
  
      const savedOrder = await newOrder.save();
      await CartModel.deleteOne({ userId });
      req.session.cartQty=0;
      res.status(201).json({
        success: true,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        order: savedOrder,
      });
  
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ ok: false, msg: 'Failed to create order' });
    }
  };
  

  export const verifyRazorpay = async (req, res) => {
    try {
      const { paymentId, orderId, signature } = req.body;

      // Create HMAC for payment verification
      const hmac = crypto.createHmac('sha256', process.env.RKEY_SECRET);
      hmac.update(orderId + "|" + paymentId);
      const generatedSignature = hmac.digest('hex');
  
      if (generatedSignature === signature) {
        // If the signature matches, update payment status to 'Paid'
        const updatedOrder = await OrderModel.findOneAndUpdate(
          { razorpayOrderId: orderId },
          { paymentStatus: 'Paid' },
          { new: true }
        );
       
      
        if (!updatedOrder) {
          return res.status(404).json({ ok: false, msg: 'Order not found' });
        }
        return res.json({ ok: true, msg: 'Payment verified and updated successfully!', order: updatedOrder, red: "/orders" });
      } else {
        
        await OrderModel.findOneAndUpdate(
          { razorpayOrderId: orderId },
          { paymentStatus: 'Failed' }
        );
  
        return res.json({ ok: false, msg: 'Payment verification failed. Order status updated to "Failed".' });
      }
    } catch (error) {
      console.error('Error verifying Razorpay payment:', error);
      await OrderModel.findOneAndUpdate(
        { razorpayOrderId: req.body.orderId },
        { paymentStatus: 'Failed' }
      );
  
      return res.json({ ok: false, msg: 'Internal Server Error. Order status updated to "Failed".' });
    }
  };
  export const retryPayment = async (req, res) => {
    try {
      const { orderId } = req.body; // Get orderId from the request body
      
      // Find the order from the database
      const order = await OrderModel.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      // Prepare the order details for retrying the payment
      const paymentDetails = {
        amount: order.totalAmount * 100, // Razorpay expects the amount in paise (multiply by 100 if in INR)
        currency: 'INR', // Currency, assuming INR, you can set dynamically
        receipt: `receipt_order_${orderId}`, // Unique receipt ID for tracking
        payment_capture: 1, // Auto-capture payment after authorization
      };
  
      // Create a new Razorpay order
      const razorpayOrder = await razorpayI.orders.create(paymentDetails);
    
      res.status(200).json({
        amount: razorpayOrder.amount, // Amount in the smallest currency unit (e.g., paise)
        currency: razorpayOrder.currency, // Currency code
        newOderId: razorpayOrder.id, // New Razorpay order ID
      });
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      res.status(500).json({ message: 'Failed to retry payment. Please try again later.' });
    }
  };
  export const verifyRetryPayment = async (req, res) => {
    try {
      const { paymentId, orderId, signature ,id} = req.body; // Extract payment details from the request
  
      if (!paymentId || !orderId || !signature) {
        return res.status(400).json({ ok: false, msg: 'Missing required fields' });
      }
  
      // Fetch the existing order from the database using the new Razorpay order ID
      const order = await OrderModel.findOne({ _id: id });
      console.log('====================================');
      console.log(order,orderId);
      console.log('====================================');
      if (!order) {
        return res.status(404).json({ ok: false, msg: 'Order not found' });
      }
  
      // Create HMAC for payment verification
      const hmac = crypto.createHmac('sha256', process.env.RKEY_SECRET);
      hmac.update(`${orderId}|${paymentId}`);
      const generatedSignature = hmac.digest('hex');
  
      if (generatedSignature === signature) {
        // If the signature matches, update the order's payment status to 'Paid'
        const updatedOrder = await OrderModel.findOneAndUpdate(
          { _id: id },  // Use `_id` to find the order by its unique MongoDB ID
          { paymentStatus: 'Paid' },  // Update the payment status to 'Paid'
          { new: true }  // Return the updated document
        );
        

        if (!updatedOrder) {
          return res.status(404).json({ ok: false, msg: 'Order update failed' });
        }

        return res.status(200).json({
          ok: true,
          msg: 'Retry payment verified and order updated successfully!',
          order: updatedOrder,
          redirect: '/orders', 
        });
      } else {
        await OrderModel.findOneAndUpdate(
          { razorpayOrderId: orderId },
          { paymentStatus: 'Failed' }
        );
  
        return res.status(400).json({
          ok: false,
          msg: 'Payment verification failed. Order status updated to "Failed".'
        });
      }
    } catch (error) {
      console.error('Error verifying retried payment:', error);
      await OrderModel.findOneAndUpdate(
        { razorpayOrderId: req.body.newOrderId },
        { paymentStatus: 'Failed' }
      );
  
      return res.status(500).json({
        ok: false,
        msg: 'Internal Server Error. Order status updated to "Failed".'
      });
    }
  };
 
  