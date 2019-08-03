const express = require('express');
const auth = require('../middleware/auth');
const { getFile, readMultiFiles } = require('../utils/filesFunctions');
const router = new express.Router();

// Read a file
router.post('', auth(), async ({ body }, res) => {
	try {
		if (body.keys.length === 1) {
			const file = await getFile(body.keys[0]);
			res.set('Content-Type', file.ContentType);
			res.send(file.Body);
		} else {
			const zipFile = await readMultiFiles(body.keys);
			res.set('Content-Type', 'application/zip');
			res.send(zipFile);
		}
	} catch (e) {
		res.status(404).send(e);
	}
});
// // Read a file
// router.get('/:key', auth(), async ({ params }, res) => {
// 	try {
// 		const file = await getFile(params.key);
// 		res.set('Content-Type', file.ContentType);
// 		res.send(file.Body);
// 	} catch (e) {
// 		res.status(404).send();
// 	}
// });

// Read All Files for Payment Request
// router.get('/:key', auth(), async ({ params }, res) => {
// 	try {
// 		const paymentRequest = await PaymentRequest.findById(params.id);
// 		if (!paymentRequest) {
// 			throw new Error();
// 		}
// 		const zipFile = await readMultiFiles(paymentRequest.docs);
// 		res.set('Content-Type', 'application/zip');
// 		res.send(zipFile);
// 	} catch (e) {
// 		res.status(404).send();
// 	}
// });

module.exports = router;
