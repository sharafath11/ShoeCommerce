import { categoryModel } from "../../models/category.js"
import productModel from "../../models/prodectsModel.js"
import ReviewModel from "../../models/ReviewModel.js"
export const getSingleProdect=async(req,res)=>{
  const id=req.params.id
    const user=req.session.user 
    const WishlistQty= req.session.WishlistQty
    const cartQty= req.session.cartQty
    const product = await productModel
  .findOne({ _id: id })
  .populate('categoryId').exec();
  const categories=await categoryModel.find()
    res.render('user/singleProduct',{user,product,WishlistQty,cartQty,categories})
}