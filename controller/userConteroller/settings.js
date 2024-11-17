import userModel from "../../models/userModel.js";
import bcrypt from 'bcrypt'
export const renderSettings=async(req,res)=>{
    try {
        const id = req.session.user._id;
        const WishlistQty = req.session.WishlistQty;
        const cartQty = req.session.cartQty;
    
        const user = await userModel.findById(id);

        if (!user) {
          res.redirect("/");
        }
    
        res.render("user/settings", { user, cartQty, WishlistQty });
      } catch (error) {
        return res.render("user/error");
   
      }
}


export const changePassword = async (req, res) => {

    const { currentPassword, newPassword } = req.body;
    const userId = req.session.user._id;

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(200).json({ok:false, msg: 'User not found' });
        }
        if (!user.password) {
            return res.status(200).json({ok:false, msg: 'This user login with google ' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.json({ ok:false,msg: 'Current password is incorrect' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedNewPassword;
        await user.save();

        res.status(200).json({ok:true, msg: 'Password changed successfully' });
    } catch (error) {
        console.error(error);
        return res.render("user/error");
   
    }
};
