import mongoose from 'mongoose';

// Define the schema for category offers
const categoryOfferSchema = new mongoose.Schema({
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', 
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    discount: {
        type: Number,
        required: true,
    },
    startDate: {
        type: Date,
        required: true, 
    },
    expireDate: {
        type: Date,
        required: true, 
    },
    isActive:{
        type:Boolean,
        default:false
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },

});

 export const CategoryOffer = mongoose.model('CategoryOffer', categoryOfferSchema);

