import mongoose from "mongoose";
import { categoryModel } from "../../models/category.js";
import ProductModel from "../../models/prodectsModel.js";


export const renderProductsPage = async (req, res) => {
  try {
    const Products = await ProductModel.find().populate('categoryId').exec();
   
    
    const toastMessage = req.session.toast;
    delete req.session.toast;
   
    // res.json({ ok: true, msg: "Products fetched successfully"});
    return res.render("admin/prodects",{Products,message:toastMessage})
  } catch (error) {
    console.error('Error fetching products:', error.message, error.stack); 
    res.status(500).json({ ok: false, msg: "Internal Server Error" }); 
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
      const images = req.files ? req.files.map(file => file.path) : []; 
  
    
      
      const product = new ProductModel({
        name,
        brand,
        availableSize: sizes.split(",").map(size => size.trim()),
        price,
        description,
        stock,
        blocked: block === 'true', 
        categoryId: category,
        images 
      });
  
    
      await product.save();
      req.session.toast = "Product added successfully";
      res.redirect("/admin/prodects");
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred while adding the product" });
    }
  };
  
export const productListUnlist = async (req, res) => {
  const id = req.params.id;
console.log('====================================');
console.log(id);
console.log('====================================');
 
  if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Product ID' });
  }

  try {
      const product = await ProductModel.findById(id);
      
      if (!product) {
          return res.status(404).json({ success: false, message: 'Product not found' });
      }

     
      product.blocked = !product.blocked;
      await product.save();

      return res.status(200).json({
          success: true,
          message: product.blocked ? 'Product unlisted successfully.' : 'Product listed successfully.'
      });
  } catch (error) {
      console.error('Error toggling product status:', error);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
export const renderEditPage=async(req,res)=>{
    try {
       
        const product = await ProductModel.findById(req.params.id).populate('categoryId').exec();
        
        
       
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
    
      
        const updatedProduct = await ProductModel.findByIdAndUpdate(
            id, 
            {
                name,
                brand,
                availableSize: sizes.split(",").map((size) => size.trim()),
                price,
                description,
                stock,
                blocked: block==='true', 
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
