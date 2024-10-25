
import OrderModel from "../../models/orderModel.js";
import ProductModel from "../../models/prodectsModel.js";
export const saleReport = async (req, res) => {
    try {
        // Fetch all orders and populate user and coupon details
        const orders = await OrderModel.find()
        .populate('user', 'username')
        .populate('couponId')
        .sort({ orderDate: -1 }) // Sort by orderDate in descending order
        .exec();
      
       
       console.log(orders);
       
        res.render('admin/salesReport', { orders });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};
