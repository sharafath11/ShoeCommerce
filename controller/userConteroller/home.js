import jwt from 'jsonwebtoken';

// Replace 'your_jwt_secret' with your actual JWT secret
const JWT_SECRET = 'your_jwt_secret';

export const homeRender = (req, res) => {
    const user=req.session.user;
    res.render('user/index', { user: user });
}
