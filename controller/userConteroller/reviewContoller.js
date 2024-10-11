import OrderModel from "../../models/orderModel.js";
import ReviewModel from "../../models/ReviewModel.js";

export const reviewHandler = async (req, res) => {
    const { name, rating, review, productId } = req.body;
    const imagePath = req.file ? req.file.path : null;
    const user = req.session.user;
  
    if (!user) {
      return res.json({ ok: false, msg: "Please login" });
    }
  
    try {

      const hasPurchased = await OrderModel.findOne({
        user: user._id,
        "items.productId": productId,
        status: "Completed",
      });
  
      if (!hasPurchased) {
        return res.json({
          ok: false,
          msg: "You can only review products you have purchased.",
        });
      }
  
     
      const existingReview = await ReviewModel.findOne({
        productId,
        userId: user._id,
      });
  
      if (existingReview) {
        return res.json({
          ok: false,
          msg: "You can only submit one review per product.",
        });
      }
  
      const newReview = new ReviewModel({
        productId,
        userId: user._id,
        name,
        rating,
        comment: review,
        imagePath,
      });
      await newReview.save();
  
      return res
        .status(201)
        .json({ ok: true, msg: "Review submitted successfully!" });
    } catch (error) {
      console.error("Error saving review:", error);
      return res.status(500).json({
        ok: false,
        msg: "An error occurred while submitting the review.",
      });
    }
  };
  

export const reviewPagenation = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const skip = (page - 1) * limit;

  try {
    const reviews = await ReviewModel.find({ productId: req.query.pid,isBlocked: false })
    
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const totalReviews = reviews.length;

    const totalPages = Math.ceil(totalReviews / limit);

    return res.status(200).json({
      ok: true,
      reviews,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("Error retrieving reviews:", error);
    return res
      .status(500)
      .json({ ok: false, msg: "An error occurred while retrieving reviews." });
  }
};
