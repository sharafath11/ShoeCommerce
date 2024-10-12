import nodemailer from 'nodemailer';
import userModel from '../../models/userModel.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt'

export const forgetPasswordRender=(req,res)=>{
    const user = req.session.user;
    if (!user || !user._id) {
      return res.render("user/forgotPassword", {
        user: user,
        WishlistQty: 0,
        cartQty: req.session.cartQty,
      });
    }
    const WishlistQty = req.session.WishlistQty;
     res.render("user/forgotPassword", {
        user: user,
        WishlistQty: WishlistQty,
        cartQty: req.session.cartQty,
      });
}
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.user,
    pass: process.env.pass,
  },
});

export const forgetPassword = async (req, res) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(404).json({ success: false, msg: "User not found" });
  }
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetToken = resetToken; 
  user.resetTokenExpiration = Date.now() + 3600000;
  await user.save();
  const resetLink = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
  const mailOptions = {
    from: process.env.user,
    to: email,
    subject: 'Password Reset Request',
    text: `You requested a password reset. Click the link to reset your password: ${resetLink}`,
  };

  sendEmail(mailOptions);

  return res.status(200).json({ success: true, msg: "Please check your email for the reset link." });
};

function sendEmail(mailOptions) {
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
}
export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
   console.log('====================================');
   console.log(req.body);
   console.log('====================================');
    const user = await userModel.findOne({
        resetToken: token,
        resetTokenExpiration: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({ ok: false, msg: "Token is invalid or has expired" });
    }
    const salt = await bcrypt.genSalt(10); 
    user.password = await bcrypt.hash(newPassword, salt);

    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    return res.status(200).json({ ok: true, msg: "Password has been reset",red:"/login" });
};

export const renderResetPasswordPage=(req,res)=>{
    const { token } = req.params;
    const user = req.session.user;
    if (!user || !user._id) {
      return res.render("user/resetPassword", {
        user: user,
        WishlistQty: 0,
        cartQty: req.session.cartQty,
        token 
      });
    }
    const WishlistQty = req.session.WishlistQty;
     res.render("user/resetPassword", {
        user: user,
        WishlistQty: WishlistQty,
        cartQty: req.session.cartQty,
        token,
      });
}