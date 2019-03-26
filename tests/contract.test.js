const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Contract = require('../src/models/contractModel');
const {
	adminId,
	admin,
	supplierOneId,
	setupDatabase
} = require('./fixtures/db');

beforeEach(setupDatabase);

///////////////////////////////////////////////////////////////////////////////
///////////////////  TESTS RELATED TO CREATE NEW CONTRACT  ////////////////////
///////////////////////////////////////////////////////////////////////////////
test('Should create new contract', async () => {
	const { body } = await request(app)
		.post(`/suppliers/${supplierOneId}/contracts`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send({ title: 'New Contract', amount: 5000, duration: 'One Month' })
		.expect(201);
	expect(body).toMatchObject({
		amount: 5000,
		createdBy: adminId.toString(),
		supplierId: supplierOneId.toString()
	});
});

test('Should not create new contract if wrong supplier id', async () => {
	const { body } = await request(app)
		.post(`/suppliers/${new mongoose.Types.ObjectId()}/contracts`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send({ title: 'New Contract', amount: 5000, duration: 'One Month' })
		.expect(400);
	console.log(body);
});
