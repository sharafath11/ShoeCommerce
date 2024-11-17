import mongoose from "mongoose";
import { categoryModel } from "../../models/category.js";
import ProductModel from "../../models/prodectsModel.js";
import OrderModel from "../../models/orderModel.js";
import CartModel from "../../models/cartModel.js";

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
      totalPages: totalPages,
      message: toastMessage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(`
      <script>
        alert("Server Error! Please try again.");
        window.location.reload();
      </script>
    `);
  }
};

export const renderAddProdects = async (req, res) => {
  try {
    const categories = await categoryModel.find({});
    res.render("admin/addProdects", { categories });
  } catch (error) {
    res.status(500).send(`
      <script>
        alert("Server Error! ${error}");
        window.location.reload();
      </script>
    `);
  }
};


export const addProducts = async (req, res) => {
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

  try {
    const images = req.files ? req.files.map((file) => file.path) : [];
    brand = brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();
    name = name.toUpperCase();
    color = color.charAt(0).toUpperCase() + color.slice(1).toLowerCase();

    const productExist = await ProductModel.findOne({ name: name });
    if (productExist) {
      return res.status(200).json({ ok: false, msg: "Product already added" });
    }

    const toTitleCase = (str) => {
      return str
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    };
    description = toTitleCase(description);

    
    const parsedSizeStock = JSON.parse(availableSize);

    const product = new ProductModel({
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

    await product.save();
    req.session.toast = "Product added successfully";

    return res.status(200).json({ ok: true, msg: "Product added successfully", red: "/admin/products" });
  } catch (error) {
    console.error(error);
    return res.status(200).json({ ok: false, msg: `Somthing wrong `,  });
  }
};

export const productListUnlist = async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Product ID" });
  }

  try {
    const product = await ProductModel.findById(id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    product.blocked = !product.blocked;
    await product.save();
    if (product.blocked) {
      await CartModel.updateMany(
        { "products.productId": id }, 
        { $pull: { products: { productId: id } } }
      );
    }

    return res.status(200).json({
      success: true,
      message: product.blocked
        ? "Product unlisted successfully and removed from all carts."
        : "Product listed successfully.",
    });
  } catch (error) {
    console.error("Error toggling product status:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
export const renderEditPage = async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id)
      .populate("categoryId")
      .exec();
    const categories = await categoryModel.find({});
    console.log(product);

    res.render("admin/editProducts", { product, categories });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
export const editProducts = async (req, res) => {
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

  const images = req.files ? req.files.map((file) => file.path) : [];

  brand = brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();
  name = name.toUpperCase();
  color = color.charAt(0).toUpperCase() + color.slice(1).toLowerCase();

  const toTitleCase = (str) => {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  
  description = toTitleCase(description);
  
  try {

    const product = await ProductModel.findById(id);
    if (product.discountApplied > 0 && product.price !== price) {
      req.session.toast = "Offer applied, you cannot change the price";
      return res.json({ ok: false, msg: "Offer applied, you cannot change the price" });
    }

    let parsedSizes;
    if (sizes) {
      parsedSizes = JSON.parse(sizes); 
    } else {
      parsedSizes = []; 
    }

    const updateData = {
      name,
      brand,
      availableSize: parsedSizes, 
      price,
      originalPrice,
      description,
      color,
      blocked: block === "true",
      categoryId: category,
    };

    if (images.length > 0) {
      updateData.images = images;
    }

    const updatedProduct = await ProductModel.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedProduct) {
      req.session.toast = "Product not found";
      return res.redirect("/admin/products");
    }

    req.session.toast = "Product updated successfully";
    res.status(200).json({ ok: true, msg: "Edited successfully", red: "/admin/products" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating the product" });
  }
};
export const returnOrders=async(req,res)=>{
  const  returnOrders=await OrderModel.find({})
}