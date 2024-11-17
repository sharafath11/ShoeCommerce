import nodemailer from 'nodemailer';
import userModel from '../../models/userModel.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

export const forgetPasswordRender = (req, res) => {
  try {
    const user = req.session.user || {};
    const WishlistQty = req.session.WishlistQty || 0;
    const cartQty = req.session.cartQty || 0;

    res.render("user/forgotPassword", {
      user,
      WishlistQty,
      cartQty,
    });
  } catch (error) {
    console.error("Error rendering forgetPassword page:", error);
    res.render("user/error");
  }
};

let transporter;
try {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.user,
      pass: process.env.pass,
    },
  });
  console.log("Nodemailer transporter initialized successfully");
} catch (error) {
  console.error("Error initializing Nodemailer transporter:", error);
}

export const forgetPassword = async (req, res) => {
  try {
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
  } catch (error) {
    console.error("Error fetching shop details:", error);
        return res.render("user/error");
  }
};

function sendEmail(mailOptions) {
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
}

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await userModel.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      return res.json({ ok: false, msg: "Token is invalid or has expired" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    return res.status(200).json({ ok: true, msg: "Password has been reset", red: "/login" });
  } catch (error) {
    console.error("Error fetching shop details:", error);
        return res.render("user/error");
  }
};

export const renderResetPasswordPage = (req, res) => {
  try {
    const { token } = req.params;
    const user = req.session.user || {};
    const WishlistQty = req.session.WishlistQty || 0;
    const cartQty = req.session.cartQty || 0;

    res.render("user/resetPassword", {
      user,
      WishlistQty,
      cartQty,
      token,
    });
  } catch (error) {
    console.error("Error rendering resetPassword page:", error);
    res.render("user/error");
  }
};
