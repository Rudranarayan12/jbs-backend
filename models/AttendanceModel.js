import mongoose, { Schema } from "mongoose";

const attendanceSchema = new Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    checkInTime: {
        type: String,
    },
    checkOutTime: {
        type: String,
    },
    checkInImage: {
        type: String,
    },
    checkInLocation: {
        type: String,
    },
    checkOutLocation: {
        type: String
    },
},
    {
        timestamps: true
    });

export const Attendance = mongoose.model("Attendance", attendanceSchema);
