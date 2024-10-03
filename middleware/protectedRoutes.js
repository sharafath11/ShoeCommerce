import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { logoutFn } from "../controller/userConteroller/logoutController.js";


export const protectedHand = async (req, res, next) => {
  const token = req.session?.token;
  const userLogged = req.session?.user;
  if(!userLogged){
   return res.redirect("/ShowLoginMsg")
  
  }
    
    const user = await userModel.findById(userLogged._id);
  

  console.log(user.block);

  if (!token || user.block ) {
    console.log("Token is undefined. Sending error message...");
    return res.redirect("/");
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      logoutFn()
      
    }

    req.user = decoded;

    next();
  });
};
