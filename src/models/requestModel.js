const mongoose = require('mongoose');
const Supplier = require('./supplierModel');

const requestSchema = new mongoose.Schema(
	{
		supplierId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'Supplier'
		},
		upTo: { type: Date },
		amount: { type: Number },
		state: {
			type: String,
			enum: ['new', 'approved', 'inprogress', 'executed', 'deleted'],
			default: 'new',
			required: true
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

requestSchema.virtual('lcs', {
	ref: 'Lc',
	localField: '_id',
	foreignField: 'requestId'
});

requestSchema.virtual('extensions', {
	ref: 'Extension',
	localField: '_id',
	foreignField: 'requestId'
});

requestSchema.pre('save', async function(next) {
	const request = this;

	if (!request.upTo && !request.amount) {
		throw new Error('You need to provide now date or new amount data or both');
	}

	const supplier = await Supplier.findById(request.supplierId);
	if (!supplier) {
		throw new Error('Supplier not found');
	}

	next();
});

const Request = new mongoose.model('Request', requestSchema);

module.exports = Request;
