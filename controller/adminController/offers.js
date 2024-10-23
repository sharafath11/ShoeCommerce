import { categoryModel } from "../../models/category.js";
import { CategoryOffer } from "../../models/categriesOffersModel.js";
import ProductModel from "../../models/prodectsModel.js";


export const renderOffersPage = async (req, res) => {
  try {
      const categories = await categoryModel.find();
      
      // Get category and isActive from query parameters
      const { category, isActive } = req.query;

      // Prepare filter for offers based on the category and isActive status
      const filter = {};

      if (category) {
          filter.categoryId = category;
      }

      if (isActive) {
          filter.isActive = isActive === 'true'; // Convert to boolean
      }

      // Find offers based on the filter
      const offers = await CategoryOffer.find(filter).populate("categoryId");

      res.render("admin/offers", {
          categories,
          offers,
          selectedCategory: category || "",
          selectedIsActive: isActive || ""
      });
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

  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  const currentDate = new Date();

  if (startDateObj < currentDate) {
      return res.json({ ok: false, msg: 'Start date must be in the future.' });
  }

  if (startDateObj >= endDateObj) {
      return res.json({ ok: false, msg: 'End date must be after start date.' });
  }

  try {
      const existingOffer = await CategoryOffer.findOne({ title });
      if (existingOffer) {
          return res.json({ ok: false, msg: 'An offer with this title already exists.' });
      }

      // Prepare the new offer object
      const newOfferData = {
          title,
          description,
          discount,
          startDate: startDateObj,
          expireDate: endDateObj,
          isActive,
      };

      // Only add categoryId if it is not "All Categories"
      if (category !== "All Categories") {
          newOfferData.categoryId = category; // Only add categoryId if it's not "All Categories"
      }

      const newOffer = new CategoryOffer(newOfferData);
      await newOffer.save();

      // Check if the category is for all categories
      const filter = category === "All Categories" ? {} : { categoryId: category };
      const products = await ProductModel.find(filter);

      if (!products.length) {
          return res.json({ ok: true, msg: 'Offer added, but no products found in the selected category.' });
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
  const { title, description, discount, category, startDate, endDate, isActive } = req.body;

  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

  if (startDateObj >= endDateObj) {
    return res.json({ ok: false, msg: "End date must be after start date." });
  }

  try {
    const existingOffer = await CategoryOffer.findOne({ title, _id: { $ne: offerId } });
    if (existingOffer) {
      return res.json({ ok: false, msg: "An offer with the same title already exists." });
    }

    const updatedOffer = await CategoryOffer.findByIdAndUpdate(
      offerId,
      {
        title,
        description,
        discount: parseInt(discount),
        categoryId: category,
        startDate: startDateObj,
        expireDate: endDateObj,
        isActive,
      },
      { new: true }
    );

    const products = await ProductModel.find({ categoryId: category });

    if (!products.length) {
      return res.json({ ok: true, msg: "Offer updated, but no products found in the category." });
    }

    const updates = products.map((product) => {
      const originalPrice = product.originalPrice || product.price;
      const discountedPrice = isActive ? Math.round(originalPrice - originalPrice * (discount / 100)) : originalPrice;

      return ProductModel.updateOne(
        { _id: product._id },
        {
          price: parseInt(discountedPrice),
          originalPrice,
          discountApplied: isActive ? discount : 0,
        }
      );
    });

    await Promise.all(updates);

    const message = isActive
      ? "Offer updated and discounts applied to products."
      : "Offer updated, but it is not active, discounts removed from products.";

    res.json({ ok: true, msg: message });
  } catch (error) {
    console.error("Error updating offer:", error);
    res.status(500).json({ ok: false, msg: "Error updating offer" });
  }
};

