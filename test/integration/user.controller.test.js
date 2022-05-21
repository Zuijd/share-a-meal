const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');
const jwt = require('jsonwebtoken');
const assert = require('assert');
const dbconnection = require('../../database/dbconnection');
const {
    expect
} = require('chai');
chai.should();
chai.expect();
chai.use(chaiHttp);

let createdUserId;
let token;
let wrongToken;

const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;'
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;'
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;'
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE
const INSERT_USER = 'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' + '(1, "first", "last", "name@server.nl", "secret", "street", "city");'
const INSERT_MEALS = 'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' + "(1, 'Meal A', 'description', 'image url', '2022-05-17 08:27:15', 5, 6.5, 1)," + "(2, 'Meal B', 'description', 'image url', '2022-05-17 08:27:15', 5, 6.5, 1);"


describe('UC-2 Manage users /api/user', () => {

    before((done) => {
        token = jwt.sign({
                userId: 1
            },
            process.env.JWT_SECRET, {
                expiresIn: '100d'
            });

        wrongToken = jwt.sign({
                userId: 2
            },
            process.env.JWT_SECRET, {
                expiresIn: '100d'
            });
        done()
    })

    beforeEach((done) => {
        dbconnection.getConnection((err, connection) => {
            if (err) throw err
            connection.query(CLEAR_DB + INSERT_USER + INSERT_MEALS, (error, results, fields) => {
                connection.release()
                if (error) throw error
                done()
            })
        })
    })

    describe('UC-201 Register as new user', () => {
        it('TC-201-1 Mandatory field is missing', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    firstName: "Chai",
                    lastName: "Test",
                    city: "City",
                    emailAdress: "chai@test.com",
                    password: "pass123",
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('status', 'message')

                    let {
                        status,
                        message
                    } = res.body
                    status.should.be.a('number').that.equals(400)
                    message.should.be.a('string').that.equals('Street must be a string')
                    done()
                })
        })

        it('TC-201-2 Invalid email address', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    firstName: "Chai",
                    lastName: "Test",
                    street: "street",
                    city: "City",
                    emailAdress: "1",
                    password: "pass123",
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('status', 'message')

                    let {
                        status,
                        message
                    } = res.body
                    status.should.be.a('number').that.equals(400)
                    message.should.be.a('string').that.equals('Invalid emailAdress')
                    done()
                })
        })

        it('TC-201-3 Invalid password', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    firstName: "Chai",
                    lastName: "Test",
                    street: "street",
                    city: "City",
                    emailAdress: "chai@test.com",
                    password: "secre",
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('status', 'message')

                    let {
                        status,
                        message
                    } = res.body
                    status.should.be.a('number').that.equals(400)
                    message.should.be.a('string').that.equals('Password too weak')
                    done()
                })
        })

        it('TC-201-4 User already exists', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    firstName: "Chai",
                    lastName: "Test",
                    street: "street",
                    city: "City",
                    emailAdress: "name@server.nl",
                    password: "secret",
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(409)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('status', 'message')

                    let {
                        status,
                        message
                    } = res.body
                    status.should.be.a('number').that.equals(409)
                    message.should.be.a('string').that.equals('User already exist')
                    done()
                })
        })

        it('TC-201-5 User registered successfully', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    firstName: "New",
                    lastName: "User",
                    street: "Street",
                    city: "City",
                    emailAdress: "zuijd@user.com",
                    password: "newUser123",
                    isActive: 1,
                    phoneNumber: "0786120504"
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(201)
                    res.should.be.an('object')
                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('status', 'result')

                    let {
                        status,
                        result
                    } = res.body

                    createdUserId = result.id

                    expect(status).to.equal(201)
                    expect(result.id).to.equal(createdUserId)
                    expect(result.firstName).to.equal('New');
                    expect(result.lastName).to.equal('User');
                    expect(result.isActive).to.equal(1);
                    expect(result.emailAdress).to.equal('zuijd@user.com');
                    expect(result.password).to.equal('newUser123');
                    expect(result.phoneNumber).to.equal('0786120504');
                    expect(result.street).to.equal('Street');
                    expect(result.city).to.equal('City');
                    done()
                })
        })
    })

    //UC-202

    describe('UC-203 Request user profile', () => {
        it('TC-203-1 Invalid token', (done) => {
            chai.request(server)
                .get('/api/user/profile')
                .set(
                    'authorization',
                    'Bearer ' + 123
                )
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(401)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('status', 'message')

                    let {
                        status,
                        message
                    } = res.body

                    status.should.be.a('number').that.equals(401)
                    message.should.be.a('string').that.equals('Unauthorized')
                    done()
                })
        })

        it('TC-203-2 Valid token and user exists', (done) => {
            chai.request(server)
                .get('/api/user/profile')
                .set(
                    'authorization',
                    'Bearer ' + token
                )
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(200)
                    res.should.be.an('object')
                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('status', 'result')

                    let {
                        status,
                        result
                    } = res.body

                    expect(status).to.equal(200)
                    expect(result.id).to.equal(1)
                    expect(result.firstName).to.equal('first');
                    expect(result.lastName).to.equal('last');
                    expect(result.isActive).to.equal(1);
                    expect(result.emailAdress).to.equal('name@server.nl');
                    expect(result.password).to.equal('secret');
                    expect(result.phoneNumber).to.equal('-');
                    expect(result.street).to.equal('street');
                    expect(result.city).to.equal('city');
                    expect(result.roles).to.equal('editor,guest');
                    done()
                })
        })
    })

    describe('UC-204 User details', () => {
        it('TC-204-1 Invalid token', (done) => {
            chai.request(server)
                .get('/api/user/1')
                .set(
                    'authorization',
                    'Bearer ' + 123
                )
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(401)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('status', 'message')

                    let {
                        status,
                        message
                    } = res.body
                    status.should.be.a('number').that.equals(401)
                    message.should.be.a('string').that.equals('Unauthorized')
                    done()
                })
        })

        it('TC-204-2 User id does not exist', (done) => {
            chai.request(server)
                .get('/api/user/420')
                .set(
                    'authorization',
                    'Bearer ' + token
                )
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(404)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('status', 'message')

                    let {
                        status,
                        message
                    } = res.body
                    status.should.be.a('number').that.equals(404)
                    message.should.be.a('string').that.equals('This user does not exist')
                    done()
                })
        })

        it('TC-204-3 User id exists', (done) => {
            chai.request(server)
                .get('/api/user/1')
                .set(
                    'authorization',
                    'Bearer ' + token
                )
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(200)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('status', 'result')

                    let {
                        status,
                        result
                    } = res.body

                    expect(status).to.equal(200)
                    expect(result.id).to.equal(1)
                    expect(result.firstName).to.equal('first');
                    expect(result.lastName).to.equal('last');
                    expect(result.isActive).to.equal(1);
                    expect(result.emailAdress).to.equal('name@server.nl');
                    expect(result.password).to.equal('secret');
                    expect(result.phoneNumber).to.equal('-');
                    expect(result.street).to.equal('street');
                    expect(result.city).to.equal('city');
                    expect(result.roles).to.equal('editor,guest');
                    done();
                })
        })
    })

    describe('UC-205 Update user', () => {
        it('TC-205-1 Mandatory field is missing', (done) => {
            chai.request(server)
                .put('/api/user/1')
                .set(
                    'authorization',
                    'Bearer ' + token
                )
                .send({
                    firstName: "Chai",
                    lastName: "Test",
                    street: "street",
                    city: "City",
                    password: "secret"
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('status', 'message')

                    let {
                        status,
                        message
                    } = res.body
                    status.should.be.a('number').that.equals(400)
                    message.should.be.a('string').that.equals('EmailAdress must be a string')
                    done()
                })
        })

        it('TC-205-3 Invalid phone number', (done) => {
            chai.request(server)
                .put('/api/user/1')
                .set(
                    'authorization',
                    'Bearer ' + token
                )
                .send({
                    firstName: "Chai",
                    lastName: "Test",
                    street: "street",
                    city: "City",
                    emailAdress: "test@test.com",
                    password: "secret",
                    phoneNumber: "123"
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('status', 'message')

                    let {
                        status,
                        message
                    } = res.body
                    status.should.be.a('number').that.equals(400)
                    message.should.be.a('string').that.equals('Please enter a valid phone number')
                    done()
                })
        })

        it('TC-205-4 User does not exist', (done) => {
            chai.request(server)
                .put('/api/user/420')
                .set(
                    'authorization',
                    'Bearer ' + token
                )
                .send({
                    firstName: "Chai",
                    lastName: "Test",
                    street: "street",
                    city: "City",
                    emailAdress: "test@test.com"
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('status', 'message')

                    let {
                        status,
                        message
                    } = res.body
                    status.should.be.a('number').that.equals(400)
                    message.should.be.a('string').that.equals('This user does not exist')
                    done()
                })
        })

        it('TC-205-5 Not logged in', (done) => {
            chai.request(server)
                .put('/api/user/420')
                .set(
                    'authorization',
                    'Bearer ' + 123
                )
                .send({
                    firstName: "Chai",
                    lastName: "Test",
                    street: "street",
                    city: "City",
                    emailAdress: "test@test.com",
                    password: "secret"
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(401)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('status', 'message')

                    let {
                        status,
                        message
                    } = res.body
                    status.should.be.a('number').that.equals(401)
                    message.should.be.a('string').that.equals('Unauthorized')
                    done()
                })
        })

        it('TC-205-6 User updated succesfully', (done) => {
            chai.request(server)
                .put('/api/user/1')
                .set(
                    'authorization',
                    'Bearer ' + token
                )
                .send({
                    emailAdress: "test@test.com",
                    password: "secret123"
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(200)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('status', 'result')

                    let {
                        status,
                        result
                    } = res.body
                    status.should.be.a('number').that.equals(200)
                    expect(status).to.equal(200)
                    expect(result.id).to.equal(1)
                    expect(result.firstName).to.equal('first');
                    expect(result.lastName).to.equal('last');
                    expect(result.isActive).to.equal(1);
                    expect(result.emailAdress).to.equal('test@test.com');
                    expect(result.password).to.equal('secret123');
                    expect(result.phoneNumber).to.equal('-');
                    expect(result.street).to.equal('street');
                    expect(result.city).to.equal('city');
                    expect(result.roles).to.equal('editor,guest');
                    done();
                })
        })
    })

    describe('UC-206 Delete user', () => {
        it('TC-206-1 User does not exist', (done) => {
            chai.request(server)
                .delete('/api/user/420')
                .set(
                    'authorization',
                    'Bearer ' + token
                )
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('status', 'message')

                    let {
                        status,
                        message
                    } = res.body
                    status.should.be.a('number').that.equals(400)
                    message.should.be.a('string').that.equals('User does not exist')
                    done()
                })
        })

        it('TC-206-4 User successfully deleted', (done) => {
            chai.request(server)
                .delete('/api/user/1')
                .set(
                    'authorization',
                    'Bearer ' + token
                )
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(200)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('status', 'message')

                    let {
                        status,
                        message
                    } = res.body

                    status.should.be.a('number').that.equals(200)
                    message.should.be.a('string').that.equals('User succesfully deleted')
                    done()
                })
        })
    })
})