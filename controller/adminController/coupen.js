import CouponModel from "../../models/coupenModel.js";

export const coupenRender=async (req,res)=>{
    const coupons=await CouponModel.find({})
 res.render("admin/coupen",{coupons})
}
export const addCoupen = async (req, res) => {
    try {
        const { name,code, discountType, discountValue, startingDate, endingDate, minimumPrice} = req.body;

        if (!code || !discountType || !discountValue || !startingDate || !endingDate || !minimumPrice ||!name) {
            return res.json({ msg: "All fields are required" });
        }
        const existingCoupon = await CouponModel.findOne({ code });
        if (existingCoupon) {
            return res.json({ msg: "Coupon code already exists" });
        }
        if (discountType === "percentage" && discountValue> 99) {
          return res.json({ ok: false, msg: "Discount cannot exceed 99%" });
        }
      
        const newCoupon = new CouponModel({
            code,
            name,
            discountType,
            discountValue,
            startingDate,
            endingDate,
            minimumPrice
        });
        await newCoupon.save();
        res.json({ msg: "Coupon added successfully", ok: true, coupon: newCoupon });
    } catch (error) {
        res.status(500).json({ ok: false, msg: "Error adding coupon", error: error.message });
    }
};
export const coupenUpdate = async (req, res) => {
    const { _id, code, discountType, discountValue, minimumPrice, startingDate, endingDate, isActive, name } = req.body;
  
    const startingDateObj = new Date(startingDate);
    const endingDateObj = new Date(endingDate);
  
    if (startingDateObj >= endingDateObj) {
      return res.json({ error: "Ending Date must be after Starting Date!" });
    }
  
    if (new Date() > endingDateObj) {
        return res.json({ ok:false,msg: "Current date cannot be greater than Ending Date!" });
      }
  
    const discountValueNum = Number(discountValue);
    const minimumPriceNum = Number(minimumPrice);
    if (discountType === "percentage" && discountValue> 99) {
      return res.json({ ok: false, msg: "Discount cannot exceed 99%" });
    }
    if (discountType === 'fixed' && minimumPriceNum < discountValueNum) {
      return res.json({ok:false, msg: "Minimum Price must be greater than or equal to Discount Value!" });
    }
  
    try {
      const existingCoupon = await CouponModel.findOne({ code, _id: { $ne: _id } });
      if (existingCoupon) {
        return res.json({ ok: false, msg: "Coupon code already exists!" });
      }
  
      const updatedCoupon = await CouponModel.findOneAndUpdate(
        { _id },
        {
          code,
          name,
          discountType,
          discountValue: discountValueNum,
          minimumPrice: minimumPriceNum,
          startingDate: startingDateObj,
          endingDate: endingDateObj,
          isActive
        },
        { new: true, runValidators: true }
      );
  
      if (!updatedCoupon) {
        return res.json({ ok: false, msg: "Coupon not found!" });
      }
  
      return res.status(200).json({ ok: true, msg: "Coupon updated successfully!", coupon: updatedCoupon });
    } catch (error) {
      return res.status(500).json({ error: "Error updating coupon!" });
    }
  };
  
  

