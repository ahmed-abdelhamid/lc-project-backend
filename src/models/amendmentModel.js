const mongoose = require('mongoose');
const Request = require('./requestModel');
const Lc = require('./lcModel');

const amendmentSchema = new mongoose.Schema(
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

amendmentSchema.pre('save', async function(next) {
	const amendment = this;

	const request = await Request.findById(amendment.requestId);
	if (!request) {
		throw new Error({ error: 'Request not found' });
	}

	const lc = await Lc.findById(amendment.lcId);
	if (!lc) {
		throw new Error({ error: 'Lc not found' });
	}

	next();
});

const Amendment = new mongoose.model('Amendment', amendmentSchema);

module.exports = Amendment;
