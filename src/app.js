const express = require('express');
require('./db/mongoose');
const cors = require('cors');
const userRouter = require('./routers/userRouters');
const supplierRouter = require('./routers/supplierRouters');
const contractRouter = require('./routers/contractRouters');
const appendixRouter = require('./routers/appendixRouters');
const requestRouter = require('./routers/requestRouters');
const lcRouter = require('./routers/lcRouters');
const extensionRouter = require('./routers/extensionRouters');
const amendmentRouter = require('./routers/amendmentRouters');
const paymentRequestRouter = require('./routers/paymentRequestRouters');
const paymentRouter = require('./routers/paymentRouters');

const app = express();
app.use(cors());
app.use(express.json());
app.use("/users", userRouter);
app.use("/suppliers", supplierRouter);
app.use("/contracts", contractRouter);
app.use("/appendixes", appendixRouter);
app.use("/requests", requestRouter);
app.use("/lcs", lcRouter);
app.use("/extensions", extensionRouter);
app.use("/amendments", amendmentRouter);
app.use("/paymentRequests", paymentRequestRouter);
app.use("/payments", paymentRouter);

module.exports = app;
