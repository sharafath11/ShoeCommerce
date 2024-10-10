import ProductModel from "../../models/prodectsModel.js";

export const searchHand=async(req,res)=>{
    const searchQuery = req.query.query;

  try {
    const products = await ProductModel.find({
      name: { $regex: searchQuery, $options: 'i' }  // Case insensitive 
    });
    res.json({ products });
  } catch (error) {
    console.log('Search error:', error);
    res.status(500).send('Server Error');
  }
}