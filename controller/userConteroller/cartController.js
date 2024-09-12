export const getCart=((req,res)=>{
    const user=req.session.user
    console.log("tyujuy",user);
    
    res.render("user/cart",{user:user})
})