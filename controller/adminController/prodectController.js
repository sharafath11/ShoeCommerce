import mongoose from "mongoose";
import { categoryModel } from "../../models/category.js";
import ProductModel from "../../models/prodectsModel.js";

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
    res.status(500).send("Server Error");
  }
};

export const renderAddProdects = async (req, res) => {
  try {
    const categories = await categoryModel.find({});
    res.render("admin/addProdects", { categories });
  } catch (error) {}
};

// export const addProducts = async (req, res) => {
  
  
//   let {
//     name,
//     brand,
//     sizes,
//     price,
//     description,
//     category,
//     stock,
//     block,
//     color,
    
//   } = req.body;
  
  
   
//   try {
//     const images = req.files ? req.files.map((file) => file.path) : [];
//     console.log(images);
    
//     brand = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
//     //  description= description.charAt(0).toUpperCase() + description.slice(1).toLowerCase();
//     name = name.toUpperCase();
//     color = color.charAt(0).toUpperCase() + color.slice(1).toLowerCase();
//     const toTitleCase = (str) => {
//       return str
//         .toLowerCase()
//         .split(" ")
//         .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//         .join(" ");
//     };

//     description = toTitleCase(description);

//     const product = new ProductModel({
//       name,
//       brand,
//       availableSize: sizes.split(",").map((size) => size.trim()),
//       price,
//       description,
//       color,
//       stock,
//       blocked: block === "true",
//       categoryId: category,
//       images,
//     });

//     await product.save();
//     req.session.toast = "Product added successfully";
//     res.redirect("/admin/products");
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while adding the product" });
//   }
// };
export const addProducts = async (req, res) => {
  console.log('====================================');
  console.log(req.body);
  console.log('====================================');
  let {
    name,
    brand,
    sizes,
    price,
    description,
    category,
    stock,
    block,
    color,
  } = req.body;

  try {
    const images = req.files ? req.files.map((file) => file.path) : [];
    console.log(req.body); 
    brand = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
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

    // Save product to database
    const product = new ProductModel({
      name,
      brand,
      availableSize: sizes.split(",").map((size) => size.trim()),
      price,
      description,
      color,
      stock,
      blocked: block === "true",
      categoryId: category,
      images, // Save image paths
    });

    await product.save();
    req.session.toast = "Product added successfully";
    res.redirect("/admin/products");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while adding the product" });
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

    return res.status(200).json({
      success: true,
      message: product.blocked
        ? "Product unlisted successfully."
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
    name,
    brand,
    sizes,
    price,
    description,
    category,
    stock,
    block,
    color,
  } = req.body;
  brand = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  //  description= description.charAt(0).toUpperCase() + description.slice(1).toLowerCase();
  name = name.toUpperCase();
  color = color.toUpperCase();
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
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      id,
      {
        name,
        brand,
        availableSize: sizes.split(",").map((size) => size.trim()),
        price,
        description,
        color,
        stock,
        blocked: block === "true",
        categoryId: category,
      },
      { new: true }
    );

    if (!updatedProduct) {
      req.session.toast = "Product not found";
      return res.redirect("/admin/prodects");
    }

    req.session.toast = "Product updated successfully";
    res.redirect("/admin/prodects");
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the product" });
  }
};
