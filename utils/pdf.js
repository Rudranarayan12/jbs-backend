import fs from "fs";
import path from "path";
import pdf from "pdf-creator-node";
import { fileURLToPath } from "url";
import { formatDate, generateRandomID } from "./helper.js";
import { uploadOnCloudinary } from "./cloudinary.js";
import { Order } from "../models/OrderModel.js";
import { Invoice } from "../models/InvoiceModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// export const generateSingleOrderInvoice = async (orderId) => {
//   try {
//     const order = await Order.findById(orderId)
//       .populate("productDetails.product")
//       .populate("customerDetails.customer");
//     let invoiceData = {
//       billName: order?.customerDetails?.customer?.name,
//       billAddress:
//         order?.customerDetails?.billingAddress ||
//         order?.customerDetails?.shippingAddress,
//       billPhoneNo: order?.customerDetails?.customer?.phoneNo,
//       shipName: order?.customerDetails?.customer?.name,
//       shipAddress: order?.customerDetails?.shippingAddress,
//       shipPhoneNo: order?.customerDetails?.customer?.phoneNo,
//       invoiceDate: formatDate(order?.orderCreationDate),
//       price: order?.paymentDetails?.totalAmount,

//       itemName: order?.productDetails?.product?.name,
//       itemId: order?.productDetails?.product?.productID,
//       itemQuantity: 1,
//       itemGrossAmount: order?.paymentDetails?.totalAmount,
//       itemGST: order?.productDetails?.product?.gst,
//       itemPrice: order?.paymentDetails?.totalAmount,

//       subTotal: order?.paymentDetails?.totalAmount,
//       shippingCharges: 0,
//       totalPrice: order?.paymentDetails?.totalAmount,
//       paidBeforeDelivery:
//         order?.paymentDetails?.totalAmount -
//         order?.paymentDetails?.remainingAmount,
//       paidAfterDelivery: order?.paymentDetails?.remainingAmount,
//     };
//     const existingInvoice = await Invoice.findOne({ orderID: orderId });
//     if (existingInvoice) {
//       invoiceData.invoiceNo = existingInvoice?.invoiceID;
//     } else {
//       invoiceData.invoiceNo = generateRandomID(8, "INV-");
//     }

//     const templatePath = path.join(
//       __dirname,
//       "../views/templates/singleOrderTemplate.html"
//     );

//     if (!fs.existsSync(templatePath)) {
//       throw new Error(`Template file not found at path: ${templatePath}`);
//     }
//     const html = fs.readFileSync(templatePath, "utf8");
//     const filename = `${invoiceData?.invoiceNo}_doc.pdf`;
//     const options = {
//       format: "A4",
//       orientation: "",
//       header: {
//         height: "",
//       },
//       footer: {
//         height: "",
//         contents: {
//           first: "Cover page",
//         },
//       },
//     };

//     const document = {
//       html: html,
//       data: {
//         users: invoiceData,
//       },
//       path: path.join(__dirname, `../docs/${filename}`),
//     };
//     let pdfPath;
//     await pdf
//       .create(document, options)
//       .then((result) => {
//         pdfPath = result.filename;
//       })
//       .catch((error) => {
//         throw Error(error);
//       });
//     const cloudinaryUrl = await uploadOnCloudinary(pdfPath);
//     if (!cloudinaryUrl) {
//       throw new Error("Failed to upload PDF");
//     }
//     if (existingInvoice) {
//       existingInvoice.invoice = cloudinaryUrl;
//       await existingInvoice.save();
//     } else {
//       const newInvoice = await Invoice.create({
//         invoiceID: invoiceData.invoiceNo,
//         invoice: cloudinaryUrl,
//         orderID: order?._id,
//       });
//     }
//   } catch (error) {
//     throw Error(error);
//   }
// };
export const generateSalesInvoice = async ({
  invoiceNo,
  billName,
  billAddress,
  billPhoneNo,
  shipName,
  shipAddress,
  shipPhoneNo,
  invoiceDate,
  price,
  productList,
  subTotal,
  shippingCharges,
  totalPrice,
  paidBeforeDelivery,
  paidAfterDelivery,
  discount,
}) => {
  try {
    const templatePath = path.join(
      __dirname,
      "../views/templates/invoiceTemplateWithDiscount.html"
    );
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file not found at path: ${templatePath}`);
    }
    const html = fs.readFileSync(templatePath, "utf8");
    const filename = `${invoiceNo}_doc.pdf`;
    const options = {
      format: "A4",
      orientation: "",
      header: {
        height: "",
      },
      footer: {
        height: "",
        contents: {
          first: "Cover page",
        },
      },
    };
    const itemData = productList
      ?.map(
        (singleItem, index) => `
            <div class="row2" style="height: 44px" key="${index}">
                <div class="row22" style="width: 325px; margin-top: 22px">
                    <div>
                        <li style="list-style-type: none">
                            <strong>${singleItem?.itemName || "N/A"}</strong>
                        </li>
                        <li style="list-style-type: none">Product ID - ${
                          singleItem?.itemId || "N/A"
                        }</li>
                    </div>
                </div>
                <div class="row22" style="margin-left: 317px; margin-top: -40px; width: 150px">
                    <li style="list-style-type: none">${
                      singleItem?.itemQuantity || 0
                    }</li>
                </div>
                <div class="row22" style="margin-left: 440px; margin-top: -18px; width: 150px">
                    <li style="list-style-type: none">${
                      singleItem?.itemGrossAmount || 0
                    }</li>
                </div>
                <div class="row22" style="margin-left:660px; margin-top: -19px; width: 150px">
                    <li style="list-style-type: none">${
                      singleItem?.itemGST || 0
                    }</li>
                </div>
                <div class="row22" style="margin-left:800px;  margin-top: -19px; width: 150px">
                    <li style="list-style-type: none">${
                      singleItem?.itemPrice || 0
                    }</li>
                </div>
            </div>
        `
      )
      .join("");
    const users = {
      billName: billName,
      billAddress: billAddress,
      billPhoneNo: billPhoneNo,
      shipName: shipName,
      shipAddress: shipAddress,
      shipPhoneNo: shipPhoneNo,
      invoiceNo,
      invoiceDate: invoiceDate,
      price: price,
      subTotal: subTotal,
      shippingCharges: shippingCharges,
      totalPrice: totalPrice,
      paidBeforeDelivery: paidBeforeDelivery,
      paidAfterDelivery: paidAfterDelivery,
      itemData: itemData,
      discount: discount,
    };
    const document = {
      html: html,
      data: {
        users: users,
      },
      path: path.join(__dirname, `../docs/${filename}`),
    };
    let pdfPath;
    await pdf
      .create(document, options)
      .then((result) => {
        pdfPath = result.filename;
      })
      .catch((error) => {
        throw Error(error);
      });
    const cloudinaryUrl = await uploadOnCloudinary(pdfPath);
    if (!cloudinaryUrl) {
      throw new Error("Failed to upload PDF");
    }
    return cloudinaryUrl;
  } catch (error) {
    console.log(error);
  }
};
export const generateSlip = async ({
  empName,
  empId,
  empDepartment,
  empDesignation,
  empJoining,
  empSlipNumber,
  generateDate,
  basicPrice,
  allowancesPrice,
  overTimePrice,
  commissionPrice,
  totalEarnings,
  taxPrice,
  otherPrice,
  totalDeduction,
  netSalary,
  paymentDate,
  paymentMethod,
  bankAccount,
  bankName,
  branch,
}) => {
  try {
    let templatePath;
    if (paymentMethod === "Cash") {
      templatePath = path.join(
        __dirname,
        "../views/templates/cashSalarySlipTemplate.html"
      );
    } else {
      templatePath = path.join(
        __dirname,
        "../views/templates/onlineSalarySlipTemplate.html"
      );
    }
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file not found at path: ${templatePath}`);
    }
    const html = fs.readFileSync(templatePath, "utf8");
    const filename = `${empSlipNumber}_doc.pdf`;
    const options = {
      format: "A4",
      orientation: "",
      header: {
        height: "",
      },
      footer: {
        height: "",
        contents: {
          first: "Cover page",
        },
      },
    };

    const users = {
      empName,
      empId,
      empDepartment,
      empDesignation,
      empJoining,
      empSlipNumber,
      generateDate,
      basicPrice,
      allowancesPrice,
      overTimePrice,
      commissionPrice,
      totalEarnings,
      taxPrice,
      otherPrice,
      totalDeduction,
      netSalary,
      paymentDate,
      paymentMethod,
      bankAccount,
      bankName,
      branch,
    };
    const document = {
      html: html,
      data: {
        users: users,
      },
      path: path.join(__dirname, `../docs/${filename}`),
    };
    let pdfPath;
    await pdf
      .create(document, options)
      .then((result) => {
        pdfPath = result.filename;
      })
      .catch((error) => {
        throw Error(error);
      });
    const cloudinaryUrl = await uploadOnCloudinary(pdfPath);
    if (!cloudinaryUrl) {
      throw new Error("Failed to upload PDF");
    }
    return cloudinaryUrl;
  } catch (error) {
    console.log(error);
  }
};
export const generateCustomOrderInvoice = async ({
  billName,
  billAddress,
  billPhoneNo,
  shipName,
  shipAddress,
  shipPhoneNo,
  invoiceDate,
  price,
  productList,
  subTotal,
  shippingCharges,
  totalPrice,
  paidBeforeDelivery,
  paidAfterDelivery,
  discount,
}) => {
  try {
    const templatePath = path.join(
      __dirname,
      "../views/templates/invoiceTemplateWithDiscount.html"
    );

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file not found at path: ${templatePath}`);
    }
    const html = fs.readFileSync(templatePath, "utf8");
    const invoiceNo = generateRandomID(8, "INV-");
    const filename = `${invoiceNo}_doc.pdf`;

    const options = {
      format: "A4",
      orientation: "",
      header: {
        height: "",
      },
      footer: {
        height: "",
        contents: {
          first: "Cover page",
        },
      },
    };

    const itemData = productList
      ?.map(
        (singleItem, index) => `
            <div class="row2" style="height: 44px" key="${index}">
                <div class="row22" style="width: 325px; margin-top: 22px">
                    <div>
                        <li style="list-style-type: none">
                            <strong>${singleItem.itemName}</strong>
                        </li>
                        <li style="list-style-type: none">Product ID - ${singleItem.itemId}</li>
                    </div>
                </div>
                <div class="row22" style="margin-left: 317px; margin-top: -40px; width: 150px">
                    <li style="list-style-type: none">${singleItem.itemQuantity}</li>
                </div>
                <div class="row22" style="margin-left: 440px; margin-top: -18px; width: 150px">
                    <li style="list-style-type: none">${singleItem.itemGrossAmount}</li>
                </div>
                <div class="row22" style="margin-left:660px; margin-top: -19px; width: 150px">
                    <li style="list-style-type: none">${singleItem.itemGST} %</li>
                </div>
                <div class="row22" style="margin-left:800px;  margin-top: -19px; width: 150px">
                    <li style="list-style-type: none">${singleItem.itemPrice}</li>
                </div>
            </div>
        `
      )
      .join("");

    const users = {
      billName: billName,
      billAddress: billAddress,
      billPhoneNo: billPhoneNo,
      shipName: shipName,
      shipAddress: shipAddress,
      shipPhoneNo: shipPhoneNo,
      invoiceNo: invoiceNo,
      invoiceDate: invoiceDate,
      price: price,
      subTotal: subTotal,
      shippingCharges: shippingCharges,
      totalPrice: totalPrice,
      paidBeforeDelivery: paidBeforeDelivery,
      paidAfterDelivery: paidAfterDelivery,
      itemData: itemData,
      discount: discount,
    };

    const document = {
      html: html,
      data: {
        users: users,
      },
      path: path.join(__dirname, `../docs/${filename}`),
    };

    let pdfPath;

    await pdf
      .create(document, options)
      .then((result) => {
        pdfPath = result.filename;
      })
      .catch((error) => {
        throw Error(error);
      });

    const cloudinaryUrl = await uploadOnCloudinary(pdfPath);
    if (!cloudinaryUrl) {
      throw new Error("Failed to generate invoice");
    }
    const newInvoice = await Invoice.create({
      invoiceID: invoiceNo,
      invoice: cloudinaryUrl,
    });
    return cloudinaryUrl;
  } catch (error) {
    console.log(error);
  }
};
export const generateSingleOrderInvoice = async (orderId) => {
  try {
    const order = await Order.findById(orderId)
      .populate("productDetails.product")
      .populate("customerDetails.customer");
    // console.log(order);
    const productDetails = order.productDetails.map((item) => {
      const itemGrossAmount = item.product.price;
      const itemQuantity = item.requirements.requiredQuantity;
      return {
        itemName: item.product.name,
        itemId: item.product.productID,
        itemQuantity,
        itemGrossAmount,
        itemGST: item.product.gst,
        itemPrice: parseFloat(itemGrossAmount) * parseInt(itemQuantity),
      };
    });
    let invoiceData = {
      billName: order?.customerDetails?.customer?.name,
      billAddress:
        order?.customerDetails?.billingAddress ||
        order?.customerDetails?.shippingAddress,
      billPhoneNo: order?.customerDetails?.customer?.phoneNo,
      shipName: order?.customerDetails?.customer?.name,
      shipAddress: order?.customerDetails?.shippingAddress,
      shipPhoneNo: order?.customerDetails?.customer?.phoneNo,
      invoiceDate: formatDate(order?.orderCreationDate),
      price: order?.paymentDetails?.totalAmount,
      productList: productDetails,
      subTotal: order?.paymentDetails?.totalAmount,
      shippingCharges: order?.shippingCharges || 0,
      totalPrice: order?.paymentDetails?.totalAmount,
      paidBeforeDelivery:
        order?.paymentDetails?.totalAmount -
        order?.paymentDetails?.remainingAmount,
      paidAfterDelivery: order?.paymentDetails?.remainingAmount,
    };
    const existingInvoice = await Invoice.findOne({ orderID: orderId });
    if (existingInvoice) {
      invoiceData.invoiceNo = existingInvoice?.invoiceID;
    } else {
      invoiceData.invoiceNo = generateRandomID(8, "INV-");
    }
    const templatePath = path.join(
      __dirname,
      "../views/templates/singleOrderTemplate.html"
    );

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file not found at path: ${templatePath}`);
    }
    const html = fs.readFileSync(templatePath, "utf8");
    const invoiceNo = generateRandomID(8, "INV-");
    const filename = `${invoiceNo}_doc.pdf`;

    const options = {
      format: "A4",
      orientation: "",
      header: {
        height: "",
      },
      footer: {
        height: "",
        contents: {
          first: "Cover page",
        },
      },
    };

    const itemData = invoiceData?.productList
      ?.map(
        (singleItem, index) => `
            <div class="row2" style="height: 44px" key="${index}">
                <div class="row22" style="width: 325px; margin-top: 22px">
                    <div>
                        <li style="list-style-type: none">
                            <strong>${singleItem.itemName}</strong>
                        </li>
                        <li style="list-style-type: none">Product ID - ${singleItem.itemId}</li>
                    </div>
                </div>
                <div class="row22" style="margin-left: 317px; margin-top: -40px; width: 150px">
                    <li style="list-style-type: none">${singleItem.itemQuantity}</li>
                </div>
                <div class="row22" style="margin-left: 440px; margin-top: -18px; width: 150px">
                    <li style="list-style-type: none">${singleItem.itemGrossAmount}</li>
                </div>
                <div class="row22" style="margin-left:660px; margin-top: -19px; width: 150px">
                    <li style="list-style-type: none">${singleItem.itemGST} %</li>
                </div>
                <div class="row22" style="margin-left:800px;  margin-top: -19px; width: 150px">
                    <li style="list-style-type: none">${singleItem.itemPrice}</li>
                </div>
            </div>
        `
      )
      .join("");

    const document = {
      html: html,
      data: {
        users: { ...invoiceData, itemData },
      },
      path: path.join(__dirname, `../docs/${filename}`),
    };

    let pdfPath;

    await pdf
      .create(document, options)
      .then((result) => {
        pdfPath = result.filename;
      })
      .catch((error) => {
        throw Error(error);
      });

    const cloudinaryUrl = await uploadOnCloudinary(pdfPath);
    if (!cloudinaryUrl) {
      throw new Error("Failed to generate invoice");
    }
    if (existingInvoice) {
      existingInvoice.invoice = cloudinaryUrl;
      await existingInvoice.save();
    } else {
      const newInvoice = await Invoice.create({
        invoiceID: invoiceData.invoiceNo,
        invoice: cloudinaryUrl,
        orderID: order?._id,
      });
    }
  } catch (error) {
    console.log(error);
  }
};
