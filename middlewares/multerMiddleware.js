import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/products");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      Date.now() +
        "-" +
        Math.floor(Math.random() * 20) +
        "_" +
        file.originalname
    );
  },
});

export const upload = multer({ storage: storage });
