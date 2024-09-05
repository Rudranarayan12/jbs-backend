import cron from "node-cron";
import { User } from "../models/UserModel.js";
import { Attendance } from "../models/AttendanceModel.js";

// Cron job to run at 11:55 PM every day
export function checkOutJob() {
  cron.schedule("55 23 * * *", async (next) => {
    console.log("Running cron job to check out all users at midnight");

    try {
      // Find all users who are currently checked in
      const checkedInUsers = await User.find({ isCheckedIn: true });

      for (const user of checkedInUsers) {
        const attendance = await Attendance.findOneAndUpdate(
          { employeeId: user._id, checkOutTime: null },
          { checkOutTime: Date.now(), checkOutLocation: "Automatic Logout" },
          { new: true }
        );

        user.isCheckedIn = false;
        await user.save();
      }

      console.log("All users have been checked out");
    } catch (error) {
      next(error);
    }
  });
}
