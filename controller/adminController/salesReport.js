
import OrderModel from "../../models/orderModel.js";
import ProductModel from "../../models/prodectsModel.js";
export const saleReport = async (req, res) => {
    try {
        // Fetch all orders and populate user and coupon details
        const orders = await OrderModel.find()
            .populate('user', 'username')
            .populate('couponId')
            .exec();

        // Fetch product details for each order item
        for (let order of orders) {
            await Promise.all(order.items.map(async item => {
                const product = await ProductModel.findById(item.productId);
                if (!product) {
                    console.error(`Product not found for ID: ${item.productId}`);
                    return; // Skip if product not found
                }
                item.productDetails = product; // Add product details to each item
                item.originalPrice = product.price; // Original price
                item.offerPrice = product.price - (product.price * (product.discountApplied / 100)); // Calculate offer price
                item.priceDifference = item.originalPrice - item.offerPrice; // Calculate the price difference
            }));
        }

        console.log('====================================');
        console.log(orders[0].items);
        console.log('====================================');
        
        // Render the EJS template with the fetched orders
        res.render('admin/salesReport', { orders });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};
