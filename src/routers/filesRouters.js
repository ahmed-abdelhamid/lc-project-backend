const express = require('express');
const auth = require('../middleware/auth');
const { getFile } = require('../utils/filesFunctions');
const router = new express.Router();

// Read a file
router.get('/:key', auth(), async ({ params }, res) => {
	try {
		const file = await getFile(params.key);
		res.set('Content-Type', file.ContentType);
		res.send(file.Body);
	} catch (e) {
		res.status(404).send();
	}
});

module.exports = router;
