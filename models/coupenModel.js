import mongoose from 'mongoose';


const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true, 
    },
    discountType: {
        type: String,
        required: true,
        enum: ['percentage', 'fixed'], 
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0, 
    },
    startingDate: {
        type: Date,
        required: true,
    },
    endingDate: {
        type: Date,
        required: true,
    },
    minimumPrice: {
        type: Number,
        required: true,
        min: 0, 
    },
    isActive: {
        type: Boolean,
        default: true, 
    },
});

const CouponModel = mongoose.model('Coupon', couponSchema);

export default CouponModel;
