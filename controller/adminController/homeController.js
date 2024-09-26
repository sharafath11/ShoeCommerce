import ProductModel from "../../models/prodectsModel.js";
import userModel from "../../models/userModel.js";

export const getAdmin =async (req, res) => {
    const newUsers=await userModel.find().sort({ createdAt: -1 }).limit(5);
  
    const newProducts=await ProductModel.find().sort({ createdAt: -1 }).limit(5);
    res.render("admin/index",{newUsers,newProducts});
}
