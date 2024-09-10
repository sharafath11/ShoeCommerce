import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();
let otpStore = {};
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

export const otp = (req, res) => {
  const { email } = req.body;

  const otpCode = generateOTP();

  otpStore[email] = { code: otpCode, expiresAt: Date.now() + 5 * 60 * 1000 }; // 5 minutes expiration

  let mailOptions = {
    from: process.env.user,
    to: email,
    subject: `Your OTP is ${otpCode}`,
    text: `Hello, your OTP for registration is: ${otpCode}. It is valid for 5 minutes.`,
  };

  sendEmail(mailOptions);

  return res.status(200).json({ msg: "OTP sent successfully" });
};
export  {otpStore}
