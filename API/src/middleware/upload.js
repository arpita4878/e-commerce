import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = "uploads"; 

    if (req.baseUrl.includes("brand")) {
      uploadPath = "uploads/brands";
    } else if (req.baseUrl.includes("category")) {
      uploadPath = "uploads/categories";
    }else if (req.baseUrl.includes("product")) {
      uploadPath = "uploads/products"; 
    }


    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

export const upload = multer({ storage });
