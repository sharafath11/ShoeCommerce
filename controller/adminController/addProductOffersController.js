import mongoose from "mongoose";
import ProductModel from "../../models/prodectsModel.js";
import { productOfferModel } from "../../models/productOffer.js";

export const addProductOFfersRenderPage=async(req,res)=>{
    res.render("admin/addProductOffers")
}
export const addOfferSearch = async (req, res) => {
    try {
        const { searchQuery } = req.body;

        const products = await ProductModel.find({
            name: { $regex: searchQuery, $options: 'i' }
        });

        res.json({ products });
    } catch (error) {
        console.error("Error searching products:", error);
        res.status(500).json({ message: "An error occurred while searching for products." });
    }
};

export const addproductOffers = async (req, res) => {
  try {
    const { productId, originalPrice, discountValue, startDate, endDate, offerDescription, name, productName } = req.body;

    if (!productId || !originalPrice || !discountValue || !startDate || !endDate || !offerDescription || !name) {
      return res.json({ message: "All fields are required." });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.json({ message: "Invalid product ID format." });
    }

    if (discountValue < 0 || discountValue > 100) {
      return res.json({ message: "Discount percentage must be between 0 and 100." });
    }

    const existingOffer = await productOfferModel.findOne({ products: productId });
    if (existingOffer) {
      return res.json({ message: "This product already has a product offer" });
    }

    const discountAmount = originalPrice * (discountValue / 100);
    const newOffer = new productOfferModel({
      offerName: name,
      productName: productName,
      description: offerDescription,
      discountPercentage: discountValue,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      products: productId,
      isActive: new Date(startDate) <= new Date(),
    });

    await newOffer.save();

    if (newOffer.isActive) {
      await ProductModel.findByIdAndUpdate(
        productId,
        {
          price: Number(originalPrice - discountAmount),
          discountApplied: discountValue,
        },
        { new: true }
      );
    }

    res.json({ message: "Offer added successfully", offer: newOffer });
  } catch (error) {
    console.error("Error adding product offer:", error);
    res.json({ message: "Internal server error", error: error.message });
  }
};

export const editPrductOffers = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { offerName, description, discountPercentage, isActive, startDate, endDate, productId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(offerId)) {
      return res.json({ success: false, message: "Invalid offer ID" });
    }

    const updatedOffer = await productOfferModel.findByIdAndUpdate(
      offerId,
      { offerName, description, discountPercentage, isActive, startDate, endDate },
      { new: true }
    );

    if (!updatedOffer) {
      return res.json({ ok: false, msg: "Offer not found" });
    }

    const product = await ProductModel.findById(productId);
    const originalPrice = product.originalPrice || product.price;
    const discountedPrice = Number(originalPrice * (discountPercentage / 100));
    const price = Math.floor(originalPrice - discountedPrice);

    await ProductModel.findByIdAndUpdate(
      productId,
      {
        price: isActive ? price : Math.ceil(product.price + discountedPrice),
        discountApplied: isActive ? discountPercentage : 0,
      }
    );

    res.json({ ok: true, msg: "Offer updated successfully" });
  } catch (error) {
    console.error("Error updating offer:", error);
    res.json({ ok: false, msg: "An error occurred while updating the offer" });
  }
};
