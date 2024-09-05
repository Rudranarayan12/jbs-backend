import { Schema, model } from "mongoose";

const orderSchema = new Schema(
  {
    // product details
    productDetails: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "product id required"],
        },
        requirements: {
          requiredQuantity: {
            type: Number,
            default: 1,
          },
          selectedSize: {
            type: String,
          },
          selectedColor: {
            type: String,
          },
          selectedPattern: {
            type: String,
          },
          additionalInfo: {
            type: String,
          },
          storageFeaturesIncluded: {
            type: Boolean,
            default: false,
          },
        },
      },
    ],
    // customer details
    customerDetails: {
      customer: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "customer id required"],
      },
      shippingAddress: {
        type: String,
        required: true,
      },
      billingAddress: {
        type: String,
      },
      orderNumber: {
        type: String,
      },
      relevantDoc: {
        type: String,
      },
    },
    // payment details
    paymentDetails: {
      totalAmount: {
        type: Number,
        required: true,
      },
      remainingAmount: {
        type: Number,
      },

      paymentHistory: [
        {
          paymentAmount: {
            type: Number,
          },
          paymentMethod: {
            type: String,
            enum: ["check", "bank_transfer_or_upi", "cash"],
            required: true,
          },
          paymentDoc: {
            type: String,
          },
          paymentDate: {
            type: Date,
            default: Date.now(),
          },
        },
      ],
      additionalComments: {
        type: String,
      },
    },
    approverDetails: {
      name: {
        type: String,
        required: true,
      },
      employeeID: {
        type: String,
        required: true,
      },
      mobileNo: {
        type: String,
        required: true,
      },
    },
    estimatedDeliveryDate: {
      type: Date,
    },
    deliveryStatus: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered"],
      default: "pending",
    },
    productionStatus: {
      type: String,
      enum: ["carpenter", "carbin", "polishing", "cushioning", "packaging"],
    },
    managedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    orderCreationDate: {
      type: Date,
      default: Date.now(),
    },
    orderID: {
      type: String,
    },
    shippingCharges: {
      type: Number,
    },
  },

  { timestamps: true }
);

export const Order = model("Order", orderSchema);
