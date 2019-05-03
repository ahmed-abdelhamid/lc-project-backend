const mongoose = require('mongoose');

const lcSchema = new mongoose.Schema(
	{
		requestId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'Request',
		},
		contractId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'Contract',
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
		issuer: { type: String, required: true, trim: true },
		bankName: { type: String, required: true, trim: true },
		number: { type: String, required: true, unique: true, trim: true },
		openingCommission: { type: Number },
		serviceCharge: { type: Number },
		editCommission: { type: Number },
		issueDate: { type: Date, required: true },
		expiryDate: { type: Date, required: true },
		amount: { type: Number, required: true },
		notes: { type: String, trim: true },
		previouslyPaidWithInvoice: { type: Number },
		active: {
			type: Boolean,
			default: true,
			required: true,
		},
		advancedPaymentCondition: {
			type: String,
			enum: ['at sight', '30 days', '60 days'],
			required: true,
		},
		otherPaymentsCondition: {
			type: String,
			enum: ['at sight', '30 days', '60 days'],
			required: true,
		},
		advancedPayment: {
			type: Number,
			required: true,
			default: 0,
		},
	},
	{ timestamps: true },
);

lcSchema.virtual('extensions', {
	ref: 'Extension',
	localField: '_id',
	foreignField: 'lcId',
});

lcSchema.virtual('amendments', {
	ref: 'Amendment',
	localField: '_id',
	foreignField: 'lcId',
});

lcSchema.virtual('paymentRequests', {
	ref: 'PaymentRequest',
	localField: '_id',
	foreignField: 'lcId',
});

lcSchema.virtual('payments', {
	ref: 'Payment',
	localField: '_id',
	foreignField: 'lcId',
});

lcSchema.virtual('requests', {
	ref: 'Request',
	localField: '_id',
	foreignField: 'lcId',
});

// lcSchema.pre('save', async function(next) {
// 	const lc = this;

// 	const supplier = await Supplier.findById(lc.supplierId);
// 	if (!supplier) {
// 		throw new Error({ error: 'Supplier not found' });
// 	}

// const request = await Request.findById(params.id);
// if (!request) {
// 	throw new Error({ error: 'Request not found' });
// }

// if (supplier._id.toString() !== request.supplierId.toString()) {
// 	throw new Error({
// 		error: 'Supplier in request should match supplier in lc'
// 	});
// }

// if (request.state !== 'inprogress') {
// 	throw new Error({ error: 'Can\'t execute this request' });
// } else {
// 	request.state = 'executed';
// 	await request.save();
// }

// next();
// });

const Lc = new mongoose.model('Lc', lcSchema);

module.exports = Lc;
