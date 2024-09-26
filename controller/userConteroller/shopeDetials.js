import { categoryModel } from "../../models/category.js"
import ProductModel from "../../models/prodectsModel.js"

export const shopDetialsRender=async(req,res)=>{
    const categories=await categoryModel.find()
    const products=await ProductModel.find()
    const user=req.session.user 
    const WishlistQty= req.session.WishlistQty
    const cartQty= req.session.cartQty
    res.render("user/shopeDetials",{user,WishlistQty,cartQty,categories,products})
}