import CartModel from "../../models/cartModel.js";
import { categoryModel } from "../../models/category.js";
import ProductModel from "../../models/prodectsModel.js";
import Wishlist from "../../models/whislistModel.js";

export const filteredProducts = async (req, res) => {
  try {
    let query = {};
    if (req.body.brand) {
      query.brand = req.body.brand;
    }

    if (req.body.color) {
      query.color = req.body.color;
    }
    query.blocked = false; 
    const products = await ProductModel.find(query);

    
   return res.json(products)
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
