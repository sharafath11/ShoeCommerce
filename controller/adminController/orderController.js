import OrderModel from "../../models/orderModel.js";

export const getOrders = async (req, res) => {
  const orders = await OrderModel.find({ isCanceld: false }).sort({ orderDate: -1 });
  res.render("admin/orders", { orders });
};
export const updateOrder = async (req, res) => {
  const { orderStatus, orderId } = req.body;

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
export const orderCnc=async(req,res)=>{
  const canceldOrders=(await OrderModel.find()).filter((item)=>item.isCanceld)
  res.render("admin/canceldOrders",{orders:canceldOrders})
}
export const SingleOrder=async(req,res)=>{
  const orederId=req.params.id
  const order = await OrderModel.findById(orederId);
  const ordersArray = order ? [order] : [];

  
  res.render("admin/SingleOrder",{orders:ordersArray})
}