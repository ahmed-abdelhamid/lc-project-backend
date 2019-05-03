const mongoose = require('mongoose');
const Lc = require('./lcModel');
const Contract = require('./contractModel');

const requestSchema = new mongoose.Schema(
	{
		lcId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Lc',
		},
		contractId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Contract',
		},
		upTo: { type: Date },
		amount: { type: Number },
		state: {
			type: String,
			enum: ['new', 'approved', 'inprogress', 'executed', 'deleted'],
			default: 'new',
			required: true,
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
		notes: { type: String, trim: true },
		advancedPaymentCondition: { type: String, enum: ['at sight', '30 days', '60 days'] },
		otherPaymentsCondition: { type: String, enum: ['at sight', '30 days', '60 days'] },
		advancedPayment: { type: Number, required: true, default: 0 },
	},
	{ timestamps: true },
);

requestSchema.virtual('extensions', {
	ref: 'Extension',
	localField: '_id',
	foreignField: 'requestId',
});

requestSchema.virtual('amendments', {
	ref: 'Amendment',
	localField: '_id',
	foreignField: 'requestId',
});
requestSchema.virtual('lcs', {
	ref: 'Lc',
	localField: '_id',
	foreignField: 'requestId',
});

requestSchema.pre('save', async function(next) {
	const request = this;

	if (!request.upTo && !request.amount) {
		throw new Error('You need to provide new date or new amount!');
	}
	if (request.lcId) {
		const lc = await Lc.findById(request.lcId);
		if (!lc) {
			throw new Error('Lc not found');
		}
	} else {
		const contract = await Contract.findById(request.contractId);
		if (!contract) {
			throw new Error('contract not found');
		}
	}

	next();
});

requestSchema.post('find', async function(docs) {
	for (let doc of docs) {
		await doc.populate('createdBy', 'name').execPopulate();
	}
});

const Request = new mongoose.model('Request', requestSchema);

module.exports = Request;
