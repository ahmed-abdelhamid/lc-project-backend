const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({
	storage: storage,
	limits: { fileSize: 2000000 },
	fileFilter(req, file, cb) {
		switch (file.mimetype) {
		case 'application/pdf':
		case 'image/jpeg':
		case 'image/png':
		case 'image/tiff':
			return cb(undefined, true);
		default:
			return cb(new Error('Invalid file type'), false);
		}
	}
});

module.exports = upload;
