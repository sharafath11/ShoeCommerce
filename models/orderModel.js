import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },

      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      size: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],
  address: {
    type: {
      type: String,
      required: true,
    },
    streetAddress: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Pending", "Completed", "Shipped"],
    default: "Pending",
  },
  isCanceld:{
    type:Boolean,
    default:false
  },
  totalAmount: {
    type: Number,
    required: true,
  },
});

const OrderModel = mongoose.model("Order", OrderSchema);

export default OrderModel;
