import multer, { diskStorage } from "multer";
import path from "path";

const storage = diskStorage({
    destination: function (req, file, cb) {
        if (req.body.type) {
            cb(null, `./media/${req.body.type}`);
        } else {
            cb(null, `./media`);
        }
    },
    filename: function (req, file, cb) {
        const fileExtension = path.extname(file.originalname);
        cb(null, `${Date.now()}_${req.body.type.toLowerCase()}${fileExtension}`);
    }
});

const upload = multer({ storage: storage });

export default upload;
