import jwt from 'jsonwebtoken'

export const adminLogin = (req, res) => {

        return res.render("admin/login");
   
      
};

export const adminLoginPost = (req, res) => {
    const { email, password } = req.body;
    console.log(req.body);

    if (email === process.env.ADMIN && password === process.env.ADMIN_PASSWORD) {
       
        const payload = {
            admin: true, 
            email, 
        };

        
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }); 

        req.session.token = token;
        res.status(200).json({
            success: true,
            token,
            msg: "Login successful",
            red:"/admin"
        });
       
    } else {
        res.status(401).json({ success: false, msg: "Somthing wrong" });
    }
};


export const adminLogout = (req, res) => {
    
    req.session.token=''
    res.redirect("/");
};
