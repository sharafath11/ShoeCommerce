import jwt from 'jsonwebtoken';

export const protectedHand = (req, res, next) => {
    const token = req.session.token;

    
    
    if (!token) {
        console.log('Token is undefined. Redirecting to login...');
        return res.redirect('/login'); // Redirect to login if token is missing
    }

    // If token exists, verify it
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log('Token verification failed:', err);
            return res.redirect('/login'); // Redirect if token is invalid or expired
        }

        // Token is valid, attach user info to req
        req.user = decoded;
        next(); // Proceed to the next middleware or route handler
    });
};
export const clearTheHeader=(req,res,next)=>{
//  const user=req.session.user;
//  if(user){
//     next();
//  }
//  else{
//     req.session.destroy((err) => {
//         if (err) {
//             console.log('Error destroying session:', err);
//             return res.status(500).send('Failed to logout.');
//         }
//         next()
//     });
//  }
next()

}
                  