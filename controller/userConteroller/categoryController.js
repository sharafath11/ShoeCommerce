export const getCategory=((req,res)=>{
    const user=req.session.user 
    res.render("user/category",{user})
})