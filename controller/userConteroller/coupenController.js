
import CouponModel from "../../models/coupenModel.js";
import OrderModel from "../../models/orderModel.js";


export const applyCoupen = async (req, res) => {
    const { code, orderTotal } = req.body; 
    const user = req.session.user;
  
    try {
      const coupon = await CouponModel.findOne({ code, isActive: true });
      if (!coupon) {
        return res.json({ ok: false, msg: 'Invalid or expired coupon code.' });
      }
      const orders = await OrderModel.find({ user: user._id });
      const isCouponUsed = orders.some(order => order.couponId && order.couponId.equals(coupon._id));
      if (isCouponUsed) {
        return res.json({ ok: false, msg: 'This coupon has already been used.' });
      }
      if (orderTotal < coupon.minimumPrice) {
        return res.json({
          ok: false,
          msg: `Coupon cannot be applied. Minimum order total should be ₹${coupon.minimumPrice}.`
        });
      }

      let newTotal;

if (coupon.discountType === "percentage") {
     let res=  (orderTotal * coupon.discountValue) / 100;
     newTotal=orderTotal-res
} else {
    newTotal = orderTotal - coupon.discountValue;
}

console.log('New Total:', newTotal);

        //zero nekalum velthano check cheyyan ann max il zero kodthe samja
      newTotal = Math.max(newTotal, 0);
      return res.status(200).json({
        ok: true,
        discountValue: coupon.discountValue,
        discountType: coupon.discountType,
        newTotal,
        msg: "Coupon applied successfully",
        coupon
      });
    } catch (error) {
      return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
  };
  
