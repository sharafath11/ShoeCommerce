import coupenModel from '../../models/coupenModel.js';

export const applyCoupen = async (req, res) => {
    const { code, orderTotal } = req.body; // Make sure to send orderTotal from the frontend

    try {
        const coupon = await coupenModel.findOne({ code, isActive: true });

        if (!coupon) {
            return res.status(400).json({ message: 'Invalid or expired coupon code.' });
        }

        let newTotal = orderTotal; // Initialize new total with the current order total

        // Calculate the new total based on the coupon type
        if (coupon.discountType === "fixed") {
            newTotal -= coupon.discountValue; // Deduct fixed amount
        } else if (coupon.discountType === "percentage") {
            newTotal -= (orderTotal * coupon.discountValue) / 100; // Deduct percentage
        }

        // Ensure the new total does not drop below zero
        if (newTotal < 0) {
            newTotal = 0;
        }

        return res.status(200).json({
            discountValue: coupon.discountValue,
            discountType: coupon.discountType,
            newTotal, // Send the new total back to the frontend
        });
    } catch (error) {
        console.error('Error applying coupon:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
}
