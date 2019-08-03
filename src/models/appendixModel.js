const mongoose = require('mongoose');
const Contract = require('./contractModel');

const appendixSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, trim: true },
		date: { type: Date, required: true },
		soc: { type: String, required: true, trim: true },
		amount: { type: Number, required: true, min: 0 },
		duration: { type: String, required: true, trim: true },
		notes: { type: String, trim: true },
		state: {
			type: String,
			enum: ['active', 'archived', 'deleted'],
			default: 'active',
		},
		contractId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Contract',
			required: true,
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		docs: { type: [String], required: true },
	},
	{ timestamps: true },
);

appendixSchema.pre('save', async function(next) {
	const appendix = this;

	const contract = await Contract.findById(appendix.contractId);
	if (!contract) {
		throw new Error({ error: 'Contract not found' });
	}

	next();
});

const Appendix = new mongoose.model('Appendix', appendixSchema);

module.exports = Appendix;
