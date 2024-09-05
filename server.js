import express from "express";
import morgan from "morgan";
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";
import dotenv from "dotenv";
import connectDB from "./configs/dbConfig.js";
import rootRouter from "./routes/index.js";
import { v2 as cloudinary } from "cloudinary";
import { adminSeeder } from "./utils/adminSeeder.js";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import { rateLimit } from "express-rate-limit";
import { checkOutJob } from "./utils/cronJobs.js";

// dot env configuration
dotenv.config();

// db connection
connectDB();

// admin seeder
adminSeeder();

// cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Port number
let port = process.env.PORT || 8080;

// rest object
const app = express();

// middlewares

// app.use(
//   rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
//     standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
//     legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
//     // store: ... , // Redis, Memcached, etc. See below.
//   })
// );
app.use(helmet());
app.use(mongoSanitize());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(cors());
app.use(express.json());
app.use("/api/v1", rootRouter);

// Set view engine
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// sendPushNotification("", "title1", "message body");
checkOutJob();
// error handler middleware
app.use(errorHandler);

app.listen(port, console.log(`Server running mode on port  ${port} `));
