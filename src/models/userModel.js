const mongoose = require('mongoose')
const validator = require('validator')

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 4 },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate (value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid Email')
        }
      }
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate (value) {
        if (!value.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,15}$/)) {
          throw new Error(
            'Password must be at least 6 characters, no more than 15 characters, and must include at least one upper case letter, one lower case letter, and one numeric digit.'
          )
        }
      }
    },
    phone: {
      type: String,
      trim: true,
      validate (value) {
        if (!validator.isMobilePhone(value, 'ar-SA')) {
          throw new Error('Invalid Phone Number')
        }
      }
    },
    cannAddLcRequest: { type: Boolean, default: false },
    canAddRequest: { type: Boolean, default: false },
    canAddPayment: { type: Boolean, default: false },
    canAddLc: { type: Boolean, default: false },
    canAddExtension: { type: Boolean, default: false },
    canAddAmendement: { type: Boolean, default: false }
  },
  { timestamps: true }
)

const User = mongoose.model('User', userSchema)

module.exports = User
