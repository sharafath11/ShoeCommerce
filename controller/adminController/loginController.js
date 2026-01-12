import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()
export const adminLogin = (req, res) => {

        return res.render("admin/login");
   
      
};
export const adminLoginPost = (req, res) => {
  const email = String(req.body.email || "").trim();
  const password = String(req.body.password || "").trim();

  console.log("INPUT:", email, password);
  console.log("ENV:", process.env.ADMIN, process.env.ADMIN_PASSWORD);

  if (
    email === process.env.ADMIN &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = jwt.sign(
      { admin: true, email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    req.session.token = token;

    return res.json({
      success: true,
      red: "/admin"
    });
  }

  return res.status(401).json({
    success: false,
    msg: "Invalid credentials"
  });
};


export const adminLogout = (req, res) => {
    
    req.session.token=''
    res.redirect("/");
};
