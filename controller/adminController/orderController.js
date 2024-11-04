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
    const { dateRange, status, priceSort, orderId } = req.query;

    console.log("Query Params:", { dateRange, status, priceSort, orderId });

    let query = { "items.isReturned": true };


    if (orderId) {
      query = { ...query, orderId: orderId }; 
    }

    const ordersWithReturns = await OrderModel.find(query)
      .populate('user', 'username')
      .lean();

    console.log("Orders with Returns:", ordersWithReturns);

    const returnedProducts = ordersWithReturns
      .map(order => {

        let returnedItems = order.items.filter(item => item.isReturned);

        if (status) {
          returnedItems = returnedItems.filter(item => item.status === status.charAt(0).toUpperCase() + status.slice(1)); 
        }

        return {
          ...order,
          items: returnedItems,
          userName: order.user ? order.user.username : null,
        };
      })
      .filter(order => order.items.length > 0);
    console.log("Returned Products After Mapping:", returnedProducts);

    let filteredProducts = returnedProducts;
    if (!orderId) {
      filteredProducts = returnedProducts.filter(order => {
        const orderDate = new Date(order.orderDate);
        switch (dateRange) {
          case 'today':
            return orderDate.toDateString() === new Date().toDateString();
          case 'tomorrow':
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            return orderDate.toDateString() === tomorrow.toDateString();
          case 'this-week':
            const startOfWeek = new Date();
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
            return orderDate >= startOfWeek && orderDate <= new Date();
          case 'this-month':
            return orderDate.getMonth() === new Date().getMonth();
          case 'this-year':
            return orderDate.getFullYear() === new Date().getFullYear();
          default:
            return true; 
        }
      });
    }

    console.log("Filtered Products After Date Filtering:", filteredProducts);

    if (priceSort === 'low-to-high') {
      filteredProducts.sort((a, b) => a.items[0].price - b.items[0].price);
    } else if (priceSort === 'high-to-low') {
      filteredProducts.sort((a, b) => b.items[0].price - a.items[0].price);
    }

    console.log("Final Filtered Returned Products:", filteredProducts);

    return res.render("admin/returenOrders", { returnedProducts: filteredProducts });

  } catch (error) {
    console.error("Error fetching returned orders:", error);
    return res.status(500).json({ message: "Error fetching returned orders." });
  }
};
