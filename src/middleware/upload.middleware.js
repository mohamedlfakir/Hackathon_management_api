const multer = require("multer");
const path = require("path");
const fs = require("fs");
const AppError = require("../utils/AppError");

/**
 * Create upload middleware
 * @param {string} folder - uploads subfolder
 * @param {string[]} allowedExtensions
 */
function createUploader(folder, allowedExtensions) {

    const uploadFolder = path.join(process.cwd(), "uploads", folder);

    if (!fs.existsSync(uploadFolder)) {
        fs.mkdirSync(uploadFolder, { recursive: true });
    }

    const storage = multer.diskStorage({

        destination(req, file, cb) {
            cb(null, uploadFolder);
        },

        filename(req, file, cb) {

            const extension = path.extname(file.originalname);

            const filename =
                Date.now() +
                "-" +
                Math.round(Math.random() * 1e9) +
                extension;

            cb(null, filename);

        }

    });

    const fileFilter = (req, file, cb) => {

        const extension = path
            .extname(file.originalname)
            .toLowerCase();

        if (!allowedExtensions.includes(extension)) {

            return cb(
                new AppError("Invalid file type", 400),
                false
            );

        }

        cb(null, true);

    };

    return multer({

        storage,

        fileFilter,

        limits: {
            fileSize: 10 * 1024 * 1024 // 10 MB
        }

    });

}

module.exports = createUploader;