import { otpStore } from "./otpController.js";
import userModel from "../../models/userModel.js";
import bcrypt from 'bcrypt'
export const registerGetFn = (req, res) => {
  const user=req.session.user 
  res.render("user/register",{user});
};
export const userResiter = async(req, res) => {
  const { email, otp,username,password } = req.body;
  const user=userModel.find({email});


 if(!user){
  if (otpStore[email] && otpStore[email].expiresAt > Date.now()) {
    if (otpStore[email].code === otp) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create a new user object
      const newUser = new userModel({
        username,
        email,
        isVerified:true,
        password: hashedPassword
      });

      // Save the user to the database
      await newUser.save();
      
      delete otpStore[email]; 
     
      
      return res.redirect("/login");  // Successful registration
    } else {
      // Invalid OTP, display alert and redirect to register
      res.send(`
        <html>
          <script>
            alert('Invalid OTP!');
            window.location.href = '/register';  // Redirect after alert
          </script>
        </html>
      `);
    }
  } else {
    // OTP has expired or not found, display alert and redirect to register
    res.send(`
      <html>
        <script>
          alert('OTP has expired or not found!');
          window.location.href = '/register';  // Redirect after alert
        </script>
      </html>
    `);
  }
 }
 else{
  res.send(`
    <html>
      <script>
        alert('User alredy exisit');
        window.location.href = '/register';  // Redirect after alert
      </script>
    </html>
  `);
 }
}

