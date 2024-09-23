import jwt from "jsonwebtoken";
import userModel from "../../models/userModel.js";
import { verifyUser } from "./verifyUser.js";

export const protectedHand = async (req, res, next) => {
  const token = req.session?.token;
  const userLogged = req.session?.user;
  if(!userLogged){
    // return res.status(202).json({success:false,msg:"user not Login"})
    return res.send(`
      <html>
          <head>
              <title>Alert</title>
          </head>
          <body>
              <script>
                  alert("Please login");
                  window.location.href = "/login"; 
              </script>
          </body>
      </html>
  `);
  }
    
    const user = await userModel.findById(userLogged._id);
  

  console.log(user.block);

  if (!token || user.block ) {
    console.log("Token is undefined. Sending error message...");
    return res.redirect("/");
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("Token verification failed:", err);
     verifyUser();
      
    }

    req.user = decoded;

    next();
  });
};
