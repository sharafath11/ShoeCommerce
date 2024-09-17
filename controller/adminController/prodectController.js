import mongoose from "mongoose";
import { categoryModel } from "../../models/category.js";
import ProductModel from "../../models/prodectsModel.js";
import multer from 'multer';
import path from 'path';

export const renderProductsPage = async (req, res) => {

  try {
    
    const Products = await ProductModel.find().populate('categoryId').exec();
    const toastMessage = req.session.toast;
    delete req.session.toast;
    res.render('admin/prodects', { Products,message:toastMessage });
   
} catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Internal Server Error');
}
};

export const renderAddProdects = async (req, res) => {
  try {
    const categories = await categoryModel.find({});
    res.render("admin/addProdects", { categories });
  } catch (error) {}
};

  export const addProducts = async (req, res) => {
    const { name, brand, sizes, price, description, category, stock, block } = req.body;
  
    try {
      // Check if files were uploaded
      const images = req.files ? req.files.map(file => file.path) : []; // Use req.files to get uploaded file paths
  
      // Create a new product document
      const product = new ProductModel({
        name,
        brand,
        availableSize: sizes.split(",").map(size => size.trim()),
        price,
        description,
        stock,
        blocked: block === 'true', // Convert block to boolean if necessary
        categoryId: category,
        images // Save image paths in the database
      });
  
      // Save the product to the database
      await product.save();
      req.session.toast = "Product added successfully";
      res.redirect("/admin/prodects");
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred while adding the product" });
    }
  };
  
export const deleteProducts=async(req,res)=>{
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid prodcts ID");
    }
  
    try {
      const deletedProduct = await ProductModel.findByIdAndDelete(id);
  
      if (!deletedProduct) {
        return res.status(404).send("products not found");
      }
      req.session.toast = "Product deleted succesfully";
      return res.redirect('/admin/prodects');
    } catch (error) {
      console.error("Error deleting products:", error);
      return res.status(500).send("Internal Server Error");
    }
}
export const renderEditPage=async(req,res)=>{
    try {
        // Fetch the product based on its ID
        const product = await ProductModel.findById(req.params.id).populate('categoryId').exec();
        
        // Fetch all categories from the Category collection
        const categories = await categoryModel.find({});
        res.render('admin/editProducts', { product, categories });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
}
export const editProducts = async (req, res) => {
    const { id, name, brand, sizes, price, description, category, stock, block } = req.body;

    try {
        console.log("body", req.body);

        // Find the product by ID and update its fields
        const updatedProduct = await ProductModel.findByIdAndUpdate(
            id, 
            {
                name,
                brand,
                availableSize: sizes.split(",").map((size) => size.trim()),
                price,
                description,
                stock,
                blocked: block, 
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
        res.status(500).json({ error: "An error occurred while updating the product" });
    }
};
