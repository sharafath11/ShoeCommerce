export const protect=((req,res,next)=>{
    if(req.session.admin){
        next()
    }
    else{
        res.render("admin/login")
    }
})