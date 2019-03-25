const request = require('supertest');
const app = require('../src/app');
const Supplier = require('../src/models/supplierModel');
const {
	activeUserOneId,
	activeUserOne,
	setupDatabase
} = require('./fixtures/db');

beforeEach(setupDatabase);

///////////////////////////////////////////////////////////////////////////////
///////////////////  TESTS RELATED TO CREATE NEW SUPPLIER  ////////////////////
///////////////////////////////////////////////////////////////////////////////
test('Should create new supplier', async () => {
	const { body } = await request(app)
		.post('/suppliers')
		.set('Authorization', `Bearer ${activeUserOne.tokens[0].token}`)
		.send({
			name: 'Supplier One',
			specialization: 'Specialization One'
		})
		.expect(201);
	const supplier = await Supplier.findById(body._id);
	// Check that user saved in database
	expect(supplier).not.toBeNull();
	// Check response
	expect(body).toMatchObject({
		name: 'Supplier One',
		createdBy: activeUserOneId.toString()
	});
});
