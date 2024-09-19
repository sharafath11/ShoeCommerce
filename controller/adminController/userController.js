import userModel from "../../models/userModel.js"

export const getUsers=async(req,res)=>{
    try {
        const toastMessage = req.session.toast;
        delete req.session.toast;
        const users = await userModel.find(); 
        res.render('admin/users', { Users: users ,message:toastMessage}); // Pass users to the EJS template
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
}
export const isBlockFn= async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id);
        user.block = !user.block; // Toggle the block status
        await user.save();
        res.json({ success: true, block: user.block });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'An error occurred while updating block status' });
    }
}
export const addusers=((req,res)=>{
    res.render("admin/adduser")
})