const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/userModel');
const {
	activeUserOneId,
	activeUserOne,
	archivedUserOne,
	setupDatabase
} = require('./fixtures/db');

beforeEach(setupDatabase);

///////////////////////////////////////////////////////////////////////////////
//////////////////////////  TESTS RELATED TO SIGNUP  //////////////////////////
///////////////////////////////////////////////////////////////////////////////
test('Should signup new user', async () => {
	const { body } = await request(app)
		.post('/users')
		.send({
			name: 'Ahmed Abdelhamid',
			email: 'ahmed@example.com',
			password: 'Ahmed123',
			phone: '0562442190'
		})
		.expect(201);
	const user = await User.findById(body.user._id);
	// Check that user saved in database
	expect(user).not.toBeNull();
	// Check response
	expect(body).toMatchObject({
		user: {
			status: 'active',
			canAddRequest: false,
			password: expect.not.stringContaining('Ahmed123')
		},
		token: user.tokens[0].token
	});
});

test('Shouldn\'t signup new user with invalid name', async () => {
	await request(app)
		.post('/users')
		.send({
			name: 'a',
			email: 'ahmed@example.com',
			password: 'Ahmed123'
		})
		.expect(400);
});

test('Shouldn\'t signup new user with invalid email', async () => {
	await request(app)
		.post('/users')
		.send({
			name: 'Ahmed Abdelhamid',
			email: 'ahmed@example',
			password: 'Ahmed123'
		})
		.expect(400);
});

test('Shouldn\'t signup new user with invalid password', async () => {
	await request(app)
		.post('/users')
		.send({
			name: 'Ahmed Abdlehamid',
			email: 'ahmed@example.com',
			password: 'Ahm1'
		})
		.expect(400);
});

test('Shouldn\'t signup new user with invalid phone number', async () => {
	await request(app)
		.post('/users')
		.send({
			name: 'Ahmed Abdelhamid',
			email: 'ahmed@example.com',
			password: 'Ahmed123',
			phone: '0123456789'
		})
		.expect(400);
});

test('Shouldn\'t signup new user with invalid status value', async () => {
	await request(app)
		.post('/users')
		.send({
			name: 'Ahmed Abdelhamid',
			email: 'ahmed@example.com',
			password: 'Ahmed123',
			status: 'Invalid Value'
		})
		.expect(400);
});

///////////////////////////////////////////////////////////////////////////////
////////////////////////  TESTS RELATED FINDING USERS /////////////////////////
///////////////////////////////////////////////////////////////////////////////
test('Should find all users', async () => {
	const { body } = await request(app)
		.get('/users')
		.send()
		.expect(200);
	expect(body).toHaveLength(2);
});

///////////////////////////////////////////////////////////////////////////////
////////////////////////  TESTS RELATED TO LOGIN USER  ////////////////////////
///////////////////////////////////////////////////////////////////////////////
test('Should login user', async () => {
	const { email, password } = activeUserOne;
	const { body } = await request(app)
		.post('/users/login')
		.send({ email, password })
		.expect(200);
	const { tokens } = await User.findById(activeUserOneId);
	expect(body).toMatchObject({
		user: { name: activeUserOne.name },
		token: tokens[0].token
	});
});

test('Shouldn\'t login active user with wrong email', async () => {
	const { password } = archivedUserOne;
	await request(app)
		.post('/users/login')
		.send({ email: 'email@example.com', password })
		.expect(400);
});

test('Shouldn\'t login active user with wrong password', async () => {
	const { email } = archivedUserOne;
	await request(app)
		.post('/users/login')
		.send({ email, password: 'WrongPassword' })
		.expect(400);
});

test('Shouldn\'t login archived user', async () => {
	const { email, password } = archivedUserOne;
	await request(app)
		.post('/users/login')
		.send({ email, password })
		.expect(400);
});
