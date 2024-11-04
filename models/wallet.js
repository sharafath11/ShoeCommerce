import mongoose from 'mongoose';
const { Schema } = mongoose;

const walletSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  balance: {
    type: Number,
    required: true,
    default: 0.0,
  },
  transactions: [
    {
      amount: {
        type: Number,
        required: true,
      },
      transactionType: {
        type: String,
        enum: ['credit', 'debit'],
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      size: {
        type: Number,
        required: true,
      },
      qty: {
        type: Number,
        required: true,
      },
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        // required: true,
      },
    
      reason: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const WalletModel = mongoose.model('Wallet', walletSchema);
export default WalletModel;
