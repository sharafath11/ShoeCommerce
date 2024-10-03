import AddressModel from "../../models/addressModel.js";
import CartModel from "../../models/cartModel.js";
import OrderModel from "../../models/orderModel.js";
import ProductModel from "../../models/prodectsModel.js";


export const getCheckout = async (req, res) => {
  try {
    const user = req.session.user;
    const WishlistQty = req.session.WishlistQty;
    const cartQty = req.session.cartQty;

    
    const cartDetails = await CartModel.findOne({ userId: user._id });
    const addresses = await AddressModel.find({ userId: user._id }).sort({ createdAt: -1 });
    if (!cartDetails) {
      return res.render("user/checkout", { user, WishlistQty, cartQty, cartItems: [] });
    }

    const cartItemsWithDetails = await Promise.all(
      cartDetails.products.map(async (cartItem) => {
        const productDetails = await ProductModel.findById(cartItem.productId);
        return {
          product: productDetails,
          quantity: cartItem.quantity,
        };
      })
    );

    res.render("user/checkout", {
      user,
      WishlistQty,
      cartQty,
      cartItems: cartItemsWithDetails,
      addresses
    });
  } catch (error) {
    console.error("Error fetching checkout details:", error);
    res.status(500).send("Error fetching checkout details");
  }
};
export const checkoutFn = async (req, res) => {
  try {
    const { cartItems, selectedAddresses } = req.body; 

    const orderItems = cartItems.map(item => ({
      productId:item.productId,
      name: item.name,
      description: item.description,
      imageUrl: item.imageUrl,
      price: item.price,
      quantity: item.quantity,
     
    }));
    const totalAmount = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const userId=req.session.user._id  
    const selectedAddress = selectedAddresses[0]; 
    
    const newOrder = new OrderModel({
      user:userId,
      items: orderItems,
      address: {
        type: selectedAddress.type,
        streetAddress: selectedAddress.streetAddress, 
        city: selectedAddress.city, 
        state: selectedAddress.state, 
        postalCode: selectedAddress.zip, 
        country: selectedAddress.country, 
      }, 
      totalAmount: totalAmount,
    });
    
    await newOrder.save();
    return res.status(201).json({ok:true, msg: "Order placed successfully!",red:"/orders"});
  } catch (error) {
    console.error("Error saving order:", error);
    return res.status(500).json({ok:false, msg: "Internal Server Error", error: error.message });
  }
};


