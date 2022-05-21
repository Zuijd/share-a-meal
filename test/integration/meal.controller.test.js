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

describe('UC-3 Manage meals /api/meal', () => {

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

        it('TC-301-2 not logged in (wrong token)', (done) => {
            chai.request(server)
                .post('/api/meal')
                .set(
                    'authorization',
                    'Bearer ' + 123
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
                        .that.contains('Unauthorized')
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

                    let createdMeal = res.body.result.id

                    let {
                        status,
                        result
                    } = res.body

                    expect(result.id).to.equal(createdMeal);
                    expect(result.name).to.equal('Spaghetti Bolognese')
                    expect(result.description).to.equal('Dé pastaklassieker bij uitstek.')
                    expect(result.isActive).to.equal('1')
                    expect(result.isVega).to.equal('1')
                    expect(result.isVegan).to.equal('1')
                    expect(result.isToTakeHome).to.equal('1')
                    expect(result.dateTime).to.equal('2022-05-15T20:07:10.870Z')
                    expect(result.imageUrl).to.equal('https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg')
                    expect(result.maxAmountOfParticipants).to.equal('6')
                    expect(result.price).to.equal('6.75')

                    expect(result.cook.id).to.equal(1);
                    expect(result.cook.firstName).to.equal('first');
                    expect(result.cook.lastName).to.equal('last');
                    expect(result.cook.isActive).to.equal(1);
                    expect(result.cook.emailAdress).to.equal('name@server.nl');
                    expect(result.cook.password).to.equal('secret');
                    expect(result.cook.phoneNumber).to.equal('-');
                    expect(result.cook.roles).to.equal('editor,guest');
                    expect(result.cook.street).to.equal('street');
                    expect(result.cook.city).to.equal('city');

                    expect(result.participants[0].id).to.equal(1);
                    expect(result.participants[0].firstName).to.equal('first');
                    expect(result.participants[0].lastName).to.equal('last');
                    expect(result.participants[0].isActive).to.equal(1);
                    expect(result.participants[0].emailAdress).to.equal('name@server.nl');
                    expect(result.participants[0].password).to.equal('secret');
                    expect(result.participants[0].phoneNumber).to.equal('-');
                    expect(result.participants[0].roles).to.equal('editor,guest');
                    expect(result.participants[0].street).to.equal('street');
                    expect(result.participants[0].city).to.equal('city');

                    done()
                })
        })
    })

    describe('UC-303 Request a list of meals', () => {
        it('TC-301-3 List of meals returned', (done) => {
            chai.request(server)
                .get('/api/meal')
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(200)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('status', 'result')

                    let {
                        result
                    } = res.body

                    expect(result[0].id).to.equal(1);
                    expect(result[0].name).to.equal('Meal A')
                    expect(result[0].description).to.equal('description')
                    expect(result[0].isActive).to.equal(0)
                    expect(result[0].isVega).to.equal(0)
                    expect(result[0].isVegan).to.equal(0)
                    expect(result[0].isToTakeHome).to.equal(1)
                    expect(result[0].dateTime).to.equal('2022-05-17T08:27:15.000Z')
                    expect(result[0].imageUrl).to.equal('image url')
                    expect(result[0].maxAmountOfParticipants).to.equal(5)
                    expect(result[0].price).to.equal('6.50')

                    expect(result[0].cookId).to.equal(1)



                    /* expect(result[0].cook.cookId).to.equal(1);
                    expect(result[0].cook.firstName).to.equal('first');
                    expect(result[0].cook.lastName).to.equal('last');
                    expect(result[0].cook.isActive).to.equal(1);
                    expect(result[0].cook.emailAdress).to.equal('name@server.nl');
                    expect(result[0].cook.password).to.equal('secret');
                    expect(result[0].cook.phoneNumber).to.equal('-');
                    expect(result[0].cook.roles).to.equal('editor,guest');
                    expect(result[0].cook.street).to.equal('street');
                    expect(result[0].cook.city).to.equal('city'); */

                    expect(result[1].id).to.equal(2);
                    expect(result[1].name).to.equal('Meal B')
                    expect(result[1].description).to.equal('description')
                    expect(result[1].isActive).to.equal(0)
                    expect(result[1].isVega).to.equal(0)
                    expect(result[1].isVegan).to.equal(0)
                    expect(result[1].isToTakeHome).to.equal(1)
                    expect(result[1].dateTime).to.equal('2022-05-17T08:27:15.000Z')
                    expect(result[1].imageUrl).to.equal('image url')
                    expect(result[1].maxAmountOfParticipants).to.equal(5)
                    expect(result[1].price).to.equal('6.50')
                    
                    expect(result[0].cookId).to.equal(1)

                    /* expect(result[1].cook.cookId).to.equal(1);
                    expect(result[1].cook.firstName).to.equal('first');
                    expect(result[1].cook.lastName).to.equal('last');
                    expect(result[1].cook.isActive).to.equal(1);
                    expect(result[1].cook.emailAdress).to.equal('name@server.nl');
                    expect(result[1].cook.password).to.equal('secret');
                    expect(result[1].cook.phoneNumber).to.equal('-');
                    expect(result[1].cook.roles).to.equal('editor,guest');
                    expect(result[1].cook.street).to.equal('street');
                    expect(result[1].cook.city).to.equal('city'); */
                    done()
                })
        })
    })

    describe('UC-304 Request details of a meal', () => {
        it('TC-304-1 Meal does not exist', (done) => {
            chai.request(server)
                .get('/api/meal/420')
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
                    status.should.be.a('number')
                    message.should.be
                        .a('string')
                        .that.contains('This user does not exist')
                    done()
                })
        })
    })

    it('TC-304-2 Meal details returned', (done) => {
        chai.request(server)
            .get('/api/meal/1')
            .end((err, res) => {
                assert.ifError(err)
                res.should.have.status(200)
                res.should.be.an('object')

                res.body.should.be
                    .an('object')
                    .that.has.all.keys('status', 'result')
                done()
            })
    })

    describe('UC-305 Deleting meals', () => {
        it('TC-305-2 not logged in (no token)', (done) => {
            chai.request(server)
                .delete('/api/meal/1')
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

        it('TC-305-2 not logged in (wrong token)', (done) => {
            chai.request(server)
                .delete('/api/meal/1')
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
                    status.should.be.a('number')
                    message.should.be
                        .a('string')
                        .that.contains('Unauthorized')
                    done()
                })
        })

        it('TC-305-3 Not the owner of the data', (done) => {
            chai.request(server)
                .delete('/api/meal/1')
                .set(
                    'authorization',
                    'Bearer ' + wrongToken
                )
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(403)
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
                        .that.contains('You are not the owner of this meal')
                    done()
                })
        })

        it('TC-305-4 Meal does not exist', (done) => {
            chai.request(server)
                .delete('/api/meal/420')
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
                    status.should.be.a('number')
                    message.should.be
                        .a('string')
                        .that.contains('This meal does not exist')
                    done()
                })
        })

        it('TC-305-5 Meal successfully deleted', (done) => {
            chai.request(server)
                .delete('/api/meal/1')
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
                    status.should.be.a('number')
                    message.should.be.a('string')
                        .that.contains('Meal succesfully deleted')
                    done()
                })
        })
    })
})