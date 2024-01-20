const multer = require('multer');
const path = require('path');
const fs = require('fs');

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


const listDir = (req, res) => {
    const request = req.body;
    let directoryPath = null;
    const { dir } = req.body;
    console.log("body: " + dir);

    switch(req.body.dir){
        case "models":
            directoryPath = path.join(__dirname, 'public/models');
            console.log(directoryPath);
            break;
        case "skyboxes":
            directoryPath = path.join(__dirname, 'public/models');
            console.log(directoryPath);
            break;
        default:
            return res.status(404).send("dir not found");
    }

    fs.readdir(directoryPath, function (err, files) {
        //handling error
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
        //listing all files using forEach
        files.forEach(function (file) {
            // Do whatever you want to do with the file
            console.log(file);
        });
    });

    console.log("done.");
};

module.exports = { uploadFile, listDir };
