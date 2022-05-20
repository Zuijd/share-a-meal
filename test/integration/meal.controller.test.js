const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');
const jwt = require('jsonwebtoken');
const jwtSecretKey = require('../../src/config/config');

const assert = require('assert');
chai.should();
chai.expect();
chai.use(chaiHttp);


let token;

describe('UC-3 Manage meals /api/meal', () => {

    before((done) => {
        token = jwt.sign({
                userId: 1
            },
            process.env.JWT_SECRET, {
                expiresIn: '100d'
            });
        done()
    })

    describe('UC-301 Add meal', () => {

        it('TC-301-1 Mandatory field is missing', (done) => {
            chai.request(server)
                .post('/api/meal')
                .send({
                    "description": "Dé pastaklassieker bij uitstek.",
                    "isActive": "1",
                    "isVega": "1",
                    "isVegan": "1",
                    "isToTakeHome": "1",
                    "dateTime": "2022-05-15T20:07:10.870Z",
                    "imageUrl": "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                    "maxAmountOfParticipants": "6",
                    "price": "6.75"
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
                    status.should.be.a('number')
                    message.should.be
                        .a('string')
                        .that.contains('Name must be a string')
                    done()
                })
        })

        it('TC-301-2 not logged in (no token)', (done) => {
            chai.request(server)
                .post('/api/meal')
                .send({
                    "name": "Spaghetti Bolognese",
                    "description": "Dé pastaklassieker bij uitstek.",
                    "isActive": "1",
                    "isVega": "1",
                    "isVegan": "1",
                    "isToTakeHome": "1",
                    "dateTime": "2022-05-15T20:07:10.870Z",
                    "imageUrl": "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                    "maxAmountOfParticipants": "6",
                    "price": "6.75"
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
                    status.should.be.a('number')
                    message.should.be
                        .a('string')
                        .that.contains('Authorization header is missing')
                    done()
                })
        })

        it('TC-301-3 Meal added succesfully', (done) => {
            chai.request(server)
                .post('/api/meal')
                .set(
                    'authorization',
                    'Bearer ' + token
                )
                .send({
                    "name": "Spaghetti Bolognese",
                    "description": "Dé pastaklassieker bij uitstek.",
                    "isActive": "1",
                    "isVega": "1",
                    "isVegan": "1",
                    "isToTakeHome": "1",
                    "dateTime": "2022-05-15T20:07:10.870Z",
                    "imageUrl": "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                    "maxAmountOfParticipants": "6",
                    "price": "6.75"
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(201)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('status', 'result')
                    done()
                })
        })
    })
})