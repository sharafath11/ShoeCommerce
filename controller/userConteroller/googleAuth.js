
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import jwt from "jsonwebtoken";
import userModel from "../../models/userModel.js";

// Google strategy configuration
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback",
      passReqToCallback: true,
    },
    async function (request, accessToken, refreshToken, profile, done) {
      try {
        const token = jwt.sign(
          { id: profile.id, email: profile.email },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        console.log("JWT Token Generated: ", token);
        done(null, { token, profile });
      } catch (error) {
        
        
        done(error, false);
      }
    }
  )
);

export const googleAuthCallback = async (req, res) => {
  try {
    const { id, email } = req.user.profile;
    let user = await userModel.findOne({ googleId: id }) || await userModel.findOne({ email });
    
    
    if (user) {
    
      if (!user.googleUser) {
        user.googleUser = true;
        user.googleId = id;
        user.isVerified = true;
        await user.save();
        console.log("Updated existing user to Google user");
      }
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
      req.session.user=user
      req.session.token=token
      res.redirect("/")
     
    } else {
    
      const { name } = req.user.profile || {};
      const username = name ? `${name.givenName || ""} ${name.familyName || ""}`.trim() : "Aro";
      user = new userModel({
        username,
        email,
        googleUser: true,
        googleId: id,
        isVerified: true,
      });
      await user.save();
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
      return res.status(200).json({
        success: true,
        token,
        message: "Registration Successful",
        redirect: "/",
      });
    }
  } catch (error) {
    console.error("Error during Google auth callback:", error);
    return res.render("user/error");
   
  }
};


export const authSuccess = (req, res) => {
  res.json({ message: "Login Successful" });
};

export const authFailure = (req, res) => {
  res.send("Something went wrong. Please try again.");
};
export const authProtected = (req, res) => {
  const { email } = req.user;
  res.send(`Hello ${email}, you have accessed a protected route!`);
};
export const catchError=(req,res,next)=>{

  if(req.query.error){
    return res.redirect("/")
  }
  else{
    next()
  }
 
  
}