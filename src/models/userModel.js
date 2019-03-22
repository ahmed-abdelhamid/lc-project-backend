const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true, minlength: 4 },
		email: {
			type: String,
			unique: true,
			required: true,
			trim: true,
			lowercase: true,
			validate(value) {
				if (!validator.isEmail(value)) {
					throw new Error('Invalid Email');
				}
			}
		},
		password: {
			type: String,
			required: true,
			trim: true,
			validate(value) {
				if (!value.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,15}$/)) {
					throw new Error(
						'Password must be at least 6 characters, no more than 15 characters, and must include at least one upper case letter, one lower case letter, and one numeric digit.'
					);
				}
			}
		},
		phone: {
			type: String,
			trim: true,
			validate(value) {
				if (!validator.isMobilePhone(value, 'ar-SA')) {
					throw new Error('Invalid Phone Number');
				}
			}
		},
		cannAddLcRequest: { type: Boolean, default: false },
		canAddRequest: { type: Boolean, default: false },
		canAddPayment: { type: Boolean, default: false },
		canAddLc: { type: Boolean, default: false },
		canAddExtension: { type: Boolean, default: false },
		canAddAmendement: { type: Boolean, default: false },
		status: { type: String, enum: ['active', 'archive'], default: 'active' },
		tokens: [{ token: { type: String, required: true } }]
	},
	{ timestamps: true }
);

// Hash the password before saving on the database
userSchema.pre('save', async function(next) {
	const user = this;
	if (user.isModified('password')) {
		user.password = await bcrypt.hash(user.password, 8);
	}

	next();
});

// Genrete User Auth Tokens
userSchema.methods.generateAuthToken = async function() {
	const user = this;
	const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
	user.tokens = user.tokens.concat({ token });
	await user.save({ validateBeforeSave: false });

	return token;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
