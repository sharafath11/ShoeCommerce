import { categoryModel } from "../../models/category.js";
import { CategoryOffer } from "../../models/categriesOffersModel.js";
import ProductModel from "../../models/prodectsModel.js";

export const renderOffersPage = async (req, res) => {
  try {
    const categories = await categoryModel.find();

    const { category, isActive } = req.query;

    const filter = {};

    if (category) {
      filter.categoryId = category;
    }

    if (isActive) {
      filter.isActive = isActive === "true";
    }
    const offers = await CategoryOffer.find(filter).populate("categoryId");

    res.render("admin/offers", {
      categories,
      offers,
      selectedCategory: category || "",
      selectedIsActive: isActive || "",
    });
  } catch (error) {
    console.error("Error fetching offers or categories:", error);
    res.status(500).send("Internal Server Error");
  }
};

export const addCoffers = async (req, res) => {
  const {
    title,
    description,
    discount,
    category,
    startDate,
    endDate,
    isActive,
  } = req.body;

  if (
    !title ||
    !description ||
    discount === undefined ||
    !category ||
    !startDate ||
    !endDate
  ) {
    return res.json({ ok: false, msg: "All fields are required." });
  }

  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  const currentDate = new Date();

  if (startDateObj < currentDate || startDateObj >= endDateObj) {
    return res.json({
      ok: false,
      msg:
        startDateObj < currentDate
          ? "Start date must be in the future."
          : "End date must be after start date.",
    });
  }

  try {
    if (isActive && category !== "All Categories") {
      const activeOfferInCategory = await CategoryOffer.findOne({
        categoryId: category,
        isActive: true,
      });
      if (activeOfferInCategory) {
        return res.json({
          ok: false,
          msg: "An active offer already exists in this category. Please turn off the active offer before adding a new one.",
        });
      }
    }

    const existingOffer = await CategoryOffer.findOne({ title });
    if (existingOffer) {
      return res.json({
        ok: false,
        msg: "An offer with this title already exists.",
      });
    }

      const newOfferData = {
        title,
        description,
        discount,
        startDate: startDateObj,
        expireDate: endDateObj,
        isActive,
        ...(category !== "All Categories" && { categoryId: category }),
      };

    const newOffer = new CategoryOffer(newOfferData);
    await newOffer.save();

    const filter =
      category === "All Categories" ? {} : { categoryId: category };
    const products = await ProductModel.find(filter);

    if (!products.length) {
      return res.json({
        ok: true,
        msg: "Offer added, but no products found in the selected category.",
      });
    }

    const bulkUpdates = products.map((product) => {
      const originalPrice = product.originalPrice || product.price;
      const updatedData = isActive
        ? {
            price: Math.round(originalPrice - originalPrice * (discount / 100)),
            originalPrice,
            discountApplied: discount,
          }
        : { discountApplied: 0 };
      return {
        updateOne: { filter: { _id: product._id }, update: updatedData },
      };
    });

    await ProductModel.bulkWrite(bulkUpdates);

    const message = isActive
      ? "Offer added and products updated with discounts successfully!"
      : "Offer added but is not active, discounts removed from products.";

    res.json({ ok: true, msg: message, offer: newOffer });
  } catch (error) {
    console.error("Error adding offer:", error);
    res.status(500).json({ msg: "Server error. Please try again later." });
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

  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

  if (startDateObj >= endDateObj) {
    return res.json({ ok: false, msg: "End date must be after start date." });
  }

  try {
    const existingOffer = await CategoryOffer.findOne({
      title,
      _id: { $ne: offerId },
    });
    if (existingOffer) {
      return res.json({
        ok: false,
        msg: "An offer with the same title already exists.",
      });
    }

    if (isActive && category !== "All Categories") {
      const activeOfferInCategory = await CategoryOffer.findOne({
        categoryId: category,
        isActive: true,
      });
      if (activeOfferInCategory) {
        return res.json({
          ok: false,
          msg: "An active offer already exists in this category. Please turn off the active offer before adding a new one.",
        });
      }
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
      return res.json({
        ok: true,
        msg: "Offer updated, but no products found in the category.",
      });
    }

    const bulkUpdates = products.map((product) => {
      const originalPrice = product.originalPrice || product.price;
      const discountedPrice = isActive
        ? Math.round(originalPrice - originalPrice * (discount / 100))
        : originalPrice;

      return {
        updateOne: {
          filter: { _id: product._id },
          update: {
            price: parseInt(discountedPrice),
            originalPrice,
            discountApplied: isActive ? discount : 0,
          },
        },
      };
    });

    await ProductModel.bulkWrite(bulkUpdates);

    const message = isActive
      ? "Offer updated and discounts applied to products."
      : "Offer updated, but it is not active, discounts removed from products.";

    res.json({ ok: true, msg: message });
  } catch (error) {
    console.error("Error updating offer:", error);
    res.status(500).json({ ok: false, msg: "Error updating offer" });
  }
};
