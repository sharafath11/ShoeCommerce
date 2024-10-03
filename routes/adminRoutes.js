import express from "express"
import { getAdmin } from "../controller/adminController/homeController.js";
import { getUsers, isBlockFn } from "../controller/adminController/userController.js";
import { adminLogin, adminLoginPost, adminLogout } from "../controller/adminController/loginController.js";
import {  verifyToken } from "../controller/adminController/protectRoutes.js";
import { getOrders, orderCnc, SingleOrder, updateOrder } from "../controller/adminController/orderController.js";
import noCache from "../middleware/cachClear.js";
import { addProducts,editProducts,productListUnlist,renderAddProdects,renderEditPage,renderProductsPage } from "../controller/adminController/prodectController.js";
import { addCategory, categorieBlock, editCategory, getAddCategory, getCategory, getEditCategory } from "../controller/adminController/categoryController.js";
import multer from "multer";
import path from 'path'

const router=express.Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images'); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); 
  }
});

const upload = multer({ storage: storage });
router.get("/",verifyToken, getAdmin)
router.get("/login",noCache,adminLogin)
router.post("/login",noCache,adminLoginPost)
router.post("/logout",verifyToken,adminLogout)
router.get("/orders",verifyToken,getOrders)
router.post("/updateOrder",verifyToken,updateOrder)
router.get("/orders/canceld",verifyToken,orderCnc)
router.get('/order/singleOrder/:id',SingleOrder)
router.get("/category",verifyToken,getCategory)
router.get("/category/addcategory",verifyToken,getAddCategory)
router.post("/category/add-category",verifyToken,addCategory)
router.get("/category/edit-category/:id",verifyToken,getEditCategory)
router.post("/category/edit-category/:id",verifyToken,editCategory)
router.post("/category/toggle-category/:id",verifyToken,categorieBlock)
router.get("/products",verifyToken,renderProductsPage)
router.get("/products/addproducts",verifyToken,renderAddProdects)
router.post("/products/add-products/",upload.array('croppedImages', 3),addProducts)
router.post('/products/list/:id',verifyToken,productListUnlist)
router.post('/products/unlist/:id',verifyToken,productListUnlist)
router.get("/products/edit/:id",verifyToken,renderEditPage)
router.post("/products/edit-products",verifyToken,upload.array('croppedImages', 3),editProducts)
router.get("/users",verifyToken,getUsers)
router.post('/users/toggle-block/:id',verifyToken,isBlockFn);

export default router