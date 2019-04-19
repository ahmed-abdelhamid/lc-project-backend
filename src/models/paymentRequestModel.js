const mongoose = require('mongoose');
const Supplier = require('./supplierModel');
const Contract = require('./contractModel');
const Lc = require('./lcModel');

const paymentRequestSchema = new mongoose.Schema(
	{
		supplierId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'Supplier'
		},
		contractId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'Contract'
		},
		amount: { type: Number, required: true },
		state: {
			type: String,
			enum: ['new', 'approved', 'inprogress', 'executed', 'canceled'],
			default: 'new',
			required: true
		},
		type: {
			type: String,
			enum: ['cash', 'lc'],
			required: true
		},
		lcId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Lc'
		},
		requestedBy: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User'
		},
		notes: { type: String, trim: true }
	},
	{ timestamps: true }
);

paymentRequestSchema.virtual('payments', {
	ref: 'Payment',
	localField: '_id',
	foreignField: 'paymentRequestId'
});

paymentRequestSchema.pre('save', async function(next) {
	const paymentRequest = this;

	if (paymentRequest.type === 'lc' && !paymentRequest.lcId) {
		throw new Error('Please Provide Lc');
	}

	if (paymentRequest.lcId) {
		const lc = await Lc.findById(paymentRequest.lcId);
		if (!lc) {
			throw new Error('Lc not found');
		}
	}

	const supplier = await Supplier.findById(paymentRequest.supplierId);
	if (!supplier) {
		throw new Error('Supplier not found');
	}

	const contract = await Contract.findById(paymentRequest.contractId);
	if (!contract) {
		throw new Error('Contract not found');
	}

	next();
});

paymentRequestSchema.post('find', async function(docs) {
	for (let doc of docs) {
		await doc.populate('requestedBy', 'name').execPopulate();
	}
});

const PaymentRequest = new mongoose.model(
	'PaymentRequest',
	paymentRequestSchema
);

module.exports = PaymentRequest;
