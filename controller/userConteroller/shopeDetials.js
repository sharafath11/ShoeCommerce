import mongoose from "mongoose";
import CartModel from "../../models/cartModel.js";
import { categoryModel } from "../../models/category.js";
import ProductModel from "../../models/prodectsModel.js";
import Wishlist from "../../models/whislistModel.js";

export const shopDetialsRender = async (req, res) => {
  try {

    const [categories, products] = await Promise.all([
      categoryModel.find(),
      ProductModel.find().populate("categoryId").exec(),
    ]);

    const filteredProducts = products.filter(
      (item) => !item.blocked && !item.categoryId?.blocked
    );

    const user = req.session.user;
    if (!user || !user._id) {
      return res.render("user/shopeDetials", {
        user,
        products: filteredProducts,
        WishlistQty: 0,
        categories,
        cartQty: req.session.cartQty || 0, 
      });
    }
    const [wishlist, cartItem] = await Promise.all([
      Wishlist.findOne({ user: user._id }),
      CartModel.findOne({ userId: user._id }).populate("products.productId"),
    ]);
    const wishlistProducts = wishlist?.products || [];
    const uniqueWishlistProducts = Array.from(new Set(wishlistProducts));
    const WishlistQty = uniqueWishlistProducts.length;
    const cartQty = cartItem?.products?.length || 0;
    return res.render("user/shopeDetials", {
      user,
      WishlistQty,
      cartQty,
      categories,
      products: filteredProducts,
    });
  } catch (error) {
    console.error("Error fetching shop details:", error);
    res.status(500).render("user/error", { message: "Internal server error" });
  }
};
