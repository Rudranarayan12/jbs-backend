export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  process.env.NODE_ENV !== "production" && console.log("err----->>\n", err);
  res.status(statusCode);
  res.json({
    success: "false",
    message: err.message || "internal server error",
    // stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
