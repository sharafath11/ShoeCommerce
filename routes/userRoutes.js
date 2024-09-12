import express from "express";
import { registerGetFn, userResiter} from "../controller/userConteroller/registerController.js";
import { loginGetFn, loginPost } from "../controller/userConteroller/loginController.js";
import { homeRender } from "../controller/userConteroller/home.js";
import { otp } from "../controller/userConteroller/otpController.js";
import passport from "passport";
import '../controller/userConteroller/googleAuth.js'
import { authFailure, authProtected, authSuccess, googleAuthCallback } from "../controller/userConteroller/googleAuth.js";
import { verifyUser } from "../controller/userConteroller/verifyUser.js";
import { getSingleProdect } from "../controller/userConteroller/getSingleProdect.js";
import { getCategory } from "../controller/userConteroller/categoryController.js";
import { getCheckout } from "../controller/userConteroller/checkoutController.js";
import { getContact } from "../controller/userConteroller/contactController.js";
import { getCart } from "../controller/userConteroller/cartController.js";
import { protectedHand } from "./protectedRoutes.js";
const router=express.Router();

router.get("/",homeRender)
router.get("/register",registerGetFn);
router.post("/register",userResiter)
router.post("/send-otp",otp)
router.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'], session: false }));

// Callback route
router.get('/auth/google/callback', passport.authenticate('google', { session: false }), googleAuthCallback);

// Route for successful login
router.get('/auth/google/success', authSuccess);

// Route for login failure
router.get('/auth/google/failure', authFailure);


router.get('/auth/protected', protectedHand, authProtected);
router.get("/login",loginGetFn)
router.post("/login",loginPost)
router.get("/singleprodect",getSingleProdect)
router.get("/category",getCategory)
router.get("/checkout",protectedHand,getCheckout)
router.get("/contact",getContact)
router.get("/cart",protectedHand,getCart)
export default router