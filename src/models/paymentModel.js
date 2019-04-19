const mongoose = require('mongoose');
const PaymentRequest = require('./paymentRequestModel');

const paymentSchema = new mongoose.Schema(
	{
		paymentRequestId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'PaymentRequest'
		},
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
		lcId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Lc'
		},
		type: {
			type: String,
			enum: ['cash', 'lc'],
			required: true
		},
		amount: { type: Number, required: true },
		dateOfRequest: { type: Date, required: true },
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User'
		},
		notes: { type: String, trim: true }
	},
	{ timestamps: true }
);

paymentSchema.pre('save', async function(next) {
	const payment = this;

	const paymentRequest = await PaymentRequest.findById(
		payment.paymentRequestId
	);
	if (paymentRequest.lcId && paymentRequest.amount !== payment.amount) {
		throw new Error('Amount is different than in the request');
	}

	if (paymentRequest.lcId) {
		payment.lcId = paymentRequest.lcId;
	}

	next();
});

const Payment = new mongoose.model('Payment', paymentSchema);

module.exports = Payment;
