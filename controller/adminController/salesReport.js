import OrderModel from "../../models/orderModel.js";
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

export const saleReport = async (req, res) => {
    try {
        const { dateFilter, paymentFilter, startDate, endDate, download } = req.query;

        // Create a filter object
        let filter = { paymentStatus: 'Paid' };

        // Add filtering by payment method if specified
        if (paymentFilter) {
            filter.paymentMethod = paymentFilter;
        }

        // Add filtering by date range if specified
        if (dateFilter) {
            const today = new Date();
            if (dateFilter === 'daily') {
                filter.orderDate = {
                    $gte: new Date(today.setHours(0, 0, 0, 0)),
                    $lte: new Date(today.setHours(23, 59, 59, 999))
                };
            } else if (dateFilter === 'weekly') {
                const lastWeek = new Date();
                lastWeek.setDate(lastWeek.getDate() - 7);
                filter.orderDate = {
                    $gte: lastWeek,
                    $lte: new Date()
                };
            } else if (dateFilter === 'monthly') {
                const lastMonth = new Date();
                lastMonth.setMonth(lastMonth.getMonth() - 1);
                filter.orderDate = {
                    $gte: lastMonth,
                    $lte: new Date()
                };
            } else if (dateFilter === 'yearly') {
                const lastYear = new Date();
                lastYear.setFullYear(lastYear.getFullYear() - 1);
                filter.orderDate = {
                    $gte: lastYear,
                    $lte: new Date()
                };
            } else if (dateFilter === 'custom') {
                if (startDate && endDate) {
                    filter.orderDate = {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    };
                }
            }
        }

        const orders = await OrderModel.find(filter)
            .populate('user', 'username')
            .sort({ orderDate: -1 })
            .exec();

        let totalSalesAmount = 0;
        let totalDiscount = 0;
        orders.forEach(order => {
            totalSalesAmount += order.totalAmount; 
            totalDiscount += (order.coupenValue || 0) + (order.totelDiscountValue || 0);
        });

        // Check if the download type is specified
        if (download === 'pdf') {
            // Generate PDF
            const doc = new PDFDocument();
            res.setHeader('Content-disposition', 'attachment; filename=sales_report.pdf');
            res.setHeader('Content-type', 'application/pdf');

            doc.pipe(res);
            doc.fontSize(12).text('Sales Report', { align: 'center' }); // Reduced font size
            doc.moveDown();
            doc.text(`Total Sales Amount: ${totalSalesAmount.toFixed(2)}`);
            doc.text(`Total Discount: ${totalDiscount.toFixed(2)}`);
            doc.moveDown();

            // Add a table-like structure for orders
            orders.forEach(order => {
                doc.text(`Order ID: ${order.orderId}`, { continued: true });
                doc.text(`, User: ${order.user ? order.user.username : 'N/A'}`, { continued: true });
                doc.text(`, Total Amount: ${order.totalAmount.toFixed(2)}`, { continued: true });
                doc.text(`, Order Date: ${order.orderDate.toLocaleDateString()}`, { continued: true });
                doc.text(`, Coupon Discount: ${order.coupenValue || 0}`, { continued: true });
                doc.text(`, Total Discount: ${order.totelDiscountValue || 0}`);
                doc.moveDown();
            });

            doc.end();
        } else if (download === 'excel') {
            // Generate Excel
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sales Report');

            worksheet.columns = [
                { header: 'Order ID', key: 'orderId', width: 30 },
                { header: 'User', key: 'user', width: 20 },
                { header: 'Total Amount', key: 'totalAmount', width: 20 },
                { header: 'Order Date', key: 'orderDate', width: 20 },
                { header: 'Coupon Discount', key: 'couponDiscount', width: 20 },
                { header: 'Total Discount', key: 'totalDiscount', width: 20 }
            ];

            orders.forEach(order => {
                worksheet.addRow({
                    orderId: order.orderId,
                    user: order.user ? order.user.username : 'N/A',
                    totalAmount: order.totalAmount,
                    orderDate: order.orderDate.toLocaleDateString(),
                    couponDiscount: order.coupenValue || 0,
                    totalDiscount: order.totelDiscountValue || 0
                });
            });

            res.setHeader('Content-Disposition', 'attachment; filename=sales_report.xlsx');
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

            await workbook.xlsx.write(res);
            res.end();
        } else {
            // Render the report view
            res.render('admin/salesReport', { 
                orders, 
                totalSalesAmount: totalSalesAmount.toFixed(2), 
                totalDiscount: totalDiscount.toFixed(2) 
            });
        }
    } catch (error) {
        console.error('Error in saleReport:', error);
        res.status(500).send('Internal Server Error');
    }
};
