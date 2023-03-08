const express = require('express');
const ExpressError = require('../expressError');
const router = new express.Router();
const db = require('../db')

router.post('', async (req, res, next) => {
    try {
        let {code, industry} = req.body;
        const addIndustry = await db.query(`INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry`, [code, industry])
        return res.send({newIndustry:addIndustry.rows[0]})
    } catch(e) {
        return next(e);
    }
})

router.get('', async (req, res, next) => {
    try {
        const industries = await db.query(`SELECT * from industries`);
        const company_industries = await db.query(`SELECT * from company_industries`);

        for (let i of industries.rows) {
            i.companies = [];
            for (let c of company_industries.rows) {
                if (i.code === c.ind_code) {
                    i.companies.push(c.comp_code);
                }
            }
        }

        return res.send({industries:industries.rows})
    } catch(e) {
        return next(e);
    }
})

router.post('/:comp_code', async (req, res, next) => {
    try {
        const comp_code = req.params.comp_code;
        const {ind_code} = req.body;
        const companyIndustryAssociation = await db.query(`insert into company_industries (comp_code, ind_code) values ($1, $2) 
        RETURNING comp_code, ind_code`, [comp_code, ind_code]);
        
        return res.send({newAssociation:companyIndustryAssociation.rows[0]})
    } catch(e) {
        return next(e);
    }
})

module.exports = router;