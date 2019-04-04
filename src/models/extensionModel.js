const mongoose = require('mongoose');
const Request = require('./requestModel');
const Lc = require('./lcModel');

const extensionSchema = new mongoose.Schema(
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
		upTo: { type: Date, required: true },
		notes: { type: String, trim: true }
	},
	{ timestamps: true }
);

extensionSchema.pre('save', async function(next) {
	const extension = this;

	const request = await Request.findById(extension.requestId);
	if (!request) {
		throw new Error({ error: 'Request not found' });
	}

	const lc = await Lc.findById(extension.lcId);
	if (!lc) {
		throw new Error({ error: 'Lc not found' });
	}

	next();
});

const Extention = new mongoose.model('Extension', extensionSchema);

module.exports = Extention;
