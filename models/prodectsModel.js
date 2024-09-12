import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    brand: {
        type: String,
        required: true,
        trim: true
    },
    availableSize: {
        type: [String], // Array of strings to accommodate multiple sizes
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    blocked: {
        type: Boolean,
        default: false
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to a Category model
        ref: 'Category', // The name of the model to which the categoryId refers
        required: true
    }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

export default Product;
