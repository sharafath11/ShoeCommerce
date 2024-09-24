import mongoose from "mongoose";
import { categoryModel } from "../../models/category.js";
export const getCategory = async (req, res) => {
  try {
    
    let page = parseInt(req.query.page) || 1;
    const limit = 10; 
    const skip = (page - 1) * limit;

   
    const categories = await categoryModel.find({})
        .skip(skip)
        .limit(limit);

   
    const totalCategories = await categoryModel.countDocuments();

    const totalPages = Math.ceil(totalCategories / limit); 

    
    const toastMessage = req.session.toast;
    delete req.session.toast;

    
    res.render("admin/category", { 
        message: toastMessage, 
        categories: categories,
        currentPage: page,
        totalPages: totalPages
    });
} catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
}

};
export const getAddCategory = (req, res) => {
  res.render("admin/addCategory");
};

export const addCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const existingCategory = await categoryModel.findOne({ name: { $regex: `^${name}$`, $options: '' } });
    if (existingCategory) {
        return res.send(`
      <html>
          <body>
              <script>
                  alert("This categoris alredy uploaded");
                  window.location.href = "/admin/category/addcategory"; 
              </script>
          </body>
      </html>
  `);
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
export const categorieBlock = async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid Category ID" });
  }

  try {
    const category = await categoryModel.findById(id);
    
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    // Toggle the blocked status
    category.blocked = !category.blocked;

    // Save the updated category
    await category.save();

    return res.status(200).json({
      success: true,
      message: category.blocked ? "Category blocked successfully" : "Category unblocked successfully",
      blocked: category.blocked
    });
  } catch (error) {
    console.error("Error toggling category blocked status:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
