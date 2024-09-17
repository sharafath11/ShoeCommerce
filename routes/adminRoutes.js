import express from "express"
import { getAdmin } from "../controller/adminController/homeController.js";
import { getUsers } from "../controller/adminController/userController.js";
import { adminLogin, adminLoginPost } from "../controller/adminController/loginController.js";
import { protect } from "../controller/adminController/protectRoutes.js";
import { getOrders } from "../controller/adminController/orderController.js";
import { addProducts,deleteProducts,editProducts,renderAddProdects,renderEditPage,renderProductsPage } from "../controller/adminController/prodectController.js";
import { addCategory, deleteCatCategorie, editCategory, getAddCategory, getCategory, getEditCategory } from "../controller/adminController/categoryController.js";
import multer from "multer";
import path from 'path'

const router=express.Router();
const diskStorage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, 'public/images'); // Set this relative to your project structure
    },
    filename: function(req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)); // Use timestamp to avoid duplicate file names
    }
  });
  const upload = multer({ storage: diskStorage });
router.get("/",protect, getAdmin)
router.get("/login",adminLogin)
router.post("/login",adminLoginPost)
router.get("/users",protect,getUsers)
router.get("/orders",protect,getOrders)
router.get("/category",protect,getCategory)
router.get("/category/addcategory",protect,getAddCategory)
router.post("/category/add-category",protect,addCategory)
router.get("/category/edit-category/:id",protect,getEditCategory)
router.post("/category/edit-category/:id",protect,editCategory)
router.get("/category/delet-categorye/:id",protect,deleteCatCategorie)
router.get("/prodects",protect,renderProductsPage)
router.get("/products/addproducts",protect,renderAddProdects)
router.post("/products/add-products/",upload.array('images', 3),addProducts)
router.get("/products/delete/:id",deleteProducts)
router.get("/products/edit/:id",renderEditPage)
router.post("/products/edit-products",editProducts)
export default router