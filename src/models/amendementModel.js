const mongoose = require('mongoose');
const Request = require('./requestModel');
const Lc = require('./lcModel');

const amendementSchema = new mongoose.Schema(
	{
		requestId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'Request'
		},
		lcId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'Lc'
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User'
		},
		amount: { type: Number, required: true },
		notes: { type: String, trim: true }
	},
	{ timestamps: true }
);

amendementSchema.pre('save', async function(next) {
	const amendement = this;

	const request = await Request.findById(amendement.requestId);
	if (!request) {
		throw new Error({ error: 'Request not found' });
	}

	const lc = await Lc.findById(amendement.lcId);
	if (!lc) {
		throw new Error({ error: 'Lc not found' });
	}

	next();
});

const Amendement = new mongoose.model('Amendement', amendementSchema);

module.exports = Amendement;
