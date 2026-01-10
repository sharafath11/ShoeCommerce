import express from "express"
import { getAdmin } from "../controller/adminController/homeController.js";
import { getUsers, isBlockFn } from "../controller/adminController/userController.js";
import { adminLogin, adminLoginPost, adminLogout } from "../controller/adminController/loginController.js";
import { verifyToken } from "../controller/adminController/protectRoutes.js";
import { getOrders, orderCnc, returnOrders, SingleOrder, updateOrder } from "../controller/adminController/orderController.js";
import noCache from "../middleware/cachClear.js";
import { addProducts, editProducts, productListUnlist, renderAddProdects, renderEditPage, renderProductsPage } from "../controller/adminController/prodectController.js";
import { addCategory, categorieBlock, editCategory, getAddCategory, getCategory, getEditCategory } from "../controller/adminController/categoryController.js";
import { productUpload } from "../utils/cloudinaryUtil.js";
import { reviewBlockController, reviewRender } from "../controller/adminController/reviewsController.js";
import { addCoupen, coupenRender, coupenUpdate } from "../controller/adminController/coupen.js";
import { addCoffers, editCoffers, renderOffersPage } from "../controller/adminController/offers.js";
import { orderReturnAccept, orderReturnReject, } from "../controller/adminController/walletController..js";
import { saleReport } from "../controller/adminController/salesReport.js";
import { productOfferPageRender } from "../controller/adminController/productOffers.js";
import { addProductOFfersRenderPage, addOfferSearch, addproductOffers, editPrductOffers } from "../controller/adminController/addProductOffersController.js";

const router = express.Router();
// Multer config moved to config/cloudinary.js
router.get("/", verifyToken, getAdmin)
router.get("/login", noCache, adminLogin)
router.post("/login", noCache, adminLoginPost)
router.post("/logout", verifyToken, adminLogout)
router.get("/orders", verifyToken, getOrders)
router.post("/updateOrder", verifyToken, updateOrder)
router.get("/orders/canceld", verifyToken, orderCnc)

router.get('/order/singleOrder/:id', verifyToken, SingleOrder)
router.get("/category", verifyToken, getCategory)
router.get("/category/addcategory", verifyToken, getAddCategory)
router.post("/category/add-category", verifyToken, addCategory)
router.get("/category/edit-category/:id", verifyToken, getEditCategory)
router.post("/category/edit-category/:id", verifyToken, editCategory)
router.post("/category/toggle-category/:id", verifyToken, categorieBlock)
router.get("/products", verifyToken, renderProductsPage)
router.get("/products/addproducts", verifyToken, renderAddProdects)
router.post("/products/add-products", productUpload.array('images', 10), addProducts)
router.post('/products/list/:id', verifyToken, productListUnlist)
router.post('/products/unlist/:id', verifyToken, productListUnlist)
router.get("/products/edit/:id", verifyToken, renderEditPage)
router.post("/products/edit-products", verifyToken, productUpload.array('images', 10), editProducts)
router.get("/users", verifyToken, getUsers)
router.post('/users/toggle-block/:id', verifyToken, isBlockFn);
router.get('/reviews/:id', verifyToken, reviewRender);

router.patch('/reviews/:id', verifyToken, reviewBlockController)
router.get("/coupon", verifyToken, coupenRender)
router.post("/coupons/addCoupen", verifyToken, addCoupen)
router.put("/coupons/update", verifyToken, coupenUpdate)
router.get("/offers", verifyToken, renderOffersPage)
router.post("/addCoffers", verifyToken, addCoffers)
router.post("/editCoffers/:id", verifyToken, editCoffers)
router.get("/product-offers", verifyToken, productOfferPageRender);
router.get("/add/product/offer", addProductOFfersRenderPage);
router.post("/add/products/offer/search", addOfferSearch)
router.post("/add/product-offers", addproductOffers);
router.put("/product/edit/offers:offerId", editPrductOffers)
router.get("/orders/return", verifyToken, returnOrders)
router.post("/accept-return", verifyToken, orderReturnAccept)
router.post("/reject-return", verifyToken, orderReturnReject)
router.get("/sales/report", verifyToken, saleReport)

export default router