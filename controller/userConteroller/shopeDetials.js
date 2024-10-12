import mongoose from "mongoose";
import CartModel from "../../models/cartModel.js";
import { categoryModel } from "../../models/category.js";
import ProductModel from "../../models/prodectsModel.js";
import Wishlist from "../../models/whislistModel.js";

export const shopDetialsRender = async (req, res) => {
  try {
    //multiple asyncronn function 
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

//filter routes ann mwonee


export const filterCategory = async (req, res) => {
  const catId = req.params.id; 
  try {
   
    if (!mongoose.Types.ObjectId.isValid(catId)) {
      return res.status(400).send("Invalid category ID");
    }

    const categories = await categoryModel.find();
    const productsN = await ProductModel.find().populate("categoryId").exec();

    const products = productsN.filter((item) => {
      return (
        !item.blocked && 
        item.categoryId && 
        !item.categoryId.blocked && 
        item.categoryId._id.equals(catId) 
      );
    });

    const user = req.session.user;
    if (!user || !user._id) {
      return res.render("user/shopeDetials", {
        user: user,
        products: products || [],
        WishlistQty: 0,
        categories,
        cartQty: req.session.cartQty,
      });
    }

    const wishlist = await Wishlist.findOne({ user: user._id });
    const wishlistProducts = wishlist && wishlist.products ? wishlist.products : [];
    const uniqueProducts = [...new Set(wishlistProducts)];
    const WishlistQty = uniqueProducts.length;

    const cartItem = await CartModel.findOne({ userId: user._id }).populate("products.productId");
    const cartQty = cartItem?.products?.length || 0;

    return res.render("user/shopeDetials", {
      user,
      WishlistQty,
      cartQty,
      categories,
      products,
    });
  } catch (error) {
    console.error("Error fetching shop details:", error);
    return res.status(500).send("Internal server error");
  }
};