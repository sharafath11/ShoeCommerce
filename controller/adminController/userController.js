import userModel from "../../models/userModel.js"

export const getUsers=async(req,res)=>{
    try {
       
        let page = parseInt(req.query.page) || 1;
        const limit = 10; 
        const skip = (page - 1) * limit;
    
       
        const users = await userModel.find()
            .skip(skip)
            .limit(limit);
    
            const SlNo=users.length*page
        const totalUsers = await userModel.countDocuments();
    
        const totalPages = Math.ceil(totalUsers / limit); 
    
      
        const toastMessage = req.session.toast;
        delete req.session.toast;
    
        
        res.render('admin/users', { 
            Users: users,
            message: toastMessage,
            currentPage: page,
            totalPages: totalPages,
            
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
    
}
export const isBlockFn= async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id);
        user.block = !user.block; 
        await user.save();
        res.json({ ok: true, block: user.block,msg:"Are you sure " });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'An error occurred while updating block status' });
    }
}
