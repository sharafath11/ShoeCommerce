
import ProductModel from "../../models/prodectsModel.js";
import CartModel from "../../models/cartModel.js";

export const cartRenderPage = async (req, res) => {
    try {
        const user = req.session.user;
        const WishlistQty = req.session.WishlistQty;
        const toastMessage = req.session.toast;
        delete req.session.toast;
        
        // Fetch the cart for the current user and populate the product details
        const cart = await CartModel.findOne({ userId: user._id }).populate('products.productId');
        const cartQty= req.session.cartQty
        res.render("user/cart", {
           cartQty,
            WishlistQty,
            user,
            message: toastMessage,
            cartProducts: cart ? cart.products : [] 
        });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
export const addToCart = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.session.user._id;

    if (!userId) {
      return res
        .status(400)
        .json({ message: "User not logged in or session expired" });
    }

    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await CartModel.findOne({ userId });

    if (!cart) {
      cart = new CartModel({
        userId,
        products: [{ productId }],
      });
    } else {
      const productInCart = cart.products.find(
        (item) => item.productId.toString() === productId
      );

      if (!productInCart) {
        cart.products.push({ productId });
      } else {
        req.session.toast="Prodect already in cart "
        return res.redirect('/');
      }
    }

    await cart.save();
    req.session.toast="Cart added succesfull :)";
        const cartItem = await CartModel.findOne({ userId: user._id }).populate('products.productId');
        req.session.cartQty=cartItem.length
    return res.redirect("/");
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};
