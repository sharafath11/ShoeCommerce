import express from "express";
import { registerGetFn, userResiter} from "../controller/userConteroller/registerController.js";
import { loginGetFn } from "../controller/userConteroller/loginController.js";
import { homeRender } from "../controller/userConteroller/home.js";
import { otp } from "../controller/userConteroller/otpController.js";
import passport from "passport";
import '../controller/userConteroller/googleAuth.js'
import { authFailure, authProtected, authSuccess, googleAuthCallback } from "../controller/userConteroller/googleAuth.js";
import { verifyUser } from "../controller/userConteroller/verifyUser.js";
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

// Protected route (requires valid JWT token)
router.get('/auth/protected', verifyUser, authProtected);
router.get("/login",loginGetFn)
export default router