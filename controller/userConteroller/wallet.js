
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

    const wallet = await WalletModel.findOne({ user: id }).populate('transactions.productId');
    if (!wallet) {
      console.log('No wallet found for the user.');
      return res.render("user/error");
    }

    res.render("user/wallet", {
      user,
      cartQty,
      WishlistQty,
      wallet: {
        ...wallet.toObject(),
        transactions: wallet.transactions,
      },
    });
  } catch (error) {
    console.log(error);
    return res.render("user/error");
  }
};
