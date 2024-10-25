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
      isCanceld: {
        type: Boolean,
        default: false,
      },
      isReturned:{
        type:Boolean,
        default:false
      },
     reason:{
       type:String
     },
     status: {
      type: String,
      enum: ['','Pending', 'Approved', 'Rejected'],  
      default: '',
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
    enum: ["Pending", "Delivered", "Shipped", "Returned",],
    default: "Pending",
  },
  deliveredDate: {  
    type: Date,
  },
  returnEndDate:{
    type: Date,
  },
  isCanceld: {
    type: Boolean,
    default: false,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  orderId: {
    type: String,
  },
  couponId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Coupon",
  },
  coupenValue:{
    type:Number
  },
  paymentMethod: {
    type: String,
    enum: ["COD", "Razorpay","Wallet"],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Failed"],
    default: "Pending",
  },
  razorpayPaymentId: {
    type: String,
  },
  totelDiscountValue:{
    type:Number
  },
  categoryDiscountValue:{
    type:Number,
    default:0
  },
  totelOrginalPrice:{
    type:Number
  },

  razorpayOrderId: {
    type: String,
  },
  razorpaySignature: {
    type: String,
  },
});

const OrderModel = mongoose.model("Order", OrderSchema);

export default OrderModel;
