import { categoryModel } from "../../models/category.js";
import productModel from "../../models/prodectsModel.js";
import ReviewModel from "../../models/ReviewModel.js";

export const getSingleProdect = async (req, res) => {
  const id = req.params.id;
  const user = req.session.user;
  const WishlistQty = req.session.WishlistQty;
  const cartQty = req.session.cartQty;

  try {
    const product = await productModel
      .findOne({ _id: id })
      .populate('categoryId')
      .exec();
    if (!product) {
      return res.status(404).render('user/error', {
        message: 'Product not found',
        user,
        WishlistQty,
        cartQty
      });
    }
    const reviews = await ReviewModel.find({ productId: id, isBlocked: false });
;
    const averageRating = reviews.length > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      : 0; 
    const categories = await categoryModel.find();
    res.render('user/singleProduct', {
      user,
      product,
      WishlistQty,
      cartQty,
      categories,
      averageRating 
    });

  } catch (error) {
    console.error('Error fetching product details:', error);
   
  }
};
