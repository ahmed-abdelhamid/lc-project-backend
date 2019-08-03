const AWS = require('aws-sdk');
const AdmZip = require('adm-zip');

const bucket = new AWS.S3({
	apiVersion: '2006-03-01',
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	region: process.env.AWS_REGION,
});

// Upload New Files
const uploadFiles = async files => {
	let filesNames = [];

	await Promise.all(
		files.map(async file => {
			// New Filename
			const index = file.mimetype.indexOf('/');
			const ext = file.mimetype.slice(index + 1);
			const newName = `${file.originalname}-${Date.now()}.${ext}`;

			// Storage Data
			const params = {
				Bucket: process.env.AWS_BUCKET_NAME,
				Key: newName,
				Body: file.buffer,
				ContentType: file.mimetype,
			};

			// Upload File to S3 Bucket
			try {
				await bucket.putObject(params).promise();
				filesNames.push(params.Key);
			} catch (e) {
				throw e;
			}
		}),
	);
	if (filesNames.length === 0) filesNames = undefined;
	return filesNames;
};

// Read File
const getFile = async key => {
	const params = {
		Bucket: process.env.AWS_BUCKET_NAME,
		Key: key,
	};

	try {
		const file = await bucket.getObject(params).promise();
		console.log(file);

		return file;
	} catch (e) {
		throw e;
	}
};

// Read Many Files
const readMultiFiles = async keys => {
	const zip = new AdmZip();
	await Promise.all(
		keys.map(async key => {
			const file = await getFile(key);
			zip.addFile(key, file.Body);
		}),
	);
	return zip.toBuffer();
};

// Delete File
const deleteFile = async key => {
	const params = {
		Bucket: process.env.AWS_BUCKET_NAME,
		Key: key,
	};

	try {
		await bucket.deleteObject(params).promise();
	} catch (e) {
		throw e;
	}
};

module.exports = { uploadFiles, getFile, deleteFile, readMultiFiles };
