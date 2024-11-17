import dotenv from "dotenv";
import nodemailer from "nodemailer";
import OTP from "../../models/otpModel.js";

dotenv.config();

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.user,
    pass: process.env.pass,
  },
});

function sendEmail(mailOptions) {
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
}

export const otp = async (req, res) => {
  const { email } = req.body;

  const otpCode = generateOTP();
  let mailOptions = {
    from: process.env.user,
    to: email,
    subject: `Your ST SHOE OTP is ${otpCode}`,
    text: `Hello, your OTP for registration is: ${otpCode}. It is valid for 5 minutes.`,
  };

  sendEmail(mailOptions);

  const newOtp = new OTP({
    email,
    otp: otpCode,
  });
  await newOtp.save();
  return res.status(200).json({ success: true, msg: "OTP sent successfully" });
};
