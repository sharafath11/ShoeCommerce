import userModel from "../../models/userModel.js";
import AddressModel from "../../models/addressModel.js";
import Wishlist from "../../models/whislistModel.js";
import CartModel from "../../models/cartModel.js";
import OrderModel from "../../models/orderModel.js";
import ProductModel from "../../models/prodectsModel.js";

export const profileRender = async (req, res) => {
  try {
    const id = req.session.user?._id;
    const addresses = await AddressModel.find({ userId: id });
    const WishlistQty = req.session.WishlistQty;
    const cartQty = req.session.cartQty;

    const user = await userModel.findById(id);

    if (!user) {
      res.redirect("/");
    }

    res.render("user/profile", { user, cartQty, WishlistQty, addresses });
  } catch (error) {
    console.log("Server error:", error);
    res.redirect("/");
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { username, phone } = req.body;
    const userId = req.params.id;

    const user = await userModel.findByIdAndUpdate(
      userId,
      {
        username: username,
        phone: phone,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ ok: false, msg: "User not found" });
    }
   req.session.user.username=username
    res.status(200).json({ ok: true, msg: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ ok: false, msg: "Server error" });
  }
};
export const renderAddresPage = async (req, res) => {
  try {
    const id = req.session.user._id;
    const user = await userModel.findById(id);
    const addresses = await AddressModel.find({ userId: id });
    const wishlist = await Wishlist.findOne({ user: user._id });

    const wishlistProducts =
      wishlist && wishlist.products ? wishlist.products : [];

    const uniqueProducts = [...new Set(wishlistProducts)];
    const WishlistQty = uniqueProducts.length;

    req.session.WishlistQty = WishlistQty;
    const cartQty = req.session.cartQty;

    
    if (!user) {
      res.redirect("/");
    }

    res.render("user/address", { user, cartQty, WishlistQty, addresses });
  } catch (error) {
    console.log("Server error:", error);
    return res.render("user/error");
   
  }
};
export const addAddress = async (req, res) => {
  const {name, userId, type, streetAddress, city, state, postalCode, country } =
    req.body;
  const address = new AddressModel({
    userId,
    name,
    type,
    streetAddress,
    city,
    state,
    postalCode,
    country,
  });

  try {
    await address.save();
    res.status(201).json({ ok: true, msg: "Address added successfully" });
  } catch (error) {
    console.error("Error saving address:", error);
    return res.render("user/error");
   
  }
};
export const removeAddress = async (req, res) => {
  const addressId = req.params.id;

  try {
    const result = await AddressModel.findByIdAndDelete(addressId);

    if (!result) {
      return res.status(404).json({ ok: false, msg: "Address not found." });
    }

    res.json({ ok: true, msg: "Address removed successfully." });
  } catch (error) {
    console.error("Error removing address:", error);
    res
      .status(500)
      .json({
        ok: false,
        msg: "An error occurred while removing the address.",
      });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const {name, addressId, type, streetAddress, city, state, postalCode, country } =req.body;

    const updatedAddress = await AddressModel.findByIdAndUpdate(
      addressId,
      { name,type, streetAddress, city, state, postalCode, country },
      { new: true }
    );

    if (!updatedAddress) {
      return res.status(404).json({ ok: false, msg: "Address not found" });
    }

    res.status(200).json({ ok: true, msg: "Address updated successfully" });
  } catch (error) {
    console.error(error);
    return res.render("user/error");
   
  }
};
export const getOrderReanderPage=async(req,res)=>{
  const user=req.session.user
  const wishlist = await Wishlist.findOne({ user: user._id });

  const wishlistProducts =
    wishlist && wishlist.products ? wishlist.products : [];

  const uniqueProducts = [...new Set(wishlistProducts)];
  const WishlistQty = uniqueProducts.length;
  const cartItem = await CartModel.findOne({ userId: user._id }).populate(
    "products.productId"
  );
  req.session.cartQty = cartItem?.products?.length
  const cartQty=req.session.cartQty
  req.session.WishlistQty = WishlistQty;
  const orders = await OrderModel.find({ user: user._id }).sort({ orderDate: -1 });
  res.render("user/orders",{WishlistQty,cartQty,user,orders});
}
export const removeOrders = async (req, res) => {
  const orderId = req.params.id;

  try {
    const order = await OrderModel.findById(orderId);
    if (!order) return res.status(404).json({ ok: false, msg: "Order not found." });
    if (order.isCanceld) return res.status(400).json({ ok: false, msg: "Order is already canceled." });
    const productUpdates = order.items.map(async item => {
      const product = await ProductModel.findById(item.productId);
      if (product) {
        const sizeUpdate = product.availableSize.find(sizeObj => sizeObj.size === item.size);
        if (sizeUpdate) {
          sizeUpdate.stock += item.quantity; 
        }
        await product.save();
      }
    });

    await Promise.all(productUpdates);

    await OrderModel.findByIdAndUpdate(orderId, { isCanceld: true });

    res.json({ ok: true, msg: "Order canceled successfully, and products returned to stock." });
  } catch (error) {
    console.error("Error canceling order:", error);
    return res.render("user/error");
  }
};

export const deletePerItemInOrder = async (req, res) => {
  const { orderId, productId } = req.params;
  const { size } = req.body;

  try {
    const order = await OrderModel.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const itemIndex = order.items.findIndex(i => i.productId.toString() === productId && i.size === parseInt(size));
    if (itemIndex === -1) return res.status(404).json({ message: 'Item not found in the order.' });

    const item = order.items[itemIndex];
    if (item.isCanceld) return res.status(400).json({ message: 'Item is already canceled.' });

    // Update the product stock
    const product = await ProductModel.findById(productId);
    if (product) {
      const sizeUpdate = product.availableSize.find(sizeObj => sizeObj.size === parseInt(size));
      if (sizeUpdate) {
        sizeUpdate.stock += item.quantity;  // Return the canceled item quantity back to stock
      }
      await product.save();
    }

    // Update order details
    order.totalAmount -= item.price * item.quantity;
    item.isCanceld = true;

    if (order.items.every(i => i.isCanceld)) {
      order.isCanceld = true;
      order.totalAmount = 0.0;
    }

    await order.save();
  
    return res.status(200).json({ 
      message: 'Item canceled successfully and product stock updated', 
      totalAmount: order.totalAmount, 
      allCanceled: order.items.every(i => i.isCanceld) 
    });
  } catch (error) {
    console.error('Error canceling order item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};






