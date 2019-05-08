const mongoose = require('mongoose');
const Supplier = require('./supplierModel');
const Contract = require('./contractModel');
const Lc = require('./lcModel');

const paymentRequestSchema = new mongoose.Schema(
	{
		contractId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Contract',
		},
		lcId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Lc',
		},
		amount: { type: Number, required: true },
		state: {
			type: String,
			enum: ['new', 'approved', 'inprogress', 'executed', 'canceled'],
			default: 'new',
			required: true,
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
		notes: { type: String, trim: true },
	},
	{ timestamps: true },
);

paymentRequestSchema.virtual('payments', {
	ref: 'Payment',
	localField: '_id',
	foreignField: 'requestId',
});

paymentRequestSchema.pre('save', async function(next) {
	const paymentRequest = this;

	if (paymentRequest.lcId) {
		const lc = await Lc.findById(paymentRequest.lcId);
		if (!lc) {
			throw new Error('Lc not found');
		}
	} else {
		const contract = await Contract.findById(paymentRequest.contractId);
		if (!contract) {
			throw new Error('Contract not found');
		}
	}

	next();
});

paymentRequestSchema.post('find', async function(docs) {
	for (let doc of docs) {
		await doc.populate('createdBy', 'name').execPopulate();
	}
});

const PaymentRequest = new mongoose.model('PaymentRequest', paymentRequestSchema);

module.exports = PaymentRequest;
