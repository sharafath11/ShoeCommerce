export const getSingleProdect=((req,res)=>{
    const user=req.session.user 
    res.render('user/single-product',{user})
})