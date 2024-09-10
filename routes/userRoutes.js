import express from "express";
import { registerGetFn, userResiter} from "../controller/userConteroller/registerController.js";
import { loginGetFn } from "../controller/userConteroller/loginController.js";
import { homeRender } from "../controller/userConteroller/home.js";
import { otp } from "../controller/userConteroller/otpController.js";


const router=express.Router();
router.get("/",homeRender)
router.get("/register",registerGetFn);
router.post("/register",userResiter)
router.post("/send-otp",otp)
router.get("/login",loginGetFn);
//comment
export default router