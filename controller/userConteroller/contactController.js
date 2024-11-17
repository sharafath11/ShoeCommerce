export const getContact=((req,res)=>{
    const user=req.session.user
    const WishlistQty= req.session.WishlistQty
    const cartQty= req.session.cartQty
    res.render("user/contact",{user,WishlistQty,cartQty})
})