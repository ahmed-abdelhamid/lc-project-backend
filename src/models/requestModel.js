const mongoose = require('mongoose');
const Lc = require('./lcModel');

const requestSchema = new mongoose.Schema(
	{
		lcId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Lc',
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

requestSchema.pre('save', async function(next) {
	const request = this;

	if (!request.upTo && !request.amount) {
		throw new Error('You need to provide new date or new amount!');
	}

	const lc = await Lc.findById(request.lcId);
	if (!lc) {
		throw new Error('Lc not found');
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
