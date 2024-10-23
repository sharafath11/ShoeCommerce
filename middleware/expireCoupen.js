import { CategoryOffer } from "../models/categriesOffersModel.js";
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
export const disableCatOffer = async () => {
    try {
      const currentDate = new Date();
      const result = await CategoryOffer.updateMany(
        { expireDate: { $lt: currentDate }, isActive: true },
        { $set: { isActive: false } }
      );
  
      if (result.modifiedCount > 0) {
        console.log(`${result.modifiedCount} expired offers have been disabled.`);
      } else {
        console.log('No expired offers found.');
      }
    } catch (error) {
      console.error('Error disabling expired offers:', error);
    }
  };