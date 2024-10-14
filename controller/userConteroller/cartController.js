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

    // Fetch the cart for the user and populate product details
    const cart = await CartModel.findOne({ userId: user._id }).populate({
      path: "products.productId",
      select: "name price images availableSize",
    });

    // Check if the cart exists
    if (!cart) {
      return res.render("user/cart", {
        cartQty: 0,
        WishlistQty,
        user,
        message: toastMessage,
        cartProducts: [],
      });
    }

    // Iterate over products to check size availability and update stock
    await Promise.all(
      cart.products.map(async (item) => {
        const product = item.productId; // The populated product document

        if (product) {
          const sizeDetails = product.availableSize.find(
            (size) => size.size === Number(item.size)
          );
          if (sizeDetails) {
            item.isSizeAvailable = sizeDetails.stock >= item.quantity;
          } else {
            item.isSizeAvailable = false;
          }
        } else {
          item.isSizeAvailable = false;
        }
      })
    );

   
    await cart.save();
    const cartQty = req.session.cartQty || 0;
    res.render("user/cart", {
      cartQty,
      WishlistQty,
      user,
      message: toastMessage,
      cartProducts: cart.products,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.json({ message: "Server error", error });
  }
};

export const removeCart = async (req, res) => {
  try {
    const productId = req.params.id;
    const size = req.query.size;  // Get the size from query parameters
    const user = req.session.user;

    // Update the cart by removing the product with the specific size
    await CartModel.updateOne(
      { userId: user._id },
      { $pull: { products: { productId: productId, size: size } } }
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
  const { productId, quantity, size } = req.body;
  const user = req.session.user;
  try {
    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    const sizeDetails = product.availableSize.find(
      (s) => s.size === parseInt(size)
    );
    if (!sizeDetails) {
      return res
        .status(400)
        .json({ success: false, message: "Size not available" });
    }
    if (quantity > sizeDetails.stock) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity exceeds available stock.",
      });
    }
    await CartModel.updateOne(
      {
        userId: user._id,
        "products.productId": productId,
        "products.size": size,
      },
      { $set: { "products.$.quantity": quantity } }
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Error fetching shop details:", error);
    return res.render("user/error");
  }
};
export const addToCart = async (req, res) => {
  try {
    const { size } = req.body;
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
        products: [{ productId, size }],
      });
    } else {
      const productInCart = cart.products.find(
        (item) => item.productId.toString() === productId && item.size === size
      );

      if (productInCart) {
        return res.status(200).json({
          message: "Product with the same size already in cart",
          success: false,
        });
      } else {
        cart.products.push({ productId, size });
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
    console.error("Error fetching shop details:", error);
    return res.render("user/error");
  }
};

