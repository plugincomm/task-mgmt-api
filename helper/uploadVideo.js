const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'video_upload') {
            cb(null, 'public/uploads/video');
        } else if (file.fieldname === 'video_img') {
            cb(null, 'public/uploads/videoimg');
        } else {
            cb(new Error('Unexpected field'));
        }
    },
    filename: function (req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// File type check
function checkFileType(file, cb) {
    const videoTypes = /mp4|mov|avi|wmv/;
    const imageTypes = /jpeg|jpg|png|gif/;
    const extname = videoTypes.test(path.extname(file.originalname).toLowerCase()) || imageTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = videoTypes.test(file.mimetype) || imageTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Incorrect File type');
    }
}

// Multer configuration
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).fields([
    { name: 'video_img', maxCount: 1 },
    { name: 'video_upload', maxCount: 10 }
]);

module.exports = upload;
