import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', 
        required: true, 
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true, 
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    rating: {
        type: Number,
        required: true, 
        min: 1, 
        max: 5, 
    },
    comment: {
        type: String,
        trim: true, 
        default: '', 
    },
    imagePath: {
        type: String, 
        default: '', 
    },
    createdAt: {
        type: Date,
        default: Date.now, 
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const ReviewModel = mongoose.model('Review', reviewSchema);

export default ReviewModel;
