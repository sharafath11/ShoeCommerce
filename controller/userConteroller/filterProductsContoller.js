import { categoryModel } from "../../models/category.js";
import ProductModel from "../../models/prodectsModel.js";
import Wishlist from "../../models/whislistModel.js";
export const filteredProducts = async (req, res) => {
  try {
    const { brand, color, sort, category, search, page = 1 } = req.query;
    const productsPerPage = 8;

    const query = { blocked: false };
    if (brand) query.brand = brand;
    if (color) query.color = color;
    if (category) query.categoryId = category;

    if (search) {
      const searchWords = search.split(" ").map(word => new RegExp(word, "i")); 
      query.$and = searchWords.map(wordRegex => ({
        $or: [
          { name: wordRegex },
          { description: wordRegex }
        ]
      }));
    }
    
    

    const totalProducts = await ProductModel.countDocuments(query);

    let productsN = await ProductModel.find(query)
    .populate("categoryId")
    .skip((page - 1) * productsPerPage)
    .limit(productsPerPage)
    .sort({ createdAt: -1 })
    .lean();
    const products = productsN.filter((item, index) => !item.blocked && !item.categoryId.blocked);
    
    if (sort === "2") { 

      products.sort((a, b) => a.price - b.price);
    } else if (sort === "3") { 

      products.sort((a, b) => b.price - a.price);
    } else if (sort === "AZ") { 

      products.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "ZA") { 

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
