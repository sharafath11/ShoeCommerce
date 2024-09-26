import express from "express";
import { registerGetFn, userRegister,} from "../controller/userConteroller/registerController.js";
import { loginGetFn, loginPost } from "../controller/userConteroller/loginController.js";
import { homeRender } from "../controller/userConteroller/home.js";
import { otp } from "../controller/userConteroller/otpController.js";
import passport from "passport";
import '../controller/userConteroller/googleAuth.js'
import { authFailure, authProtected, authSuccess, catchError, googleAuthCallback, } from "../controller/userConteroller/googleAuth.js";
import { getSingleProdect } from "../controller/userConteroller/getSingleProdect.js";
import { getCheckout } from "../controller/userConteroller/checkoutController.js";
import { getContact } from "../controller/userConteroller/contactController.js";
import {  addToCart, cartRenderPage, qtyHandler, removeCart} from "../controller/userConteroller/cartController.js";
import {  protectedHand } from "../controller/userConteroller/protectedRoutes.js";
import { logoutFn } from "../controller/userConteroller/logoutController.js";
import { removeWhislist, renderWishlistPage, whislistFn } from "../controller/userConteroller/whislistController.js";
import noCache from "../middleware/cachClear.js";
import { shopDetialsRender } from "../controller/userConteroller/shopeDetials.js";

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

router.get('/auth/protected', protectedHand,noCache, authProtected);
router.get("/login",noCache,loginGetFn)
router.post("/login",noCache,loginPost)
router.get("/logout",logoutFn)
// router.get("/category",getCategory)
router.get("/checkout",protectedHand,getCheckout)
router.get("/contact",getContact)
router.post("/auth/google/login")
router.get("/singleprodect/:id",getSingleProdect)
router.post("/whislistAdd/:id",protectedHand,whislistFn)
router.get('/wishlist', protectedHand,renderWishlistPage)
router.get("/remove-from-wishlist/:id",removeWhislist)
router.get("/addToCart/:id",protectedHand,addToCart)
router.get("/cart",protectedHand,cartRenderPage)
router.delete("/cart/remove/:id",removeCart)
router.post('/cart/update-quantity',qtyHandler );
router.get("/shopDetials",shopDetialsRender)
export default router