
import userModel from "../../models/userModel.js";
import WalletModel from "../../models/wallet.js";
import Razorpay from "razorpay";
import crypto from 'crypto';

const razorpayI = new Razorpay({
  key_id:process.env.RKEY_ID,
  key_secret: process.env.RKEY_SECRET,
});


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
export const createAddmoneyWallet=async(req,res)=>{
  const { amount } = req.body;
  const options = {
      amount: amount * 100, 
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
  };

  try {
      const order = await razorpayI.orders.create(options);
      res.json({
          orderId: order.id,
          amount: order.amount*100,
          currency: order.currency,
      });
  } catch (error) {
      res.status(500).json({ error: "Failed to create order" });
  }
}
export const addMoneyWallet=async(req,res)=>{
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, amount } = req.body;

    const hash = crypto
        .createHmac("sha256", process.env.RKEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

    if (hash !== razorpay_signature) {
        return res.json({ ok: false, msg: "Payment verification failed!" });
    }

    try {
        let wallet = await WalletModel.findOne({ user:req.session.user ._id});
        wallet.balance += Number(amount);
        wallet.transactions.push({
            amount: amount,
            transactionType: 'credit',
            description: 'Money added to wallet',
            size: 0, 
            qty: 0,  
            productId: null, 
            reason: 'Wallet recharge',
            date: new Date(),
        });
        await wallet.save();

        res.json({ ok: true, msg: "Money added to wallet successfully!" });
    } catch (error) {
        console.error("Error updating wallet:", error);
        res.status(500).json({ ok: false, msg: "An error occurred while updating the wallet balance." });
    }
}