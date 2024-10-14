import { categoryModel } from "../../models/category.js";
import ProductModel from "../../models/prodectsModel.js";
import userModel from "../../models/userModel.js";
import Wishlist from "../../models/whislistModel.js";
export const filteredProducts = async (req, res) => {
  try {
    const { brand, color, sort, category, search, page = 1 } = req.query;
    const productsPerPage = 6;

    const query = { blocked: false };
    if (brand) query.brand = brand;
    if (color) query.color = color;
    if (category) query.categoryId = category;

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { name: searchRegex },
        { description: searchRegex }
      ];
    }

    const totalProducts = await ProductModel.countDocuments(query);

    let products = await ProductModel.find(query)
      .populate("categoryId")
      .skip((page - 1) * productsPerPage)
      .limit(productsPerPage)
      .lean();

    
    if (sort === "2") { 
      // Low to High
      products.sort((a, b) => a.price - b.price);
    } else if (sort === "3") { 
      // High to Low
      products.sort((a, b) => b.price - a.price);
    } else if (sort === "AZ") { 
      // A to Z
      products.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "ZA") { 
      // Z to A
      products.sort((a, b) => b.name.localeCompare(a.name));
    }

    const user = req.session.user;
    if (!user) {
      let categories = await categoryModel.find();
      return res.render("user/shopeDetials", {
        user: req.session.user,
        products,
        WishlistQty: 0,
        categories,
        cartQty: 0,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalProducts / productsPerPage),
      });
    }

    const [categories, wishlist] = await Promise.all([
      categoryModel.find(),
      Wishlist.findOne({ user: req.session.user._id })
    ]);

    const wishlistProducts = wishlist?.products || [];
    const uniqueWishlistProducts = [...new Set(wishlistProducts)];
    const WishlistQty = uniqueWishlistProducts.length;

    req.session.WishlistQty = WishlistQty;

    res.render("user/shopeDetials", {
      user: req.session.user,
      products,
      WishlistQty: WishlistQty || null,
      categories,
      cartQty: req.session.cartQty || 0,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalProducts / productsPerPage),
    });
  } catch (error) {
    console.error("Error fetching shop details:", error);
    return res.render("user/error");
  }
};
