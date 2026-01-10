import mongoose from "mongoose";
import { categoryModel } from "../../models/category.js";
import ProductModel from "../../models/prodectsModel.js";
import OrderModel from "../../models/orderModel.js";
import CartModel from "../../models/cartModel.js";
import { deleteFromCloudinary } from "../../utils/cloudinaryUtil.js";


export const renderProductsPage = async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  try {
    const totalProducts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);
    const toastMessage = req.session.toast;
    delete req.session.toast;

    const products = await ProductModel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("categoryId");

    res.render("admin/prodects", {
      Products: products,
      currentPage: page,
      totalPages,
      message: toastMessage,
    });
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

export const renderAddProdects = async (req, res) => {
  try {
    const categories = await categoryModel.find({});
    res.render("admin/addProdects", { categories });
  } catch {
    res.status(500).send("Server Error");
  }
};

export const addProducts = async (req, res) => {
  try {
    let {
      name,
      brand,
      price,
      originalPrice,
      description,
      category,
      block,
      color,
      availableSize,
    } = req.body;

    if (await ProductModel.findOne({ name: name.toUpperCase() })) {
      return res.json({ ok: false, msg: "Product already added" });
    }

    const images = req.files
      ? req.files.map(file => ({
        url: file.path,
        public_id: file.filename,
      }))
      : [];

    brand = brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();
    name = name.toUpperCase();
    color = color.charAt(0).toUpperCase() + color.slice(1).toLowerCase();

    description = description
      .toLowerCase()
      .split(" ")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const parsedSizeStock = JSON.parse(availableSize);

    await ProductModel.create({
      name,
      brand,
      availableSize: parsedSizeStock,
      price,
      originalPrice,
      description,
      color,
      blocked: block === "true",
      categoryId: category,
      images,
    });

    req.session.toast = "Product added successfully";
    res.json({ ok: true, red: "/admin/products" });
  } catch {
    res.json({ ok: false, msg: "Something went wrong" });
  }
};

export const productListUnlist = async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.json({ success: false, message: "Invalid Product ID" });
  }

  try {
    const product = await ProductModel.findById(id);
    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    product.blocked = !product.blocked;
    await product.save();

    if (product.blocked) {
      await CartModel.updateMany(
        { "products.productId": id },
        { $pull: { products: { productId: id } } }
      );
    }

    res.json({
      success: true,
      message: product.blocked
        ? "Product unlisted successfully"
        : "Product listed successfully",
    });
  } catch {
    res.json({ success: false, message: "Internal Server Error" });
  }
};

export const renderEditPage = async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id).populate("categoryId");
    const categories = await categoryModel.find({});
    res.render("admin/editProducts", { product, categories });
  } catch {
    res.status(500).send("Server Error");
  }
};

export const editProducts = async (req, res) => {
  try {
    let {
      id,
      name,
      brand,
      sizes,
      price,
      originalPrice,
      description,
      category,
      block,
      color,
    } = req.body;

    const product = await ProductModel.findById(id);
    if (!product) {
      return res.json({ ok: false, msg: "Product not found" });
    }

    if (product.discountApplied > 0 && product.price !== Number(price)) {
      return res.json({ ok: false, msg: "Offer applied, price change not allowed" });
    }

    let newImages;
    if (req.files && req.files.length > 0) {
      if (product.images && product.images.length > 0) {
        for (const img of product.images) {
          await deleteFromCloudinary(img.public_id);
        }
      }

      newImages = req.files.map(file => ({
        url: file.path,
        public_id: file.filename,
      }));
    }

    brand = brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();
    name = name.toUpperCase();
    color = color.charAt(0).toUpperCase() + color.slice(1).toLowerCase();

    description = description
      .toLowerCase()
      .split(" ")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const updateData = {
      name,
      brand,
      availableSize: sizes ? JSON.parse(sizes) : product.availableSize,
      price,
      originalPrice,
      description,
      color,
      blocked: block === "true",
      categoryId: category,
    };

    if (newImages) updateData.images = newImages;

    await ProductModel.findByIdAndUpdate(id, updateData);

    req.session.toast = "Product updated successfully";
    res.json({ ok: true, red: "/admin/products" });
  } catch {
    res.status(500).json({ ok: false, msg: "Update failed" });
  }
};

export const returnOrders = async (req, res) => {
  const orders = await OrderModel.find({});
  res.json(orders);
};
