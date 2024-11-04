import mongoose from "mongoose";

const ProductOfferSchema = new mongoose.Schema({
  offerName: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  products: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  productName:{
    type:String,
    required:true
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

export const productOfferModel = mongoose.model("ProductOffer", ProductOfferSchema);
