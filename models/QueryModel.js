import mongoose, { Schema } from "mongoose";

const followDetailsSchema = new Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  notes: {
    type: String,
  },
  followedOn: {
    type: Date,
    default: Date.now,
  },
});

const querySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required."],
    },
    message: {
      type: String,
    },
    interestedProduct: {
      type: String,
      required: [true, "Please specify the product you are interested in."],
    },
    isFollowedOn: {
      type: Boolean,
      default: false,
    },
    followedBy: {
      type: [followDetailsSchema],
      default: [],
    },
    assignedEmployees: [
      {
        employee: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        assignedOn: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Query = mongoose.model("Query", querySchema);
