import OrderModel from "../../models/orderModel.js";
import WalletModel from "../../models/wallet.js";


  
export const orderReturnAccept = async (req, res) => {
    try {
        const { orderId, itemName, reason, price, size, qty, productId } = req.body;

        if (!orderId || !itemName || !reason || !price || !size || !qty || !productId) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const order = await OrderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        const item = order.items.find(item => 
            item.productId.toString() === productId && 
            item.size === Number(size) && 
            item.isReturned === true
        );

        if (!item) {
            return res.status(404).json({ message: 'Returned item not found in the order.' });
        }

        item.status = 'Approved';

        const wallet = await WalletModel.findOne({ user: order.user });
        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found for the user.' });
        }

        wallet.balance += Number(price);
        wallet.transactions.push({
            amount: price,
            transactionType: 'credit',
            description: `Return accepted for ${itemName}`,
            size,
            qty,
            productId: item.productId,
            date: new Date(),
            reason,
        });

        await wallet.save();
        await order.save();

        return res.status(200).json({ message: 'Return accepted, order item status updated, and wallet updated.' });

    } catch (error) {
        console.error("Error accepting return:", error);
        return res.status(500).json({ message: 'Error accepting return.' });
    }
};
export const orderReturnReject = async (req, res) => {
    try {
        const { orderId, itemName, size, qty, productId } = req.body;
        if (!orderId || !itemName  || !size || !qty || !productId) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const order = await OrderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        const item = order.items.find(item => 
            item.productId.toString() === productId && 
            item.size === Number(size) && 
            item.isReturned === true
        );

        if (!item) {
            return res.status(404).json({ message: 'Returned item not found in the order.' });
        }

        item.status = 'Rejected';
        await order.save(); 

        return res.status(200).json({ message: 'Return rejected and item status updated.' });

    } catch (error) {
        console.error("Error rejecting return:", error);
        return res.status(500).json({ message: 'Error rejecting return.' });
    }
};

