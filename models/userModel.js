import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    block: {
        type: Boolean,
        default: false
    },
    googleUser: {
        type: Boolean,
        default: false
    },
    phone: {
        type: Number
    },
    googleId: {
        type: String,
        default: null
    },
    resetToken: {
        type: String 
    },
    resetTokenExpiration: {
        type: Date
    }
}, { timestamps: true });

const userModel = mongoose.model('User', userSchema);

export default userModel;
