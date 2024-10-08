import CartModel from "../../models/cartModel.js";
import { categoryModel } from "../../models/category.js";
import ProductModel from "../../models/prodectsModel.js";
import Wishlist from "../../models/whislistModel.js";


export const filteredProducts = async (req, res) => {
  try {
    const user=req.session.user
    const { brand, color } = req.body;
    let query = {};
    if (brand && typeof brand === 'string' && brand.trim() !== "") {
      query.brand = brand.trim();
    }
    if (color && typeof color === 'string' && color.trim() !== "") {
      query.color = color.trim();
    }
    query.block = false;
    const products = await ProductModel.find(query);
    const wishlist = await Wishlist.findOne({ user: user._id });
    const wishlistProducts = wishlist && wishlist.products ? wishlist.products : [];
    const uniqueProducts = [...new Set(wishlistProducts)];
    const WishlistQty = uniqueProducts.length;
    const categories = await categoryModel.find();
    const cartItem = await CartModel.findOne({ userId: user._id }).populate("products.productId");
    const cartQty = cartItem?.products?.length || 0;

    if (!user || !user._id) {
        return res.render("user/shopeDetials", {
          user: user,
          products: products || [],
          WishlistQty: 0,
          categories,
          cartQty: req.session.cartQty,
        });
      }
    return res.render("user/shopeDetials", {
      user,
      WishlistQty,
      cartQty,
      categories,
      products,
    });
  } catch (error) {
    console.error("Error fetching filtered products:", error);
    res.status(500).json({ error: "An error occurred while fetching products." });
  }
};
