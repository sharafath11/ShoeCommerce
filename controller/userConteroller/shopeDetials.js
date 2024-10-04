import CartModel from "../../models/cartModel.js";
import { categoryModel } from "../../models/category.js";
import ProductModel from "../../models/prodectsModel.js";
import Wishlist from "../../models/whislistModel.js";

export const shopDetialsRender = async (req, res) => {
  try {
    const categories = await categoryModel.find();

    const productsN = await ProductModel.find().populate("categoryId").exec();

    const products = productsN.filter(
      (item, index) => !item.blocked && !item.categoryId.blocked
    );

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

    const wishlistProducts =
      wishlist && wishlist.products ? wishlist.products : [];

    const uniqueProducts = [...new Set(wishlistProducts)];
    const WishlistQty = uniqueProducts.length;

    const cartItem = await CartModel.findOne({ userId: user._id }).populate(
      "products.productId"
    );
    const cartQty = cartItem?.products?.length;

    return res.render("user/shopeDetials", {
      user,
      WishlistQty,
      cartQty,
      categories,
      products,
    });
  } catch (error) {
    console.error("Error fetching shop details:", error);
  }
};
