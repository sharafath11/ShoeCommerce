
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const imageFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
        return cb(new Error("Only image files are allowed"), false);
    }
    cb(null, true);
};

const productStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "products",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [{ width: 800, height: 800, crop: "limit" }],
    },
});

const reviewStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "reviews",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [{ width: 500, height: 500, crop: "limit" }],
    },
});

export const productUpload = multer({
    storage: productStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});

export const reviewUpload = multer({
    storage: reviewStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 2 * 1024 * 1024 },
});

export const deleteFromCloudinary = async (publicId) => {
    if (!publicId) return;

    try {
        return await cloudinary.uploader.destroy(publicId);
    } catch (err) {
        console.error("Cloudinary delete failed:", err);
        throw err;
    }
};
