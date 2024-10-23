import OrderModel from "../../models/orderModel.js";

export const getOrders = async (req, res) => {
  const searchQuery = req.query.search || ''; 

  try {
    const orders = await OrderModel.find({
      isCanceld: false,
      orderId: { $regex: searchQuery, $options: 'i' }, 
    }).sort({ orderDate: -1 });
    res.render("admin/orders", { orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateOrder = async (req, res) => {
  const { orderStatus, orderId } = req.body;
  
  try {
    const updateFields = { status: orderStatus }; 
    if (orderStatus === 'Delivered') {
      updateFields.paymentStatus = 'Paid';
      updateFields.deliveredDate = new Date(); 
      const addDays = (date, days) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
      };
      
      updateFields.returnEndDate = addDays(updateFields.deliveredDate, 3);
    }
    const updatedOrder = await OrderModel.findByIdAndUpdate(
      orderId,
      updateFields,
      { new: true }
    );
    res.json({
      ok: true,
      msg: "Order updated successfully",
      status: orderStatus,
      paymentStatus: updatedOrder.paymentStatus,
      deliveryDate: updatedOrder.deliveredDate 
    });
  } catch (error) {
    console.error(error);
    res.json({
      ok: false,
      msg: "Failed to update order",
    });
  }
};


export const orderCnc = async (req, res) => {
  const searchQuery = req.query.search || ''; 

  try {
    let canceldOrders = (await OrderModel.find()).filter((item) => item.isCanceld);
    if (searchQuery) {
      canceldOrders = canceldOrders.filter((order) =>
        order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) 
      );
    }
    res.render("admin/canceldOrders", { orders: canceldOrders });
  } catch (error) {
    console.error('Error fetching canceled orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const SingleOrder=async(req,res)=>{
  const orederId=req.params.id
  const order = await OrderModel.findById(orederId);
  const ordersArray = order ? [order] : [];
  res.render("admin/SingleOrder",{orders:ordersArray})
}


export const returnOrders = async (req, res) => {
  try {
    const ordersWithReturns = await OrderModel.find({
      "items.isReturned": true,
    })
    .populate('user', 'username') 
    .lean();

    const returnedProducts = ordersWithReturns.map(order => {
      const returnedItems = order.items.filter(item => item.isReturned);
      return {
        ...order,
        items: returnedItems,
        userName: order.user ? order.user.name : null,
      };
    }).filter(order => order.items.length > 0); 
    
    console.log(returnedProducts);
    return res.render("admin/returenOrders", { returnedProducts });
  
  } catch (error) {
    console.error("Error fetching returned orders:", error);
    return res.status(500).json({ message: "Error fetching returned orders." });
  }
};

