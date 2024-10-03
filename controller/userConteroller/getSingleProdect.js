import { categoryModel } from "../../models/category.js"
import productModel from "../../models/prodectsModel.js"
export const getSingleProdect=async(req,res)=>{
    const user=req.session.user 

    const WishlistQty= req.session.WishlistQty
    const cartQty= req.session.cartQty
    const id=req.params.id
    const product = await productModel
  .findOne({ _id: id })
  .populate('categoryId').exec();
  const categories=await categoryModel.find()
    res.render('user/singleProduct',{user,product,WishlistQty,cartQty,categories})
}