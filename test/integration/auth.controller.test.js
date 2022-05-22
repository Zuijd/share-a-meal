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

let token;
let wrongToken;

const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;'
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;'
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;'
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE
const INSERT_USER = 'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' + '(1, "first", "last", "name@server.nl", "secret", "street", "city");'
const INSERT_MEALS = 'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' + "(1, 'Meal A', 'description', 'image url', '2022-05-17 08:27:15', 5, 6.5, 1)," + "(2, 'Meal B', 'description', 'image url', '2022-05-17 08:27:15', 5, 6.5, 1);"
const INSERT_PARTICIPATION = 'INSERT INTO `meal_participants_user` (`mealId`, `userId`) VALUES (2, 1);'

describe('UC-1 login', () => {

    beforeEach((done) => {
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
            connection.query(CLEAR_DB + INSERT_USER + INSERT_MEALS + INSERT_PARTICIPATION, (error, results, fields) => {
                connection.release()
                if (error) throw error
                done()
            })
        })
    })

    describe('UC-101 login', () => {
        it('TC-101-1 Mandatory field is missing', (done) => {
            chai.request(server)
                .post('/api/auth/login')
                .send({
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
                    message.should.be.a('string').that.equals('Email address must be a string')
                    done()
                })
        })

        it('TC-101-2 Invalid email address', (done) => {
            chai.request(server)
                .post('/api/auth/login')
                .send({
                    emailAdress: "thisdoesnotmatchtheformat",
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
                    message.should.be.a('string').that.equals('Invalid email address')
                    done()
                })
        })

        it('TC-101-3 Invalid password', (done) => {
            chai.request(server)
                .post('/api/auth/login')
                .send({
                    emailAdress: "zuijd@mail.com",
                    password: "no",
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

        it('TC-101-4 User does not exist', (done) => {
            chai.request(server)
                .post('/api/auth/login')
                .send({
                    emailAdress: "zuijd@mail.com",
                    password: "secret",
                })
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
                    message.should.be.a('string').that.equals('This emailadddress is not linked to an account')
                    done()
                })
        })

        it('TC-101-5 User logged in succesfully', (done) => {
            chai.request(server)
                .post('/api/auth/login')
                .send({
                    emailAdress: "name@server.nl",
                    password: "secret"
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
                    expect(result.token).to.equal(token);
                    
                    done()
                })
        })
    })
})