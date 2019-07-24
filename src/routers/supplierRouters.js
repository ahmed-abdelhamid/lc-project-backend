const express = require('express');
const multer = require('multer');
// const fileType = require('file-type');
const Supplier = require('../models/supplierModel');
const Contract = require('../models/contractModel');
const Appendix = require('../models/appendixModel');
const Lc = require('../models/lcModel');
const Request = require('../models/requestModel');
const PaymentRequest = require('../models/paymentRequestModel');
const Payment = require('../models/paymentModel');
const Extension = require('../models/extensionModel');
const Amendment = require('../models/amendmentModel');
const auth = require('../middleware/auth');
const router = new express.Router();

const upload = multer({
	limits: { fileSize: 2000000 },
	fileFilter(req, file, cb) {
		if (file.mimetype !== 'application/pdf') {
			cb(new Error('All files should be in PDF format'));
		}
		cb(undefined, true);
	},
});

// Upload documents
router.post(
	'/:id/upload',
	auth({ canRegister: true }),
	upload.single('supplierDoc'),
	async (req, res) => {
		const supplier = await Supplier.findById(req.params.id);
		supplier.files = req.file.buffer;
		await supplier.save();
		res.send();
	},
	(error, req, res) => {
		res.status(400).send({ error: error.message });
	},
);

// Create new supplier
router.post('', auth({ canRegister: true }), async ({ user, body }, res) => {
	const supplier = new Supplier({ ...body, createdBy: user._id });
	try {
		await supplier.save();
		res.status(201).send(supplier);
	} catch (e) {
		res.status(400).send(e);
	}
});

// Read all suppliers
router.get('', auth(), async (req, res) => {
	try {
		const suppliers = await Supplier.find();
		res.send(suppliers);
	} catch (e) {
		res.status(500).send();
	}
});

// Read supplier by id
router.get('/:id', auth(), async ({ params }, res) => {
	try {
		const supplier = await Supplier.findById(params.id);
		if (!supplier) {
			return res.status(404).send();
		}
		res.send(supplier);
	} catch (e) {
		res.status(500).send();
	}
});

// Read supplier for contract
router.get('contract/:id', auth(), async ({ params }, res) => {
	try {
		const contract = await Contract.findById(params.id);
		if (!contract) {
			return res.status(404).send();
		}
		await contract.populate('supplierId').execPopulate();
		res.send(contract.supplierId);
	} catch (e) {
		res.status(500).send();
	}
});
// Read supplier for appendix
router.get('appendix/:id', auth(), async ({ params }, res) => {
	try {
		const appendix = await Appendix.findById(params.id);
		if (!appendix) {
			return res.status(404).send();
		}
		await appendix.populate({ path: 'contractId', populate: { path: 'supplierId' } }).execPopulate();
		res.send(appendix.contractId.supplierId);
	} catch (e) {
		res.status(500).send();
	}
});

// Read supplier for lc
router.get('lc/:id', auth(), async ({ params }, res) => {
	try {
		const lc = await Lc.findById(params.id);
		if (!lc) {
			return res.status(404).send();
		}
		await lc.populate({ path: 'contractId', populate: { path: 'supplierId' } }).execPopulate();
		res.send(lc.contarctId.supplierId);
	} catch (e) {
		res.status(500).send();
	}
});
// Read supplier for request
router.get('request/:id', auth(), async ({ params }, res) => {
	try {
		const request = await Request.findById(params.id);
		if (!request) {
			return res.status(404).send();
		}
		await request.populate({ path: 'lcId', populate: { path: 'contractId', populate: { path: 'supplierId' } } }).execPopulate();
		res.send(request.lcId.contarctId.supplierId);
	} catch (e) {
		res.status(500).send();
	}
});
// Read supplier for paymentRequest
router.get('paymentRequest/:id', auth(), async ({ params }, res) => {
	try {
		const paymentRequest = await PaymentRequest.findById(params.id);
		if (!paymentRequest) {
			return res.status(404).send();
		}
		if (paymentRequest.lcId) {
			await request.populate({ path: 'lcId', populate: { path: 'contractId', populate: { path: 'supplierId' } } }).execPopulate();
			res.send(paymentRequest.lcId.contarctId.supplierId);
		} else {
			await request.populate({ path: 'contractId', populate: { path: 'supplierId' } }).execPopulate();
			res.send(paymentRequest.contarctId.supplierId);
		}
	} catch (e) {
		res.status(500).send();
	}
});

// Read supplier for payment
router.get('payment/:id', auth(), async ({ params }, res) => {
	try {
		const payment = await Payment.findById(params.id);
		if (!request) {
			return res.status(404).send();
		}
		if (payment.lcId) {
			await payment.populate({ path: 'lcId', populate: { path: 'contractId', populate: { path: 'supplierId' } } }).execPopulate();
			res.send(payment.lcId.contarctId.supplierId);
		} else {
			await payment.populate({ path: 'contractId', populate: { path: 'supplierId' } }).execPopulate();
			res.send(payment.contarctId.supplierId);
		}
	} catch (e) {
		res.status(500).send();
	}
});

// Read supplier for extension
router.get('extension/:id', auth(), async ({ params }, res) => {
	try {
		const extension = await Extension.findById(params.id);
		if (!extension) {
			return res.status(404).send();
		}
		await extension.populate({ path: 'lcId', populate: { path: 'contractId', populate: { path: 'supplierId' } } }).execPopulate();
		res.send(supplier);
	} catch (e) {
		res.status(500).send();
	}
});
// Read supplier for amendment
router.get('amendment/:id', auth(), async ({ params }, res) => {
	try {
		const amendment = await Amendment.findById(params.id);
		if (!amendment) {
			return res.status(404).send();
		}
		await amendment.populate({ path: 'lcId', populate: { path: 'contractId', populate: { path: 'supplierId' } } }).execPopulate();
		res.send(supplier);
	} catch (e) {
		res.status(500).send();
	}
});

// Update supplier data
router.patch('', auth({ canRegister: true }), async ({ body }, res) => {
	const updates = {};
	const allowedUpdates = ['name', 'specialization', 'notes', 'vatRegisteration', 'crRegisteration', 'state'];
	allowedUpdates.map(update => (updates[update] = body[update]));
	try {
		const supplier = await Supplier.findByIdAndUpdate(body._id, updates, {
			new: true,
			runValidators: true,
		});
		if (!supplier) {
			throw new Error();
		}
		res.send(supplier);
	} catch (e) {
		res.status(400).send(e);
	}
});

// router.patch(
// 	'/:id',
// 	auth({ canRegister: true }),
// 	async ({ params, body }, res) => {
// 		const updates = Object.keys(body);
// 		const allowedUpdates = [
// 			'name',
// 			'specialization',
// 			'notes',
// 			'vatRegisteration',
// 			'crRegisteration',
// 			'state'
// 		];
// 		const isValidOperation = updates.every(update =>
// 			allowedUpdates.includes(update)
// 		);
// 		if (!isValidOperation) {
// 			return res.status(400).send({ error: 'Invalid Updates' });
// 		}
// 		try {
// 			const supplier = await Supplier.findByIdAndUpdate(params.id, body, {
// 				new: true,
// 				runValidators: true
// 			});
// 			if (!supplier) {
// 				throw new Error();
// 			}
// 			res.send(supplier);
// 		} catch (e) {
// 			res.status(400).send(e);
// 		}
// 	}
// );

module.exports = router;
