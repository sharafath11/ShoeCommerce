export const logoutFn = (req, res) => {
    
    req.session.destroy((err) => {
        if (err) {
            console.log('Error destroying session:', err);
            return res.status(500).send('Failed to logout.');
        }

       
        res.redirect('/');
    });
};
