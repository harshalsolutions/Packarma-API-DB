import multer, { diskStorage } from "multer";
import path from "path";

const storage = diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./media");
    },
    filename: function (req, file, cb) {
        cb(null, `${req.body.fileName}`);
    }
});

const upload = multer({ storage: storage });

export default upload;
