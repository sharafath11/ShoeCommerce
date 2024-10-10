import AddressModel from "../../models/addressModel.js";
import CartModel from "../../models/cartModel.js";
import OrderModel from "../../models/orderModel.js";
import ProductModel from "../../models/prodectsModel.js";


export const getCheckout = async (req, res) => {
  try {
    const { user, WishlistQty, cartQty } = req.session;
    const [cartDetails, addresses] = await Promise.all([
      CartModel.findOne({ userId: user._id }).lean(),
      AddressModel.find({ userId: user._id }).sort({ createdAt: -1 }).lean()
    ]);

    if (!cartDetails || cartDetails.products.length === 0) {
      return res.render("user/checkout", { user, WishlistQty, cartQty, cartItems: [], addresses });
    }

    const productIds = cartDetails.products.map((cartItem) => cartItem.productId);
    const products = await ProductModel.find({ _id: { $in: productIds } }).lean();
    const productMap = new Map(products.map(product => [product._id.toString(), product]));
    const cartItemsWithDetails = cartDetails.products.map((cartItem) => {
      return {
        product: productMap.get(cartItem.productId.toString()),
        quantity: cartItem.quantity,
        size: cartItem.size
      };
    });

    res.render("user/checkout", {
      user,
      WishlistQty,
      cartQty,
      cartItems: cartItemsWithDetails,
      addresses
    });
  } catch (error) {
    console.error("Error fetching checkout details:", error.message);
    res.status(500).send("An error occurred while fetching checkout details. Please try again.");
  }
};

export const checkoutFn = async (req, res) => {
  try {
    const { cartItems, selectedAddresses } = req.body; 

    const orderItems = cartItems.map(item => ({
      productId: item.productId,
      name: item.name,
      size: item.size,
      description: item.description,
      imageUrl: item.imageUrl,
      price: item.price,
      quantity: item.quantity,
    }));

    const totalAmount = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const userId = req.session.user._id;  
    const selectedAddress = selectedAddresses[0]; 

    for (const item of orderItems) {
      const product = await ProductModel.findById(item.productId); 

      if (!product) {
        return res.status(404).json({ ok: false, msg: "Product not found", red: "/cart" });
      }
      const sizeVariant = product.availableSize.find(size => size.size === item.size);

      if (!sizeVariant || sizeVariant.stock < item.quantity) {
        return res.status(400).json({ ok: false, msg: `Insufficient stock for size ${item.size}`, red: "/cart" });
      }

      sizeVariant.stock -= item.quantity;
      await product.save();
    }
    function generateOrderId() {
      return 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
    
    const orderId = generateOrderId();
    const newOrder = new OrderModel({
      user: userId,
      items: orderItems,
      address: {
        type: selectedAddress.type,
        streetAddress: selectedAddress.streetAddress, 
        city: selectedAddress.city, 
        state: selectedAddress.state, 
        postalCode: selectedAddress.zip, 
        country: selectedAddress.country, 
      }, 
      totalAmount: totalAmount+50,
      orderId:orderId
    });

    await newOrder.save();
    const cart = await CartModel.deleteOne({ userId: userId });
    return res.status(201).json({ ok: true, msg: "Order placed successfully!", red: "/orders" });
    
} catch (error) {
    console.error("Error saving order:", error);
    return res.status(500).json({ ok: false, msg: "Internal Server Error", error: error.message });
}

};


