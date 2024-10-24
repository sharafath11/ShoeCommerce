import mongoose from "mongoose";
import OrderModel from "../../models/orderModel.js";

export const returnOrders = async (req, res) => {
  const { orderId, productId, size, reason } = req.body;
  const user = req.session.user;

  try {
    const parsedSize = Number(size);
    const parsedProductId = new mongoose.Types.ObjectId(productId);

    const order = await OrderModel.findOne({
      _id: orderId,
      "items.productId": parsedProductId,
      "items.size": parsedSize,
      user: user._id,
    });

    if (!order) {
      return res.json({ ok: false, msg: "Order or product not found." });
    }

    let totalReduction = 0;

    order.items.forEach(item => {
      if (item.productId.equals(parsedProductId) && item.size === parsedSize && !item.isReturned) {
        item.isReturned = true;
        item.reason = reason;
        item.status = 'Pending';
        totalReduction += item.price * item.quantity;
      }
    });

    if (totalReduction > 0) {
      order.totalAmount -= totalReduction;
    }

    await order.save();

    return res.status(200).json({
      ok: true,
      msg: "Return request successfully submitted.",
      order,
    });
  } catch (error) {
    console.error("Error processing return:", error);
    return res.status(500).json({ message: "Error processing return." });
  }
};