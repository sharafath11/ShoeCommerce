export const adminLogin=((req,res)=>{
    res.render("admin/login")
})
export const adminLoginPost=((req,res)=>{
    const {email,password}=req.body
    console.log(req.body);
    
    if(email===process.env.ADMIN&&password===process.env.ADMIN_PASSWORD){
        req.session.admin=true
        res.status(200).redirect("/admin")
    }
})