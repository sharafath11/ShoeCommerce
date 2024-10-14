import ProductModel from "../../models/prodectsModel.js";
import Wishlist from "../../models/whislistModel.js";
import whislist from "../../models/whislistModel.js";

export const whislistFn = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.session.user._id;

    if (!userId) {
      return res
        .status(400)
        .json({
          message: "User not logged in or session expired",
          success: false,
        });
    }

    const product = await ProductModel.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found", success: false });
    }

    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = new whislist({ user: userId, products: [productId] });
      await wishlist.save();
      return res
      .status(200)
      .json({ message: "Product added in wishlist", success: true });
    } else {
      if (wishlist.products.includes(productId)) {
        req.session.toast = "Product already in wishlist";
        return res
          .status(200)
          .json({ message: "Product already in wishlist", success: false });
      } else {
        wishlist.products.push(productId);
        req.session.toast = "Wishlist added successfully";
        await wishlist.save();
        return res
        .status(200)
        .json({ message: "wislist added succesfull", success: true });
      }
    }
  } catch (error) {
    console.error("Server error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error, success: false });
  }
};
export const renderWishlistPage = async (req, res) => {
  try {
    const user = req.session.user;
    
    const toastMessage = req.session.toast;
    delete req.session.toast;

    if (!user || !user._id) {
      return res.render("user/ShowLoginMsg.ejs")
    }

    const wishlist = await Wishlist.findOne({ user: user._id }).populate(
      "products"
    );
    const wishlistProducts =
    wishlist && wishlist.products ? wishlist.products : [];

  const uniqueProducts = [...new Set(wishlistProducts)];
  const WishlistQty = uniqueProducts.length;
    const cartQty = req.session.cartQty;
    if (!wishlist || !wishlist.products) {
      return res.render("user/wishlist", { wishlist: [], cartQty });
    }
    res.render("user/wishlist", {
      wishlist: wishlist.products,
      WishlistQty,
      user,
      message: toastMessage,
      cartQty,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const removeWhislist = async (req, res) => {
  try {
    const user = req.session.user;
    const productId = req.params.id;
    req.session.toast = "removed succsfull";

    const wishlist = await Wishlist.findOne({ user: user._id });

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    wishlist.products = wishlist.products.filter(
      (product) => product.toString() !== productId
    );

    await wishlist.save();

    req.session.WishlistQty = req.session.WishlistQty - 1;
    res.redirect("/wishlist");
  } catch (error) {
    console.error(error);
    return res.render("user/error");
   
  }
};
