import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../../models/userModel.js";


export const loginGetFn = (req, res) => {
  const user = req.session.user;
  const WishlistQty = req.session.WishlistQty;
  const cartQty = req.session.cartQty;
 if(!user){
  return res.render("user/login", { user, WishlistQty, cartQty });
 }
 return res.redirect("/")
};

export const loginPost = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found!",
      });
    }

    const isMatch =  bcrypt.compare(password, user.password);

    if (!isMatch || user.block) {
      return res.status(400).json({
        success: false,
        msg: "Invalid password! User is blocked or password is incorrect.",
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    req.session.token = token;
    req.session.user = user;

    return res.status(200).json({
      success: true,
      msg: "Login successful!",
      redirect: "/",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      msg: "Server error. Please try again later.",
    });
  }
};
