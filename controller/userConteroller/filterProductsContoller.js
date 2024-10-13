import { categoryModel } from "../../models/category.js";
import ProductModel from "../../models/prodectsModel.js";

export const filteredProducts = async (req, res) => {
  try {
    const { brand, color, price, category, search, page = 1 } = req.query;
    const productsPerPage = 10;

    // Construct the query object
    let query = { blocked: false };
    if (brand) query.brand = brand;
    if (color) query.color = color;
    if (category) query.categoryId = category;
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [{ name: searchRegex }, { description: searchRegex }];
    }

    // Count total products
    const totalProducts = await ProductModel.countDocuments(query);

    // Fetch paginated products
    let products = await ProductModel.find(query)
      .populate("categoryId")
      .skip((page - 1) * productsPerPage)
      .limit(productsPerPage);

    // Sort products by price if applicable
    if (price) {
      if (price === "2") products.sort((a, b) => a.price - b.price); // Low to high
      else if (price === "3") products.sort((a, b) => b.price - a.price); // High to low
    }

    // Filter out blocked products
    const filteredProducts = products.filter(
      (item) => !item.blocked && !item.categoryId?.blocked
    );

    // Fetch categories for the filter options
    const categories = await categoryModel.find();
    const user = req.session.user;

    // Render the page with the filtered products
    res.render("user/shopeDetials", {
      user,
      products: filteredProducts,
      WishlistQty: 0, // Adjust based on actual logic
      categories,
      cartQty: req.session.cartQty || 0,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalProducts / productsPerPage),
    });
  } catch (error) {
    console.error("Error fetching shop details:", error);
    res.status(500).render("user/error", { message: "Internal server error" });
  }
}
