export const logoutFn = (req, res) => {
 try {
    req.session.destroy((err) => {
        if (err) {
            console.log('Error destroying session:', err);
            return res.status(500).send('Failed to logout.');
        }
        res.redirect('/login');
    });
 } catch (error) {
    return res.redirect("/ShowLoginMsg")
 }
};
