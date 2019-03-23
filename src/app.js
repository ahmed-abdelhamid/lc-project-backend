const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/userRouters');
const supplierRouter = require('./routers/supplierRouter');

const app = express();

app.use(express.json());
app.use(userRouter);
app.use(supplierRouter);

module.exports = app;
