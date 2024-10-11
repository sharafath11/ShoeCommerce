import { logoutFn } from "../controller/userConteroller/logoutController.js";
import userModel from "../models/userModel.js";
import jwt from 'jsonwebtoken'
export const protectedHand = async (req, res, next) => {
  const token = req.session?.token;
  const userLogged = req.session?.user;
  
  if (!userLogged) {
    return res.redirect("/ShowLoginMsg");
  }
  
  const user = await userModel.findById(userLogged._id);

  console.log(user.block);

  if (!token || user.block) {
    return res.redirect("/");
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return logoutFn(req, res);
    }

    req.user = decoded;
    next();
  });
};
