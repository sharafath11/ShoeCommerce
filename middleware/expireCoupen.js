import CouponModel from "../models/coupenModel.js";

export const disableExpiredCoupons = async () => {
    try {
        const currentDate = new Date();
        await CouponModel.updateMany(
            { endingDate: { $lt: currentDate }, isActive: true },
            { $set: { isActive: false } }
        );
        console.log('Expired coupons have been disabled.');
    } catch (error) {
        console.error('Error disabling expired coupons:', error);
    }
};