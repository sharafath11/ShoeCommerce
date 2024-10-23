import ProductModel from "../../models/prodectsModel.js";
import userModel from "../../models/userModel.js";
import WalletModel from "../../models/wallet.js";

export const walletRender = async (req, res) => {
  try {
    const id = req.session.user._id;
    const WishlistQty = req.session.WishlistQty;
    const cartQty = req.session.cartQty;

    const user = await userModel.findById(id);
    if (!user) {
      return res.redirect("/");
    }

    // Fetch the user's wallet and populate productId in transactions
    const walletss = await WalletModel.findOne({ user: id }).populate('transactions.productId');

    // Check if the wallet exists
    if (!walletss) {
      console.log('No wallet found for the user.');
      return res.render("user/error");
    }

    // Filter approved transactions
    const approvedTransactions = walletss.transactions.filter(transaction => transaction.status === 'approved');

    // Log the approved transactions for debugging
    console.log('Approved Transactions:', approvedTransactions);

    // Map over approved transactions to include product details
    const walletProducts = approvedTransactions.map(transaction => ({
      ...transaction.toObject(),  // Spread the transaction fields
      product: transaction.productId || null,  // Attach product details (if found)
    }));

    // Log the wallet products for debugging
    console.log("Wallet Products with Approved Transactions:", walletProducts);

    // Render the wallet view, passing only the approved transactions
    res.render("user/wallet", {
      user,
      cartQty,
      WishlistQty,
      wallet: {
        ...walletss.toObject(),  // Include the original wallet data
        transactions: walletProducts,  // Add only approved transactions
      },
    });
  } catch (error) {
    console.log(error);
    return res.render("user/error");
  }
};


