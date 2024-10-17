import OrderModel from "../../models/orderModel.js";

export const getOrders = async (req, res) => {
  const searchQuery = req.query.search || ''; // Get the search query from the query params, default to empty string

  try {
    // Filter orders that are not canceled and match the search query
    const orders = await OrderModel.find({
      isCanceld: false,
      
      orderId: { $regex: searchQuery, $options: 'i' }, 
    }).sort({ orderDate: -1 });

    // Render orders page with filtered data
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
    if (orderStatus === 'Completed') {
      updateFields.paymentStatus = 'Paid';
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
      paymentStatus: updatedOrder.paymentStatus
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
        order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) // Case-insensitive search
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