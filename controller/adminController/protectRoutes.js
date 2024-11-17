import jwt from "jsonwebtoken"
export const verifyToken = (req, res, next) => {
    const token =  req.session.token   
    if (!token) {
        return  res.render("admin/404")
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            res.render("admin/404")
           
        }
        req.userId = decoded.email; 
        next();
    });
};
