const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const User = require('../src/models/userModel');
const {
	admin,
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
			auth: 'user'
		},
		token: user.tokens[0].token
	});
	// Check password
	expect(user.password).not.toEqual('Ahmed123');
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
////////////////////  TESTS RELATED FINDING ALL USERS /////////////////////////
///////////////////////////////////////////////////////////////////////////////
test('Should fecth all users', async () => {
	const { body } = await request(app)
		.get('/users')
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send()
		.expect(200);
	expect(body).toHaveLength(3);
});

test('Shouldn\'t fecth all users if not admin', async () => {
	await request(app)
		.get('/users')
		.set('Authorization', `Bearer ${activeUserOne.tokens[0].token}`)
		.send()
		.expect(401);
});

test('Shouldn\'t fecth all users if not authenticated', async () => {
	await request(app)
		.get('/users')
		.send()
		.expect(401);
});

///////////////////////////////////////////////////////////////////////////////
///////////////////// TESTS RELATED FINDING USERS BY ID	///////////////////////
///////////////////////////////////////////////////////////////////////////////
test('Should find user by id if admin', async () => {
	const { body } = await request(app)
		.get(`/users/${activeUserOneId}`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send()
		.expect(200);
	expect(body.name).toEqual(activeUserOne.name);
});

test('Should not find user by id if not admin', async () => {
	await request(app)
		.get(`/users/${activeUserOneId}`)
		.set('Authorization', `Bearer ${activeUserOne.tokens[0].token}`)
		.send()
		.expect(401);
});

test('Should not find user by id if wrong id used', async () => {
	await request(app)
		.get('/users/abc123')
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send()
		.expect(404);
});

test('Should not find user by id if not authenticated', async () => {
	await request(app)
		.get(`/users/${activeUserOneId}`)
		.send()
		.expect(401);
});

///////////////////////////////////////////////////////////////////////////////
///////////////  TESTS RELATED TO FIND USER'S PROFILE  ////////////////////////
///////////////////////////////////////////////////////////////////////////////
test('Should find user\'s own profile', async () => {
	const { body } = await request(app)
		.get('/users/me')
		.set('Authorization', `Bearer ${activeUserOne.tokens[0].token}`)
		.send()
		.expect(200);
	expect(body.name).toEqual(activeUserOne.name);
});

test('Should not find user\'s own profile if not authenticated', async () => {
	await request(app)
		.get('/users/me')
		.send()
		.expect(401);
});

///////////////////////////////////////////////////////////////////////////////
////////////  TESTS RELATED TO UPDATES USER'S PROFILE  ////////////////////////
///////////////////////////////////////////////////////////////////////////////
test('Should update user', async () => {
	const { body } = await request(app)
		.patch('/users/me')
		.set('Authorization', `Bearer ${activeUserOne.tokens[0].token}`)
		.send({
			name: 'Smith',
			email: 'smith@example.com',
			password: 'Smith123456'
		})
		.expect(200);
	expect(body).toMatchObject({
		name: 'Smith',
		email: 'smith@example.com',
		canAddRequest: false
	});
	const user = await User.findById(activeUserOneId);
	const passwordMatch = await bcrypt.compare('Smith123456', user.password);
	expect(passwordMatch).toBeTruthy();
});

test('Should n\'t update user if not authenticated', async () => {
	await request(app)
		.patch('/users/me')
		.send({ name: 'Smith' })
		.expect(401);
	const user = await User.findById(activeUserOneId);
	expect(user).toMatchObject({
		name: activeUserOne.name,
		email: activeUserOne.email,
		canAddRequest: false
	});
});

test('Should n\'t update user if invalid update', async () => {
	await request(app)
		.patch('/users/me')
		.set('Authorization', `Bearer ${activeUserOne.tokens[0].token}`)
		.send({
			name: 'Smith',
			canAddRequest: true
		})
		.expect(400);
	const user = await User.findById(activeUserOneId);
	expect(user.name).toEqual(activeUserOne.name);
	expect(user.canAddRequest).toBeFalsy();
});

///////////////////////////////////////////////////////////////////////////////
////////////  TESTS RELATED TO UPDATES USER BY ID  ////////////////////////////
///////////////////////////////////////////////////////////////////////////////
test('Should update user by id', async () => {
	const { body } = await request(app)
		.patch(`/users/${activeUserOneId}`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send({ canAddRequest: true })
		.expect(200);
	expect(body.canAddRequest).toBeTruthy();
});

test('Shouldn\'t update user by id if not admin', async () => {
	await request(app)
		.patch(`/users/${activeUserOneId}`)
		.set('Authorization', `Bearer ${activeUserOne.tokens[0].token}`)
		.send({ canAddRequest: true })
		.expect(401);
	const user = await User.findById(activeUserOneId);
	expect(user.canAddRequest).toBeFalsy();
});

test('Shouldn\'t update user by id if not authenticated', async () => {
	await request(app)
		.patch(`/users/${activeUserOneId}`)
		.send({ canAddRequest: true })
		.expect(401);
	const user = await User.findById(activeUserOneId);
	expect(user.canAddRequest).toBeFalsy();
});

test('Shouldn\'t update user by id if invalid id', async () => {
	await request(app)
		.patch('/users/abc123')
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send({ canAddRequest: true })
		.expect(400);
});

test('Shouldn\'t update user by id if invalid update', async () => {
	await request(app)
		.patch(`/users/${activeUserOneId}`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send({ status: 'archive' })
		.expect(400);
	const user = await User.findById(activeUserOneId);
	expect(user.status).toEqual('active');
});

test('Should n\'t update user if existing email', async () => {
	await request(app)
		.patch(`/users/${activeUserOneId}`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send({
			name: 'Smith',
			email: archivedUserOne.email
		})
		.expect(400);
	const user = await User.findById(activeUserOneId);
	expect(user.email).toEqual(activeUserOne.email);
});

test('Should n\'t update user if invalid password', async () => {
	await request(app)
		.patch(`/users/${activeUserOneId}`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send({ password: 'Smith' })
		.expect(400);
	const user = await User.findById(activeUserOneId);
	const passwordMatch = await bcrypt.compare('Smith', user.password);
	expect(passwordMatch).toBeFalsy();
});

///////////////////////////////////////////////////////////////////////////////
//////////////////////  TESTS RELATED TO ARCHIVE USER  ////////////////////////
///////////////////////////////////////////////////////////////////////////////
test('Should archive user if admin', async () => {
	await request(app)
		.patch(`/users/${activeUserOneId}/archive`)
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send()
		.expect(200);
	const user = await User.findById(activeUserOne);
	expect(user.status).toEqual('archive');
});

test('Should not archive user if not admin', async () => {
	await request(app)
		.patch(`/users/${activeUserOneId}/archive`)
		.set('Authorization', `Bearer ${activeUserOne.tokens[0].token}`)
		.send()
		.expect(401);
	const user = await User.findById(activeUserOne);
	expect(user.status).toEqual('active');
});

test('Should not archive user if not authenticated', async () => {
	await request(app)
		.patch(`/users/${activeUserOneId}/archive`)
		.send()
		.expect(401);
	const user = await User.findById(activeUserOne);
	expect(user.status).toEqual('active');
});

test('Should generate 404 error if wrong id', async () => {
	await request(app)
		.patch('/users/abc123/archive')
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send()
		.expect(404);
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
		token: tokens[1].token
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

///////////////////////////////////////////////////////////////////////////////
////////////////////////  TESTS RELATED LOGOUT USERS //////////////////////////
///////////////////////////////////////////////////////////////////////////////
test('Should logout user', async () => {
	await request(app)
		.post('/users/logout')
		.set('Authorization', `Bearer ${activeUserOne.tokens[0].token}`)
		.send()
		.expect(200);
});

test('Should logout admin', async () => {
	await request(app)
		.post('/users/logout')
		.set('Authorization', `Bearer ${admin.tokens[0].token}`)
		.send()
		.expect(200);
});

test('Shouldn\'t logout not autheticated user', async () => {
	await request(app)
		.post('/users/logout')
		.send()
		.expect(401);
});
