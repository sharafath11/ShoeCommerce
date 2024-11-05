import ProductModel from "../../models/prodectsModel.js";
import userModel from "../../models/userModel.js";
import OrderModel from "../../models/orderModel.js";

export const getAdmin = async (req, res) => {
  try {
    const newUsers = await userModel.find().sort({ createdAt: -1 }).limit(5);

    const totalRevenueResult = await OrderModel.aggregate([
      { $match: { paymentStatus: "Paid" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = totalRevenueResult[0]?.totalRevenue || 0;

    const totalSalesCount = await OrderModel.countDocuments({ paymentStatus: "Paid" });
    const totalUsers = await userModel.countDocuments();
    const totalProducts = await ProductModel.countDocuments();

    const outOfStockProducts = await ProductModel.find({
      availableSize: { $not: { $elemMatch: { stock: { $gt: 0 } } } },
    });

    const topTenSellingProducts = await OrderModel.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalQuantitySold: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalQuantitySold: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
    ]);

    const topTenSellingCategories = await OrderModel.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$productDetails.categoryId",
          totalQuantitySold: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalQuantitySold: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      { $unwind: "$categoryDetails" },
    ]);

    const topTenSellingBrands = await OrderModel.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$productDetails.brand",
          totalQuantitySold: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalQuantitySold: -1 } },
      { $limit: 10 },
    ]);

    const currentYear = new Date().getFullYear();

        // Initialize array for 12 months
        const monthlyRevenue = Array(12).fill(0);

        // Fetch monthly revenue data for the current year
        const monthlyRevenueResults = await OrderModel.aggregate([
            {
                $match: {
                    paymentStatus: "Paid",
                    orderDate: {
                        $gte: new Date(`${currentYear}-01-01`), // Start of the current year
                        $lt: new Date(`${currentYear + 1}-01-01`) // Start of the next year
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$orderDate" }, // Group by month (1-12)
                    totalRevenue: { $sum: "$totalAmount" }
                }
            },
            {
                $sort: { _id: 1 } // Sort by month
            }
        ]);

        // Format monthly revenue for the chart
        monthlyRevenueResults.forEach(result => {
            const month = result._id - 1; // Convert month (1-12) to index (0-11)
            monthlyRevenue[month] = result.totalRevenue; // Assign total revenue to the correct month
        });

       
        const startYear = currentYear - 2; // Two years before current year
        const endYear = currentYear + 1; // Include one year after the current year
        
        // Fetch revenue data for the last three years plus one additional year
        const yearlyRevenueResults = await OrderModel.aggregate([
            {
                $match: {
                    paymentStatus: "Paid",
                    orderDate: {
                        $gte: new Date(`${startYear}-01-01T00:00:00Z`),
                        $lte: new Date(`${endYear}-12-31T23:59:59Z`)
                    }
                }
            },
            {
                $group: {
                    _id: { $year: "$orderDate" },
                    totalRevenue: { $sum: "$totalAmount" }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);
        
        // Format yearly revenue for the past three years plus one additional year
        const yearlyRevenue = [0, 0, 0, 0]; // Initialize with zeros for the four years
        yearlyRevenueResults.forEach(result => {
            const yearIndex = result._id - startYear; // Calculate the index based on the year
            if (yearIndex >= 0 && yearIndex < 4) {
                yearlyRevenue[yearIndex] = result.totalRevenue; // Fill in the revenue data
            }
        });
        
        
        // Now send `yearlyRevenue` and `currentYear` to the frontend
        

        // Log for debugging
        console.log('Monthly Revenue:', monthlyRevenue);
        console.log('Yearly Revenue:', yearlyRevenue);



    const newOrders = await OrderModel.find().sort({ createdAt: -1 }).limit(5);

    res.render("admin/index", {
      topTenSellingBrands,
      topTenSellingCategories,
      topTenSellingProducts,
      newUsers,
      totalRevenue,
      totalSalesCount,
      totalUsers,
      totalProducts,
      outOfStockProducts,
      newOrders,
      monthlyRevenue,
      yearlyRevenue,  
      currentYear,
    });
  } catch (error) {
    console.error("Error fetching data for admin dashboard:", error);
    res.status(500).send("Internal Server Error");
  }
};
