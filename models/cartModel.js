import mongoose from "mongoose";
const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        size: {
          type: String, 
          required: false, 
          default: null,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        isSizeAvailable: { 
          type: Boolean,
          default: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const CartModel = mongoose.model("Cart", cartSchema);

export default CartModel;
