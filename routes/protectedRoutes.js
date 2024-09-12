import jwt from 'jsonwebtoken';

export const protectedHand = (req, res, next) => {
    const token = req.session.token;

    if (token) {
        // Validate the token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                console.log(err);
                
                return res.redirect('/login'); // Token invalid or expired
            }
            req.user = decoded; // Optionally attach user info to the request
            next();
        });
    } else {
        res.redirect('/login');
    }
};

