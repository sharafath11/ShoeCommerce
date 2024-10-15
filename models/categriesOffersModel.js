import mongoose from 'mongoose';

// Define the schema for category offers
const categoryOfferSchema = new mongoose.Schema({
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', // Assuming you have a Category model
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
    discountType: {
        type: String,
        enum: ['Percentage', 'Fixed'],
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
    createdAt: {
        type: Date,
        default: Date.now,
    },

});

 export const CategoryOffer = mongoose.model('CategoryOffer', categoryOfferSchema);

