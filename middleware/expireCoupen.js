import { CategoryOffer } from "../models/categriesOffersModel.js";
import CouponModel from "../models/coupenModel.js";
import ProductModel from "../models/prodectsModel.js";
import { productOfferModel } from "../models/productOffer.js";
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
export const disableCatOffer = async (req, res) => {
  try {
      const currentDate = new Date();
      const expiredOffers = await CategoryOffer.find(
          { expireDate: { $lt: currentDate }, isActive: true }
      );

      if (expiredOffers.length > 0) {
          await CategoryOffer.updateMany(
              { expireDate: { $lt: currentDate }, isActive: true },
              { $set: { isActive: false } }
          );
          console.log(`${expiredOffers.length} expired offers have been disabled.`);
          for (const offer of expiredOffers) {
              const filter = offer.categoryId ? { categoryId: offer.categoryId } : {};
              
              await ProductModel.updateMany(filter, {
                  $set: {
                      price: "$originalPrice",
                      discountApplied: 0
                  }
              });
          }
          console.log("Product prices have been reset for expired category offers.");
      } else {
          console.log('No expired offers found.');
      }
  } catch (error) {
      console.error('Error disabling expired offers:', error);
  }
};

  export const couponActiveWithDate = async () => {
    try {
        const currentDate = new Date();
        const result = await CouponModel.updateMany(
            {
                startingDate: { $lte: currentDate }, 
                endingDate: { $gte: currentDate }, 
                isActive: false 
            },
            { $set: { isActive: true } }
        );

        console.log(`${result.modifiedCount} coupons have been activated.`);
    } catch (error) {
        console.error('Error updating active coupons:', error);
    }
};
export const activateCategoryOffers = async () => {
  try {
      const currentDate = new Date();
      const offersToActivate = await CategoryOffer.find(
          {
              startDate: { $lte: currentDate },
              expireDate: { $gte: currentDate },
              isActive: false
          }
      );

      if (offersToActivate.length > 0) {
          await CategoryOffer.updateMany(
              {
                  startDate: { $lte: currentDate },
                  expireDate: { $gte: currentDate },
                  isActive: false
              },
              { $set: { isActive: true } }
          );
          console.log(`${offersToActivate.length} category offers have been activated.`);

          for (const offer of offersToActivate) {
              const filter = offer.categoryId ? { categoryId: offer.categoryId } : {};
              const products = await ProductModel.find(filter);

              for (const product of products) {
                  const originalPrice = product.originalPrice || product.price;
                  const discountedPrice = Math.round(originalPrice - originalPrice * (offer.discount / 100));

                  await ProductModel.updateOne(
                      { _id: product._id },
                      {
                          price: discountedPrice,
                          originalPrice,
                          discountApplied: offer.discount
                      }
                  );
              }
          }
          console.log("Product prices have been updated with active category offers.");
      } else {
          console.log('No category offers found for activation.');
      }
  } catch (error) {
      console.error('Error activating category offers:', error);
  }
};
export const productOfferEnabeDisable = async () => {
    const currentDate = new Date();
  
    try {
      const offers = await productOfferModel.find();
  
      for (const offer of offers) {
        const isActive = currentDate >= offer.startDate && currentDate <= offer.endDate;
        await productOfferModel.findByIdAndUpdate(offer._id, { isActive }, { new: true });
  
        const product = await ProductModel.findById(offer.products);
        const originalPrice = Number(product.originalPrice || product.price);  
  
        if (isActive) {
          const discountedPrice = originalPrice - (originalPrice * (offer.discountPercentage / 100));
          await ProductModel.findByIdAndUpdate(offer.products, {
            price: Math.floor(discountedPrice),
            discountApplied: offer.discountPercentage,
          });
        } else {
          await ProductModel.findByIdAndUpdate(offer.products, {
            price: originalPrice, 
            discountApplied: 0,
          });
        }
      }
  
      return { message: "Offers updated based on current date" };
    } catch (error) {
      console.error("Error updating offers:", error);
      throw new Error("Internal server error");
    }
  };