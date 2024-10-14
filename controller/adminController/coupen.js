import CouponModel from "../../models/coupenModel.js";

export const coupenRender=async (req,res)=>{
    const coupons=await CouponModel.find({})
 res.render("admin/coupen",{coupons})
}
export const addCoupen = async (req, res) => {
    try {
        const { code, discountType, discountValue, startingDate, endingDate, minimumPrice} = req.body;
        if (!code || !discountType || !discountValue || !startingDate || !endingDate || !minimumPrice) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const existingCoupon = await CouponModel.findOne({ code });
        if (existingCoupon) {
            return res.status(400).json({ message: "Coupon code already exists" });
        }
        const newCoupon = new CouponModel({
            code,
            discountType,
            discountValue,
            startingDate,
            endingDate,
            minimumPrice
        });
        await newCoupon.save();
        res.status(201).json({ msg: "Coupon added successfully", ok: true, coupon: newCoupon });
    } catch (error) {
        res.status(500).json({ ok: false, msg: "Error adding coupon", error: error.message });
    }
};

export const coupenUpdate = async (req, res) => {
    const {_id, code, discountType, discountValue, minimumPrice, startingDate, endingDate, isActive } = req.body; // Changed expiryDate to endingDate
    
    console.log('====================================');
    console.log("Starting Date:", startingDate, "Ending Date:", endingDate); // Added logging for clarity
    console.log('====================================');

    // Convert string dates to Date objects for comparison
    const startingDateObj = new Date(startingDate);
    const endingDateObj = new Date(endingDate); // Changed expiryDate to endingDate

    // Debugging: log the dates for validation
    // console.log('====================================');
    // console.log("Starting Date Object:", startingDateObj);
    // console.log("Ending Date Object:", endingDateObj);
    // console.log('====================================');

    // Server-side validation checks
    if (startingDateObj >= endingDateObj) { // Changed expiryDateObj to endingDateObj
        return res.status(400).json({ error: "Ending Date must be after Starting Date!" });
    }
    
    if (discountType === 'fixed' && minimumPrice < discountValue) {
        return res.status(400).json({ error: "Minimum Price must be greater than or equal to Discount Value!" });
    }

    try {
        // Update the coupon in the database
        const updatedCoupon = await CouponModel.findOneAndUpdate(
            { _id },
            { 
                code,
                discountType, 
                discountValue, 
                minimumPrice, 
                startingDate: startingDateObj,
                endingDate: endingDateObj, // Use endingDateObj here
                isActive 
            },
            { new: true, runValidators: true }
        );

        if (!updatedCoupon) {
            return res.status(404).json({ error: "Coupon not found!" });
        }

        return res.status(200).json({ message: "Coupon updated successfully!", coupon: updatedCoupon });
    } catch (error) {
        console.error('Error updating coupon:', error);
        return res.status(500).json({ error: "Error updating coupon!" });
    }
};


