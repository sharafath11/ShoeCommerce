import mongoose from 'mongoose';

// Define the schema
const wishlistSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, // Reference to the user
    required: true,
    ref: 'User' // Reference to the 'User' model
  },
  products: [{ 
    type: mongoose.Schema.Types.ObjectId, // Reference to the products
    ref: 'Product', // Reference to the 'Product' model
    required: true
  }]
}, { timestamps: true }); // Automatically adds createdAt and updatedAt timestamps

// Create the model
const Wishlist = mongoose.model('Wishlist', wishlistSchema);

export default Wishlist;
