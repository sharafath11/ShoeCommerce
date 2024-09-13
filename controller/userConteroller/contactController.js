export const getContact=((req,res)=>{
    const user=req.session.user
    res.render("user/contact",{user})
})