
import { categoryModel } from "../../models/category.js";
import ProductModel from "../../models/prodectsModel.js";

export const filteredProducts = async (req, res) => {
  try {
      let query = { blocked: false }; 
      const { brand, color, price, category } = req.query; 
      if (brand) {
          query.brand = brand;
      }

      if (color) {
          query.color = color;
      }

      if (category) { 
          query.categoryId = category; 
      }

      let products = await ProductModel.find(query);
      if (price) {
          if (price === '2') { 
              products.sort((a, b) => a.price - b.price);
          } else if (price === '3') { 
              products.sort((a, b) => b.price - a.price);
          }
      }
      const categories = await categoryModel.find();
      const user = req.session.user;
      return res.render("user/shopeDetials", {
          user,
          WishlistQty: 0,
          cartQty: 0,
          categories,
          products
      });
  } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Internal server error.' });
  }
};




