const express = require('express');
const Lc = require('../models/lcModel');
const Request = require('../models/requestModel');
const auth = require('../middleware/auth');
const router = new express.Router();

module.exports = router;
