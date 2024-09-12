export const getCheckout=((req,res)=>{
    const user=req.session.user;
    console.log(user);
    
    res.render("user/checkout",{user:user})
})