const express = require('express');
const db = require('../db');
const ExpressError = require('../expressError');
const slugifyCompanyName = require('./helpers')


const router = new express.Router();

router.get('', async (req, res, next) => {
    try {const result = await db.query(`SELECT * FROM companies`);
       res.send({"companies":result.rows})
    } catch(e) {
        return next(e);
    }
})

router.get('/:code', async (req, res, next) => {
    try {
        const companyInfo = await db.query(`SELECT * FROM companies WHERE code = $1`, [req.params.code])

        if (companyInfo.rows.length===0) {
            throw new ExpressError(`Company not found: ${req.params.code}`, 404)
        }
        const invoiceDetails = await db.query(`SELECT * FROM invoices WHERE comp_code = $1`, [req.params.code])

        return res.send ({company:companyInfo.rows[0], invoices:invoiceDetails.rows})
        
    } catch(e) {
        return next(e);
    }
})

router.post('', async (req, res, next) => {
    try {
        let {name, description} = req.body;
        let code = slugifyCompanyName(name);
        const addQuery = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3)`, [code, name, description]);
        return res.status(201).send({company: {code, name, description}})
    } catch(e) {
        return next(e);
    }
})

router.put('/:code', async (req, res, next) => {
    try {
        let {name, description} = req.body;
        let code = req.params.code;
        let doesCompanyExist = await db.query(`SELECT DISTINCT code FROM companies WHERE code = $1`, [code]);
        if (doesCompanyExist.rows.length === 0) {
            throw new ExpressError(`Company not found: ${code}`, 404)
        }
        const editCompany = await db.query(`UPDATE COMPANIES SET name=$1, description=$2 where code = $3`, [name, description, code]);
        console.log(editCompany);
        return res.status(200).send({company: {code, name, description}});
    } catch(e) {
        return next(e);
    }
})

router.delete('/:code', async (req, res, next) => {
    try {
        let doesCompanyExist = await db.query(`SELECT DISTINCT code FROM companies WHERE code = $1`, [req.params.code]);
        if (doesCompanyExist.rows.length === 0) {
            throw new ExpressError(`Company not found: ${req.params.code}`, 404)
        }
        const deleteCompany = await db.query(`DELETE FROM companies where code = $1`, [req.params.code]);
        return res.status(200).send({status:"deleted"})
    } catch(e) {
        next(e);
    }
})

module.exports = router;