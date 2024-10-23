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
import { addAddress, deletePerItemInOrder, getOrderReanderPage, profileRender, removeAddress, removeOrders, renderAddressPage, updateAddress, updateProfile } from "../controller/userConteroller/profileController.js";
import { showLogin } from "../middleware/showLogin.js";
import { forgetPassword, forgetPasswordRender, renderResetPasswordPage, resetPassword } from "../controller/userConteroller/forgotPassword.js";
import { changePassword, renderSettings } from "../controller/userConteroller/settings.js";
import { reviewHandler, reviewPagenation } from "../controller/userConteroller/reviewContoller.js";
import multer from 'multer';
import path from 'path';
import { filteredProducts } from "../controller/userConteroller/filterProductsContoller.js";
import { billContoller } from "../controller/userConteroller/billController.js";
import { applyCoupen } from "../controller/userConteroller/coupenController.js";
import { createOrder, retryPayment, verifyRazorpay, verifyRetryPayment, } from "../controller/userConteroller/razorpay.js";
import { walletRender } from "../controller/userConteroller/wallet.js";
import { returnOrders } from "../controller/userConteroller/ordersReturn.js";
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
router.post("/logout",logoutFn)
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
router.get("/address",protectedHand,renderAddressPage)
router.post("/addAddress",protectedHand,addAddress);
router.delete("/removeAddress/:id",protectedHand,removeAddress);
router.post("/updateAddress",protectedHand,updateAddress);
router.get("/orders",protectedHand,getOrderReanderPage)
router.delete("/removeOrder/:id",protectedHand,removeOrders)
router.put("/delete-order-item/:orderId/:productId",protectedHand,deletePerItemInOrder)
router.get("/order/bill/:orderId",protectedHand,billContoller)
router.get("/forgot-password",forgetPasswordRender )
router.post("/forgot-password",forgetPassword )
router.get('/reset-password/:token', renderResetPasswordPage);
router.post('/reset-password', resetPassword);
router.get("/settings",renderSettings);
router.post("/changepassword",protectedHand,changePassword)
router.post("/product/reviews", upload.single('reviewImage'),reviewHandler)
router.get("/product/reviews",reviewPagenation);
router.get("/shop",filteredProducts)
router.post("/coupons/apply",protectedHand,applyCoupen);
router.post('/payment/create-order',createOrder)
router.post('/payment/verify',verifyRazorpay)
router.post("/payment/retry-payment",retryPayment)
router.post("/payment/retry-veryfy-payment",verifyRetryPayment)
router.get("/wallet",walletRender)
router.post("/orders/return",returnOrders)
export default router