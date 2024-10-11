import mongoose from "mongoose";
import ReviewModel from "../../models/ReviewModel.js";
import ProductModel from "../../models/prodectsModel.js";
export const reviewRender = async (req, res) => {
  const productId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).send("Invalid product ID");
  }
  try {
    const reviews = await ReviewModel.find({ productId }).sort({
      createdAt: -1,
    });
    const products=await ProductModel.find({_id:productId})
    console.log('====================================');
    console.log(products);
    console.log('====================================');
    const averageRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) /
        reviews.length || 0;

    res.render("admin/reviews", { reviews, averageRating ,products});
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).send("Server error");
  }
};
export const reviewBlockController = async (req, res) => {
  const reviewId = req.params.id;
  const { isBlocked } = req.body;

  try {
    const review = await ReviewModel.findByIdAndUpdate(
      reviewId,
      { isBlocked },
      { new: true }
    );

    if (!review) {
      return res.json({ ok: false, msg: "Review not found" });
    }

    res.json({ ok: true, msg: "Review status updated successfully", review });
  } catch (error) {
    res.status(500).json({ message: "Error updating review", error });
  }
};
