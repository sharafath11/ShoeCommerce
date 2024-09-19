export const getCategory=((req,res)=>{
    const user=req.session.user 
    const WishlistQty= req.session.WishlistQty
    const cartQty= req.session.cartQty
    res.render("user/category",{user,WishlistQty,cartQty})
})