import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import jwt from 'jsonwebtoken';
import userModel from '../../models/userModel.js';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/callback",
    passReqToCallback: true
},
async function(request, accessToken, refreshToken, profile, done) {
    try {
        // Create a JWT token
        const token = jwt.sign(
            { id: profile.id, email: profile.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        console.log("JWT Token Generated: ", token);

        // Pass the token instead of the user object (no session)
        done(null, { token, profile });
    } catch (error) {
        done(error, false);
    }
}));

// You don't need to serialize/deserialize the user because JWT handles it

// export const googleAuthCallback = (req, res) => {
//     const { token } = req.user; 
//     console.log(req.user.profile.id);
//     const users=userModel.find({email:req.user.profile.email})
//     if(users){

//     }
//     const newUser = new userModel({
//         googleUser:true,
//         googleId:req.user.profile.id,
//         isVerified:true,
//       });
//     res.json({ message: "Login Successfuldfdfdf", token }); 
// };
export const googleAuthCallback = async (req, res) => {
    try {
        const { token } = req.user; 
        const { id, email } = req.user.profile;

        // Check if the user exists
        const existingUser = await userModel.findOne({ email });

        if (existingUser) {
            // Update the existing user's Google-related fields
            existingUser.googleUser = true;
            existingUser.googleId = id;
            existingUser.isVerified = true;

            await existingUser.save(); // Save the updated user

            res.redirect("/")
        } else {
            // Create a new user if not found
            const newUser = new userModel({
                username: req.user.profile.name || 'Unknown', // Default value if name is not available
                email,
                googleUser: true,
                googleId: id,
                isVerified: true,
                // Add other fields if needed
            });

            await newUser.save(); // Save the new user
            res.redirect("/")

            // res.json({ message: "User created successfully", token });
        }
    } catch (error) {
        console.error('Error during Google auth callback:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
export const authSuccess = (req, res) => {
    res.json({ message: "Login Successful" });
};

export const authFailure = (req, res) => {
    res.send("Something went wrong. Please try again.");
};

export const authProtected = (req, res) => {
    const { email } = req.user;  // User info is available from the JWT payload
    res.send(`Hello ${email}, you have accessed a protected route!`);
};
