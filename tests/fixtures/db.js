const User = require('../../src/models/userModel')

const setupDatabase = async () => {
  await User.deleteMany()
}

module.exports = { setupDatabase }
