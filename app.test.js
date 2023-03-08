process.env.NODE_ENV = "test"

const db = require('./db');
const request = require('supertest');
const app = require('./app')

beforeEach(async function() {
    const companies = await db.query(`INSERT INTO companies (code, name, description) VALUES ('apple','Apple Computer','iphones!'), ('ibm','IBM','Big blue')`)
    const invoices = await db.query(`INSERT INTO invoices (comp_code, amt, paid, add_date) VALUES ('apple',200, FALSE, '2023-03-08'), ('ibm',345,TRUE, CURRENT_DATE)`)
})

afterEach (async function () {
    const companies = await db.query(`DELETE FROM companies`);
    const invoices = await db.query(`DELETE FROM invoices`)
})

afterAll(async () => {

    await db.end()
})

test('get companies', async function() {
    const res = await request(app).get('/companies');
    expect(res.text).toContain('"code":"apple"')
})

test('missing company 404', async function() {
    const res = await request(app).get('/companies/asdfadfgasdfasd');
    expect(res.statusCode).toBe(404);
})

