import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(
      "Database default connection successful -->",
      mongoose.connection.host
    );
  } catch (error) {
    console.log("Database default connection error", error);
    process.exit(1);
  }
};

export default connectDB;
