import {
  activateCategoryOffers,
  couponActiveWithDate,
  disableCatOffer,
  disableExpiredCoupons,
  productOfferEnabeDisable,
} from "../../middleware/expireCoupen.js";
import CartModel from "../../models/cartModel.js";
import ProductModel from "../../models/prodectsModel.js";
import Wishlist from "../../models/whislistModel.js";

export const homeRender = async (req, res) => {
  try {
    disableExpiredCoupons();
    couponActiveWithDate();
    activateCategoryOffers();
    productOfferEnabeDisable();
    disableCatOffer();  
    const user = req.session.user;
    const toastMessage = req.session.toast;
    delete req.session.toast;
    if (user) {
      const cartItem = await CartModel.findOne({ userId: user._id }).populate(
        "products.productId"
      );
      req.session.cartQty = cartItem?.products?.length;
    } else {
      req.session.cartQty = 0;
    }
    const productsN = await ProductModel.find()
      .populate("categoryId")
      .sort({ _id: -1 });

    const filteredProducts = productsN.filter(
      (item) => !item.blocked && !item.categoryId.blocked
    );

    const products = filteredProducts.slice(0, 12);

    if (!user || !user._id) {
      return res.render("user/index", {
        user: user,
        products: products || [],
        WishlistQty: 0,
        message: toastMessage,
        cartQty: req.session.cartQty,
      });
    }

    const wishlist = await Wishlist.findOne({ user: user._id });

    const wishlistProducts =
      wishlist && wishlist.products ? wishlist.products : [];

    const uniqueProducts = [...new Set(wishlistProducts)];
    const WishlistQty = uniqueProducts.length;

    req.session.WishlistQty = WishlistQty;
    console.log(products);

    res.render("user/index", {
      user: user,
      products: products || [],
      WishlistQty,
      message: toastMessage,
      cartQty: req.session.cartQty || 0,
    });
  } catch (error) {
    console.error(error);
    return res.render("user/error");
  }
};
