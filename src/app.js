const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/userRouters');
const supplierRouter = require('./routers/supplierRouters');
const contractRouter = require('./routers/contractRouters');
const appendixRouter = require('./routers/appendixRouters');

const app = express();

app.use(express.json());
app.use(userRouter);
app.use(supplierRouter);
app.use(contractRouter);
app.use(appendixRouter);

module.exports = app;
