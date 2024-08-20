import multer, { diskStorage } from "multer";
import path from "path";

const storage = diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./media");
    },
    filename: function (req, file, cb) {
        const fileExtension = path.extname(file.originalname);
        const title = req.body.title.replace(/\s+/g, '_').toLowerCase();
        cb(null, `${req.body.type.toLowerCase()}_${title}${fileExtension}`);
    }
});

const upload = multer({ storage: storage });

export default upload;
