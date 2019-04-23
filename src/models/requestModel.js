const mongoose = require('mongoose');
const Supplier = require('./supplierModel');

const requestSchema = new mongoose.Schema(
	{
		lcId:{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Lc'
		},
		supplierId: {
			type: mongoose.Schema.Types.ObjectId,
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


requestSchema.virtual('extensions', {
	ref: 'Extension',
	localField: '_id',
	foreignField: 'requestId'
});

requestSchema.virtual('amendements', {
	ref: 'Amendement',
	localField: '_id',
	foreignField: 'requestId'
});

requestSchema.pre('save', async function(next) {
	const request = this;

	if (!request.upTo && !request.amount) {
		throw new Error('You need to provide new date or new amount or both');
	}

	const supplier = await Supplier.findById(request.supplierId);
	if (!supplier) {
		throw new Error('Supplier not found');
	}

	next();
});

requestSchema.post('find', async function(docs) {
	for (let doc of docs) {
		await doc.populate('requestedBy', 'name').execPopulate();
	}
});

const Request = new mongoose.model('Request', requestSchema);

module.exports = Request;
