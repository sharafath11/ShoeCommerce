import OrderModel from "../../models/orderModel.js";

export const getOrders = async (req, res) => {
  const orders = await OrderModel.find().sort({ createdAt: -1 });
  res.render("admin/orders", { orders });
};
export const updateOrder = async (req, res) => {
  const { orderStatus, orderId } = req.body;
 console.log('====================================');
 console.log(orderStatus, orderId);
 console.log('====================================');
  try {
    const updatedOrder = await OrderModel.findByIdAndUpdate(
      orderId,
      { status: orderStatus },
      { new: true }
    );

    res.json({
      ok: true,
      msg: "Order updated successfully",
      status:orderStatus
      
    });
  } catch (error) {
    console.error(error);
    res.json({
      ok: false,
      msg: "Failed to update order",
    });
  }
};
