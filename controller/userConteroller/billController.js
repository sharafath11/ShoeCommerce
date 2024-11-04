import OrderModel from "../../models/orderModel.js";


export const billContoller=async(req,res)=>{
    try {
        const orderId = req.params.orderId;
        const order = await OrderModel.findById(orderId);
    
        if (!order) {
          return res.status(404).send("Order not found");
        }
        res.render('user/bill', { order });
      } catch (error) {
        console.error("Error fetching shop details:", error);
        return res.render("user/error");
      }
}