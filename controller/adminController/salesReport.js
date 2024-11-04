import OrderModel from "../../models/orderModel.js";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";

export const saleReport = async (req, res) => {
  try {
    const { dateFilter, paymentFilter, startDate, endDate, download } =
      req.query;
    let filter = { paymentStatus: "Paid",totalAmount: { $ne: 50 }, };
    if (paymentFilter) {
      filter.paymentMethod = paymentFilter;
    }
    if (dateFilter) {
      const today = new Date();
      if (dateFilter === "daily") {
        filter.orderDate = {
          $gte: new Date(today.setHours(0, 0, 0, 0)),
          $lte: new Date(today.setHours(23, 59, 59, 999)),
        };
      } else if (dateFilter === "weekly") {
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        filter.orderDate = {
          $gte: lastWeek,
          $lte: new Date(),
        };
      } else if (dateFilter === "monthly") {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        filter.orderDate = {
          $gte: lastMonth,
          $lte: new Date(),
        };
      } else if (dateFilter === "yearly") {
        const lastYear = new Date();
        lastYear.setFullYear(lastYear.getFullYear() - 1);
        filter.orderDate = {
          $gte: lastYear,
          $lte: new Date(),
        };
      } else if (dateFilter === "custom") {
        if (startDate && endDate) {
          filter.orderDate = {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          };
        }
      }
    }
    const orders = await OrderModel.find(filter)
      .populate("user", "username")
      .sort({ orderDate: -1 })
      .exec();

    let totalSalesAmount = 0;
    let totalDiscount = 0;
    orders.forEach((order) => {
      totalSalesAmount += order.totalAmount;
      totalDiscount +=
        (order.coupenValue || 0) + (order.totelDiscountValue || 0);
    });

    if (download === "pdf") {
      const doc = new PDFDocument({
        size: [900, 600],
        margin: 40,
      });
      res.setHeader(
        "Content-disposition",
        "attachment; filename=order_report.pdf"
      );
      res.setHeader("Content-type", "application/pdf");
      doc.pipe(res);

      // Title
      doc
        .fontSize(20)
        .fillColor("#003366")
        .text("Order Report", { align: "center", underline: true });
      doc.moveDown(1.5);

      const tableTop = doc.y;
      const columnWidths = {
        orderId: 80,
        userName: 90,
        orderDate: 70,
        items: 60,
        originalPrice: 90,
        offerPrice: 80,
        couponDiscount: 90,
        deliveryCharge: 90,
        paymentMethod: 90,
        finalPrice: 90,
      };

      const startX = 40;
      let y = tableTop;
      const rowHeight = 30;

      doc
        .fontSize(10)
        .fillColor("white")
        .rect(startX, y, 950, rowHeight)
        .fill("#003366")
        .stroke();
      const headerYPosition = y + rowHeight / 2 - 5;
      doc
        .fillColor("white")
        .text("Order ID", startX + 5, headerYPosition, {
          width: columnWidths.orderId,
          align: "left",
        })
        .text(
          "Customer Name",
          startX + columnWidths.orderId + 5,
          headerYPosition,
          { width: columnWidths.userName, align: "left" }
        )
        .text(
          "Order Date",
          startX + columnWidths.orderId + columnWidths.userName + 5,
          headerYPosition,
          { width: columnWidths.orderDate, align: "left" }
        )
        .text(
          "Items",
          startX +
            columnWidths.orderId +
            columnWidths.userName +
            columnWidths.orderDate +
            5,
          headerYPosition,
          { width: columnWidths.items, align: "right" }
        )
        .text(
          "Original Price",
          startX +
            columnWidths.orderId +
            columnWidths.userName +
            columnWidths.orderDate +
            columnWidths.items +
            10,
          headerYPosition,
          { width: columnWidths.originalPrice, align: "right" }
        )
        .text(
          "Offer Price",
          startX +
            columnWidths.orderId +
            columnWidths.userName +
            columnWidths.orderDate +
            columnWidths.items +
            columnWidths.originalPrice +
            10,
          headerYPosition,
          { width: columnWidths.offerPrice, align: "right" }
        )
        .text(
          "Coupon Discount",
          startX +
            columnWidths.orderId +
            columnWidths.userName +
            columnWidths.orderDate +
            columnWidths.items +
            columnWidths.originalPrice +
            columnWidths.offerPrice +
            15,
          headerYPosition,
          { width: columnWidths.couponDiscount, align: "right" }
        )
        .text(
          "Delivery Charge",
          startX +
            columnWidths.orderId +
            columnWidths.userName +
            columnWidths.orderDate +
            columnWidths.items +
            columnWidths.originalPrice +
            columnWidths.offerPrice +
            columnWidths.couponDiscount +
            15,
          headerYPosition,
          { width: columnWidths.deliveryCharge, align: "right" }
        )
        .text(
          "Payment Method",
          startX +
            columnWidths.orderId +
            columnWidths.userName +
            columnWidths.orderDate +
            columnWidths.items +
            columnWidths.originalPrice +
            columnWidths.offerPrice +
            columnWidths.couponDiscount +
            columnWidths.deliveryCharge +
            15,
          headerYPosition,
          { width: columnWidths.paymentMethod, align: "right" }
        )
        .text(
          "Final Price",
          startX +
            columnWidths.orderId +
            columnWidths.userName +
            columnWidths.orderDate +
            columnWidths.items +
            columnWidths.originalPrice +
            columnWidths.offerPrice +
            columnWidths.couponDiscount +
            columnWidths.deliveryCharge +
            columnWidths.paymentMethod +
            20,
          headerYPosition,
          { width: columnWidths.finalPrice, align: "right" }
        );

      y += rowHeight;

      orders.forEach((order, index) => {
        const backgroundColor = index % 2 === 0 ? "#EAF2F8" : "#FDFEFE";
        doc.rect(startX, y, 950, rowHeight).fill(backgroundColor).stroke();

        const contentYPosition = y + rowHeight / 2 - 5;
        doc
          .fillColor("#333")
          .text(order.orderId, startX + 5, contentYPosition, {
            width: columnWidths.orderId,
            align: "left",
          })
          .text(
            order.user.username,
            startX + columnWidths.orderId + 5,
            contentYPosition,
            { width: columnWidths.userName, align: "left" }
          )
          .text(
            order.orderDate.toDateString(),
            startX + columnWidths.orderId + columnWidths.userName + 5,
            contentYPosition,
            { width: columnWidths.orderDate, align: "left" }
          )
          .text(
            order.items.length,
            startX +
              columnWidths.orderId +
              columnWidths.userName +
              columnWidths.orderDate +
              5,
            contentYPosition,
            { width: columnWidths.items, align: "right" }
          )
          .text(
            order.totelOrginalPrice,
            startX +
              columnWidths.orderId +
              columnWidths.userName +
              columnWidths.orderDate +
              columnWidths.items +
              10,
            contentYPosition,
            { width: columnWidths.originalPrice, align: "right" }
          )
          .text(
            order.totelDiscountValue,
            startX +
              columnWidths.orderId +
              columnWidths.userName +
              columnWidths.orderDate +
              columnWidths.items +
              columnWidths.originalPrice +
              10,
            contentYPosition,
            { width: columnWidths.offerPrice, align: "right" }
          )
          .text(
            order.coupenValue,
            startX +
              columnWidths.orderId +
              columnWidths.userName +
              columnWidths.orderDate +
              columnWidths.items +
              columnWidths.originalPrice +
              columnWidths.offerPrice +
              15,
            contentYPosition,
            { width: columnWidths.couponDiscount, align: "right" }
          )
          .text(
            "50",
            startX +
              columnWidths.orderId +
              columnWidths.userName +
              columnWidths.orderDate +
              columnWidths.items +
              columnWidths.originalPrice +
              columnWidths.offerPrice +
              columnWidths.couponDiscount +
              15,
            contentYPosition,
            { width: columnWidths.deliveryCharge, align: "right" }
          )
          .text(
            order.paymentMethod,
            startX +
              columnWidths.orderId +
              columnWidths.userName +
              columnWidths.orderDate +
              columnWidths.items +
              columnWidths.originalPrice +
              columnWidths.offerPrice +
              columnWidths.couponDiscount +
              columnWidths.deliveryCharge +
              15,
            contentYPosition,
            { width: columnWidths.paymentMethod, align: "right" }
          )
          .text(
            order.totalAmount,
            startX +
              columnWidths.orderId +
              columnWidths.userName +
              columnWidths.orderDate +
              columnWidths.items +
              columnWidths.originalPrice +
              columnWidths.offerPrice +
              columnWidths.couponDiscount +
              columnWidths.deliveryCharge +
              columnWidths.paymentMethod +
              20,
            contentYPosition,
            { width: columnWidths.finalPrice, align: "right" }
          );

        y += rowHeight;
      });

      y += rowHeight;
      doc
        .fillColor("#003366")
        .fontSize(12)
        .text(`Total Sales Amount: ${totalSalesAmount}`, startX + 5, y);
      y += rowHeight;
      doc.text(`Total Discount: ${totalDiscount}`, startX + 5, y);

      doc.end();
    } else if (download === "excel") {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sales Report");

      worksheet.columns = [
        { header: "Order ID", key: "orderId", width: 20 },
        { header: "User", key: "user", width: 20 },
        { header: "Total Amount", key: "totalAmount", width: 20 },
        { header: "Order Date", key: "orderDate", width: 20 },
        { header: "Coupon Discount", key: "couponDiscount", width: 20 },
        { header: "Total Discount", key: "totalDiscount", width: 20 },
      ];

      orders.forEach((order) => {
        worksheet.addRow({
          orderId: order.orderId,
          user: order.user ? order.user.username : "N/A",
          totalAmount: order.totalAmount,
          orderDate: order.orderDate.toLocaleDateString(),
          couponDiscount: order.coupenValue || 0,
          totalDiscount: order.totelDiscountValue || 0,
        });
      });

      worksheet.addRow({});
      worksheet.addRow({
        orderId: "Total",
        totalAmount: totalSalesAmount,
        totalDiscount: totalDiscount,
      });

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=sales_report.xlsx"
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      await workbook.xlsx.write(res);
      res.end();
    } else {
      res.render("admin/salesReport", {
        orders,
        totalSalesAmount: totalSalesAmount.toFixed(2),
        totalDiscount: totalDiscount.toFixed(2),
      });
    }
  } catch (error) {
    console.error("Error in saleReport:", error);
    res.status(500).send("Internal Server Error");
  }
};
