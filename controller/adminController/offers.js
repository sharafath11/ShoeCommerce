import { categoryModel } from "../../models/category.js"
import { CategoryOffer } from "../../models/categriesOffersModel.js";


export const renderOffersPage=async(req,res)=>{
    const categories=await categoryModel.find({})
  res.render("admin/offers",{categories})
}
export const addCoffers = async (req, res) => {
    try {
       
        const {
            title,
            description,
            discount,
            discountType,
            category,
            startDate,
            endDate
        } = req.body;

      
        if (!title || !description || discount === undefined || !discountType || !category || !startDate || !endDate) {
            return res.json({ok:false, msg: 'All fields are required.' });
        }

        const newOffer = new CategoryOffer({
            title,
            description,
            discount,
            discountType,
            category,
            startDate,
            endDate
        });

        await newOffer.save();
        return res.status(201).json({ok:true, msg: 'Offer added successfully!', offer: newOffer });
    } catch (error) {
        console.error("Error adding offer:", error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};