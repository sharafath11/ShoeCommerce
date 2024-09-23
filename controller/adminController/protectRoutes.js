import jwt from "jsonwebtoken"
export const verifyToken = (req, res, next) => {
    const token =  req.session.token   
    if (!token) {
        return res.status(403).json({ success: false, message: "No token provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            res.render("admin/404")
            // return res.status(401).json({ success: false, message: "Failed to authenticate token" });
        }
        req.userId = decoded.email; 
        next();
    });
};
