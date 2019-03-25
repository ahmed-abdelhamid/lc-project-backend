const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/userRouters');
const supplierRouter = require('./routers/supplierRouter');
const contractRouter = require('./routers/contractRouters');

const app = express();

app.use(express.json());
app.use(userRouter);
app.use(supplierRouter);
app.use(contractRouter);

module.exports = app;
