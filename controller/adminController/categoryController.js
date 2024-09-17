import mongoose from "mongoose";
import { categoryModel } from "../../models/category.js";
export const getCategory = async (req, res) => {
  const toastMessage = req.session.toast;
  delete req.session.toast;
  const categories = await categoryModel.find({});
  res.render("admin/category", { message: toastMessage, categories });
  
};
export const getAddCategory = (req, res) => {
  res.render("admin/addCategory");
};

export const addCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const existingCategory = await categoryModel.findOne({ name });
    if (existingCategory) {
      return res.redirect("/admin/addCategory");
    }

    const newCategory = new categoryModel({
      name,
      description,
    });

    await newCategory.save();
    req.session.toast = "category added successfully";
    res.redirect("/admin/category")
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getEditCategory = async (req, res) => {
  const id = req.params.id;

  // Check if the id is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.error("Invalid Category ID:", id);
    return res.status(400).send("Invalid Category ID");
  }

  try {
    const categorie = await categoryModel.findOne({ _id: id });

    if (!categorie) {
      return res.status(404).send("Category not found");
    }

    console.log("Categoie found:", categorie);
    return res.render("admin/editCategory", { categorie });
  } catch (error) {
    console.error("Error fetching category:", error);
    return res.status(500).send("Internal Server Error");
  }
};

export const editCategory = async (req, res) => {
  const id = req.params.id;
  const { name, description } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid Category ID");
  }

  try {
    const category = await categoryModel.findOne({ _id: id });

    if (!category) {
      return res.status(404).send("Category not found");
    }

    // Update the category's fields
    category.name = name || category.name;
    category.description = description || category.description;
    await category.save();
    req.session.toast = "Updated Category";
    res.redirect('/admin/category');
  } catch (error) {
    console.error("Error updating category:", error);
    return res.status(500).send("Internal Server Error");
  }
};
export const deleteCatCategorie = async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid Category ID");
  }

  try {
    const deletedCategory = await categoryModel.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).send("Category not found");
    }
    req.session.toast = "deleted succesfully";
    return res.redirect('/admin/category');
  } catch (error) {
    console.error("Error deleting category:", error);
    return res.status(500).send("Internal Server Error");
  }
};
