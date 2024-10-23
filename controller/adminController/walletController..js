import OrderModel from "../../models/orderModel.js";
import WalletModel from "../../models/wallet.js";



export const orderReturnAccept = async (req, res) => {
    try {
        // Destructure values from request body
        const { orderId, itemName, reason, price, size, qty } = req.body;

        // Validate input
        if (!orderId || !itemName || !reason || !price || !size || !qty) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Find the order to ensure it exists
        const order = await OrderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        // Find the user's wallet
        const wallet = await WalletModel.findOne({ user: order.user }); // Assuming order.user is the user ID

        // If wallet does not exist, create one (optional)
        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found for the user.' });
        }

        // Update the wallet balance
        wallet.balance += price;

        // Record the transaction
        wallet.transactions.push({
            amount: price,
            transactionType: 'credit',
            description: `Return accepted for ${itemName}`,
            size, // Add size from the request
            qty,  // Add qty from the request
            productId: order.items.find(item => item.name === itemName)._id, // Find product ID based on item name
            status: 'approved',
            date:new Date(),
            reason: reason,
        });

        // Save the updated wallet
        await wallet.save();

        return res.status(200).json({ message: 'Return accepted and wallet updated.' });

    } catch (error) {
        console.error("Error accepting return:", error);
        return res.status(500).json({ message: 'Error accepting return.' });
    }
};
