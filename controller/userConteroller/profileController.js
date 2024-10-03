import mongoose from "mongoose";
import userModel from "../../models/userModel.js";
import AddressModel from "../../models/addressModel.js";
import Wishlist from "../../models/whislistModel.js";
import CartModel from "../../models/cartModel.js";
import OrderModel from "../../models/orderModel.js";

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
    res.redirect("/");
  }
};
export const addAddress = async (req, res) => {
  const { userId, type, streetAddress, city, state, postalCode, country } =
    req.body;
  const address = new AddressModel({
    userId,
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
    res.status(500).json({ ok: false, msg: `Error adding address${error}` });
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
    const { addressId, type, streetAddress, city, state, postalCode, country } =req.body;

    const updatedAddress = await AddressModel.findByIdAndUpdate(
      addressId,
      { type, streetAddress, city, state, postalCode, country },
      { new: true }
    );

    if (!updatedAddress) {
      return res.status(404).json({ ok: false, msg: "Address not found" });
    }

    res.status(200).json({ ok: true, msg: "Address updated successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ ok: false, msg: "Server error", error: error.message });
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
export const removeOrders=async(req,res)=>{
  const  orderId=req.params.id
  try {
    const result = await OrderModel.findByIdAndUpdate(orderId,{isCanceld:true});

    if (!result) {
      return res.status(404).json({ ok: false, msg: "orders not found." });
    }

    res.json({ ok: true, msg: "order canceld successfully." });
  } catch (error) {
    console.error("Error order cancleing:", error);
    res
      .status(500)
      .json({
        ok: false,
        msg: "An error occurred while order canceling.",
      });
  }
}