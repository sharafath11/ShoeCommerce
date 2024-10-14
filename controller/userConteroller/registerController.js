import OTP from "../../models/otpModel.js";
import userModel from "../../models/userModel.js";
import bcrypt from 'bcrypt';

export const registerGetFn = async (req, res) => {
  const user = req.session.user;
  res.render("user/register");
};
export const userRegister = async (req, res) => {
  try {
    const { email, otp, username, password } = req.body;
    const user = await userModel.findOne({ email });
    if (user) {
      return res.json({ success: false, msg: "User already exists" });
    }
    const otpDetails = await OTP.findOne({ email });   
    if (!otpDetails) {
      return res.json({ success: false, msg: "OTP has expired or is invalid" });
    } 
    if (otpDetails.otp === otp) {
    
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new userModel({
        username,
        email,
        isVerified: true,
        password: hashedPassword,
      });
      await newUser.save();
      await OTP.deleteOne({ email });

      return res.json({ success: true, msg: "User registered successfully", redirect: "/login" });
    } else {
      return res.json({ success: false, msg: "Invalid OTP" });
    }
  } catch (error) {
    console.error("Error during registration:", error);
    return res.render("user/error");
   
  }
};
