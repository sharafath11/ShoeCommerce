import ReviewModel from "../../models/ReviewModel.js";

export const reviewHandler = async (req, res) => {
    const { name, rating, review, productId } = req.body;
    const imagePath = req.file ? req.file.path : null; 
    const user = req.session.user;
    if (!user) {
        return res.status(401).json({ ok: false, msg: "Please login" });
    }

    try {
        const newReview = new ReviewModel({
            productId,      
            userId: user._id,
            name,         
            rating,         
            comment: review, 
            imagePath,      
        });
        await newReview.save();

        return res.status(201).json({ ok: true, msg: "Review submitted successfully!" });
    } catch (error) {
        console.error('Error saving review:', error);
        return res.status(500).json({ ok: false, msg: "An error occurred while submitting the review." });
    }
};
