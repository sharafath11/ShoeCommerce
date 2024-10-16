import { categoryModel } from "../../models/category.js";
import { CategoryOffer } from "../../models/categriesOffersModel.js";
import ProductModel from "../../models/prodectsModel.js";


export const renderOffersPage = async (req, res) => {
  try {
    const categories = await categoryModel.find();
    const offers = await CategoryOffer.find().populate("categoryId");
    res.render("admin/offers", { categories, offers });
  } catch (error) {
    console.error("Error fetching offers or categories:", error);
    res.status(500).send("Internal Server Error");
  }
};

export const addCoffers = async (req, res) => {
  const { title, description, discount, category, startDate, endDate, isActive } = req.body;

  if (!title || !description || discount === undefined || !category || !startDate || !endDate) {
      return res.json({ ok: false, msg: 'All fields are required.' });
  }

  try {
      const newOffer = new CategoryOffer({
          title,
          description,
          discount,
          categoryId: category,
          startDate,
          expireDate: endDate,
          isActive,
      });

      await newOffer.save();

      const products = await ProductModel.find({ categoryId: category });

      if (!products.length) {
          return res.json({ ok: true, msg: 'Offer added, but no products found in the category.' });
      }

      const updates = products.map(product => {
          if (isActive) {
              const originalPrice = product.originalPrice || product.price;
              const discountedPrice = Math.round(originalPrice - originalPrice * (discount / 100));


              return ProductModel.updateOne(
                  { _id: product._id },
                  {
                      price: discountedPrice,
                      originalPrice,
                      discountApplied: discount
                  }
              );
          } else {
              return ProductModel.updateOne(
                  { _id: product._id },
                  {
                      discountApplied: 0
                  }
              );
          }
      });

      await Promise.all(updates);

      const message = isActive
          ? 'Offer added and products updated with discounts successfully!'
          : 'Offer added but is not active, discounts removed from products.';

      res.status(201).json({ ok: true, msg: message, offer: newOffer });
  } catch (error) {
      console.error("Error adding offer:", error);
      res.status(500).json({ msg: 'Server error. Please try again later.' });
  }
};


export const editCoffers = async (req, res) => {
  const offerId = req.params.id;
  const {
    title,
    description,
    discount,
    category,
    startDate,
    endDate,
    isActive,
  } = req.body;

  try {
    const updatedOffer = await CategoryOffer.findByIdAndUpdate(
      offerId,
      {
        title,
        description,
        discount:parseInt(discount)  ,
        categoryId: category,
        startDate: new Date(startDate),
        expireDate: new Date(endDate),
        isActive,
      },
      { new: true }
    );

    const products = await ProductModel.find({ categoryId: category });

    if (!products.length) {
      return res.json({
        ok: true,
        msg: "Offer updated, but no products found in the category.",
      });
    }

    const updates = products.map((product) => {
      if (isActive) {
        // Apply discount if the offer is active
        const originalPrice = product.originalPrice || product.price;
        const discountedPrice = Math.round(originalPrice - originalPrice * (discount / 100));

    
        return ProductModel.updateOne(
          { _id: product._id },
          {
            price: parseInt(discountedPrice),
            originalPrice,
            discountApplied: discount,
          }
        );
      } else {
        const originalPrice = product.originalPrice || product.price; 
    
        return ProductModel.updateOne(
          { _id: product._id },
          {
            price: originalPrice,  
            discountApplied: 0,    
          }
        );
      }
    });

    await Promise.all(updates);

    const message = isActive
      ? "Offer updated and discounts applied to products."
      : "Offer updated, but it is not active, discounts removed from products.";

    res.json({
      ok: true,
      msg: message,
    });
  } catch (error) {
    console.error("Error updating offer:", error);
    res.status(500).json({ ok: false, msg: "Error updating offer" });
  }
};
