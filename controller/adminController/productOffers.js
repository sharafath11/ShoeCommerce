import { productOfferModel } from "../../models/productOffer.js";

export const productOfferPageRender = async (req, res) => {
  try {
    const { productName } = req.query;
    
    let filter = {};
    if (productName) {
      filter.productName = { $regex: productName, $options: "i" }; 
    }

  
    const offers = await productOfferModel.find(filter);

    res.render("admin/prductOffers", {
      offers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
