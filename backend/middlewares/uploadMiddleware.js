// File: backend/middleware/uploadMiddleware.js

const multer = require('multer');
const path = require('path');

// Set up storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Save files to the 'uploads' folder
    },
    filename: function (req, file, cb) {
        // Create a unique filename
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

// File filter (to allow only certain file types)
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Only images (jpeg, jpg, png) and PDFs are allowed!');
    }
}

// Initialize upload variable
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

module.exports = upload;