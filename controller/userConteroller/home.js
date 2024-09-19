import CartModel from "../../models/cartModel.js";
import ProductModel from "../../models/prodectsModel.js";
import Wishlist from "../../models/whislistModel.js";

export const homeRender = async (req, res) => {
    
    
    try {
        const user = req.session.user 
        const toastMessage = req.session.toast 
        delete req.session.toast;
        if(user){
            const cartItem = await CartModel.findOne({ userId: user._id }).populate('products.productId');

            req.session.cartQty=cartItem.products.length
            console.log(req.session.cartQty);
        }
        else{
            req.session.cartQty=0
        }
        
        // if (cartItem) {
         
        //   const cartQty = cartItem.products.reduce((total, item) => total + item.quantity, 0);
         
        //   req.session.cartQty = cartQty;
        // } else {
        //   req.session.cartQty = 0;
        // }
        
        // // Log the cart quantity for debugging
        // console.log('====================================');
        // console.log(req.session.cartQty);
        // console.log('====================================');
        
        const products = await ProductModel.find({});
        if (!user || !user._id) {
            return  res.render('user/index', { user: user, products, WishlistQty:0 ,message:toastMessage,cartQty:req.session.cartQty});
        }

        const wishlist = await Wishlist.findOne({ user: user._id });

       
        const wishlistProducts = wishlist && wishlist.products ? wishlist.products : [];

       
        const uniqueProducts = [...new Set(wishlistProducts)];
        const WishlistQty = uniqueProducts.length;

        
        req.session.WishlistQty = WishlistQty;

        
        res.render('user/index', { user: user, products, WishlistQty ,message:toastMessage,cartQty:req.session.cartQty});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
}
