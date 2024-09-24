import ProductModel from "../../models/prodectsModel.js";
import CartModel from "../../models/cartModel.js";

export const cartRenderPage = async (req, res) => {
  try {
    const user = req.session.user;
    const WishlistQty = req.session.WishlistQty;
    const toastMessage = req.session.toast;
    delete req.session.toast;

    if (!user || !user._id) {
      return res.redirect("/login");
    }

    const cart = await CartModel.findOne({ userId: user._id }).populate(
      "products.productId"
    );
    const cartQty = req.session.cartQty;

    res.render("user/cart", {
      cartQty,
      WishlistQty,
      user,
      message: toastMessage,
      cartProducts: cart ? cart.products : [],
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const removeCart = async (req, res) => {
  try {
    const productId = req.params.id;
    const user = req.session.user;

    await CartModel.updateOne(
      { userId: user._id },
      { $pull: { products: { productId: productId } } }
    );

    req.session.cartQty = req.session.cartQty - 1;

    res.json({
      success: true,
      message: "Cart item removed successfully.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to remove item from cart.",
    });
  }
};
export const qtyHandler = async (req, res) => {
  const { productId, quantity } = req.body;
  const user = req.session.user;

  try {
    await CartModel.updateOne(
      { userId: user._id, "products.productId": productId },
      { $set: { "products.$.quantity": quantity } }
    );
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};
export const addToCart = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.session.user ? req.session.user._id : null;

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
        (item) => item?.productId?.toString() === productId
      );

      if (productInCart) {
        return res
          .status(200)
          .json({ message: "Product already in cart:)", success: false });
      } else {
        cart.products.push({ productId });
      }
    }

    await cart.save();

    const cartItem = await CartModel.findOne({ userId }).populate(
      "products.productId"
    );
    req.session.cartQty = cartItem.products.length;

    req.session.toast = "Cart added successfully :)";

    return res
      .status(200)
      .json({ message: "Cart added successfully :)", success: true });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};
