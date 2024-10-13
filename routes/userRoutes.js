import express from "express";
import { registerGetFn, userRegister,} from "../controller/userConteroller/registerController.js";
import { loginGetFn, loginPost } from "../controller/userConteroller/loginController.js";
import { homeRender } from "../controller/userConteroller/home.js";
import { otp } from "../controller/userConteroller/otpController.js";
import passport from "passport";
import '../controller/userConteroller/googleAuth.js'
import { authFailure, authProtected, authSuccess, catchError, googleAuthCallback, } from "../controller/userConteroller/googleAuth.js";
import { getSingleProdect } from "../controller/userConteroller/getSingleProdect.js";
import { checkoutFn, getCheckout } from "../controller/userConteroller/checkoutController.js";
import { getContact } from "../controller/userConteroller/contactController.js";
import {  addToCart,  cartRenderPage, qtyHandler, removeCart,} from "../controller/userConteroller/cartController.js";
import {  protectedHand } from "../middleware/protectedRoutes.js";
import { logoutFn } from "../controller/userConteroller/logoutController.js";
import { removeWhislist, renderWishlistPage, whislistFn } from "../controller/userConteroller/whislistController.js";
import noCache from "../middleware/cachClear.js";
import { addAddress, getOrderReanderPage, profileRender, removeAddress, removeOrders, renderAddresPage, updateAddress, updateProfile } from "../controller/userConteroller/profileController.js";
import { showLogin } from "../middleware/showLogin.js";
import { forgetPassword, forgetPasswordRender, renderResetPasswordPage, resetPassword } from "../controller/userConteroller/forgotPassword.js";
import { changePassword, renderSettings } from "../controller/userConteroller/settings.js";
import { reviewHandler, reviewPagenation } from "../controller/userConteroller/reviewContoller.js";
import multer from 'multer';
import path from 'path';
import { filteredProducts } from "../controller/userConteroller/filterProductsContoller.js";
import { searchHand } from "../controller/userConteroller/searchController.js";
import { billContoller } from "../controller/userConteroller/billController.js";
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/reviewImages'); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
const router=express.Router();
router.get("/",homeRender)
router.get("/register",registerGetFn);
router.post("/register",userRegister)
router.post("/send-otp",otp)
//google login
router.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'], session: false }));
router.get('/auth/google/callback',catchError,passport.authenticate('google', { session: false }),googleAuthCallback);
router.get('/auth/google/success', authSuccess);
router.get('/auth/google/failure', authFailure);
router.get("/ShowLoginMsg",showLogin)
router.get('/auth/protected', protectedHand,noCache, authProtected);
router.get("/login",noCache,loginGetFn)
router.post("/login",noCache,loginPost)
router.get("/logout",logoutFn)
// router.get("/category",getCategory)
router.get("/checkout",protectedHand,noCache,getCheckout)
router.post("/checkout/cod",protectedHand,noCache,checkoutFn)
router.get("/contact",getContact)
router.post("/auth/google/login")
router.get("/singleprodect/:id",getSingleProdect)
router.post("/whislistAdd/:id",protectedHand,whislistFn)
router.get('/wishlist', protectedHand,renderWishlistPage)
router.get("/remove-from-wishlist/:id",removeWhislist)
router.post("/addToCart/:id",protectedHand,addToCart)
router.get("/cart",protectedHand,cartRenderPage)
router.delete("/cart/remove/:id",removeCart)
router.post('/cart/update-quantity',qtyHandler );
// router.get("/shopDetials",shopDetialsRender);
router.get("/profile",profileRender)
router.post("/update-profile/:id",protectedHand,updateProfile);
router.get("/address",renderAddresPage)
router.post("/addAddress",addAddress);
router.delete("/removeAddress/:id",removeAddress);
router.post("/updateAddress",updateAddress);
router.get("/orders",getOrderReanderPage)
router.delete("/removeOrder/:id",removeOrders)
router.get("/order/bill/:orderId",billContoller)
router.get("/forgot-password",forgetPasswordRender )
router.post("/forgot-password",forgetPassword )
router.get('/reset-password/:token', renderResetPasswordPage);
router.post('/reset-password', resetPassword);
router.get("/settings",renderSettings);
router.post("/changepassword",changePassword)
router.post("/product/reviews", upload.single('reviewImage'),reviewHandler)
router.get("/product/reviews",reviewPagenation);
router.get("/shop",filteredProducts)
router.get("/search",searchHand)
export default router