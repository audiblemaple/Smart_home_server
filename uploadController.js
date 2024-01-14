const multer = require('multer');
const path = require('path');

// Custom storage configuration
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        // Determine the directory based on file extension
        const ext = path.extname(file.originalname).toLowerCase();
        let uploadDir = 'public';

        switch (ext){
            case '.glb':
                uploadDir = 'public/models';
                break;
            case '.hdr':
                uploadDir = 'public/skyBoxes';
                break;

            default:
                return;
        }

        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        // Create a unique file name using the original name and a timestamp
        cb(null, file.originalname.split('.')[0] + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Export a middleware function
const uploadFile = (req, res, next) => {
    const uploadMiddleware = upload.single('file');

    uploadMiddleware(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            return res.status(500).json({ error: err.message });
        } else if (err) {
            // An unknown error occurred when uploading.
            return res.status(500).json({ error: err.message });
        }

        // Everything went fine, proceed to the next middleware
        next();
    });
};

module.exports = { uploadFile };
