const express = require('express');
const ExpressError = require('../expressError');
const router = new express.Router();
const db = require('../db')

router.get('', async (req, res, next) => {
    try {
        const invoicesQuery = await db.query(`SELECT * FROM invoices`);
        return res.send({invoices:invoicesQuery.rows})
    } catch(e) {
        return next(e);
    }
})

router.get('/:id', async (req, res, next) => {
    try {
        const invoiceId = req.params.id;
        const invoicesQuery = await db.query(`
            SELECT i.*, c.code, c.name, c.description
            FROM invoices i 
            LEFT JOIN companies c on
            c.code = i.comp_code
             WHERE i.id = $1`, [invoiceId]);
        
        if (invoicesQuery.rows.length === 0) {
            throw new ExpressError(`Invoice id ${req.params.id} not found`, 404)
        }

        
        const {id, amt, paid, add_date, paid_date, code, name, description} = invoicesQuery.rows[0];

        return res.send({invoice:{id, amt, paid, add_date, paid_date, company: {code, name, description}}})

    } catch(e) {
        return next(e);
    }
})

router.post('', async (req, res, next) => {
    try {
        const {comp_code, amt} = req.body
        const newInvoice = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2)
            RETURNING id, comp_code, amt, paid, add_date, paid_date`, [comp_code, amt]);
        
        return res.send({invoice:newInvoice.rows[0]})



    } catch(e) {
        return next(e);
    }
})

// router.put('/:invoiceId', async (req, res, next) => {
//     try {
//         let {invoiceId} = req.params;
//         let {amt:amount, paid:isPaid} = req.body;
//         const invoicesQuery = await db.query(`
//             SELECT * from invoices WHERE id = $1 RETURNING `, [invoiceId]);
        
//         if (invoicesQuery.rows.length === 0) {
//             throw new ExpressError(`Invoice id ${invoiceId} not found`, 404)
//         }
//         const updateInvoice = await db.query(`UPDATE invoices SET amt = $1 WHERE id = $2
//             RETURNING id, comp_code, amt, paid, add_date, paid_date`, [amount, invoiceId]);
//         const {id, comp_code, amt, paid, add_date, paid_date} = updateInvoice.rows[0];
//         return res.send({invoice:{id, comp_code, amt, paid, add_date, paid_date}})
//     } catch(e) {
//         return next(e);
//     }
// })

router.put('/:invoiceId', async (req, res, next) => {
    try {
        let {invoiceId} = req.params;
        let {amt, paid} = req.body;

        const invoiceBefore = await db.query(`SELECT * FROM invoices WHERE id = $1`, [invoiceId]);
        if (invoiceBefore.rows.length === 0) {
            throw new ExpressError(`Unable to find invoice ${invoiceId}`, 404);
        } 

        let currentPaidStatus = invoiceBefore.rows[0].paid;
        let paid_date;
        let updateQuery;
        
        if (paid && !currentPaidStatus) {
            updateQuery = await db.query(`UPDATE invoices SET amt = $1, paid = TRUE, paid_date = CURRENT_DATE where id = $2 
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,[amt, invoiceId])
        } else if (!paid && currentPaidStatus) {
            updateQuery = await db.query(`UPDATE invoices SET amt = $1, paid = FALSE, paid_date = NULL where id = $2 
            RETURNING id, comp_code, amt, paid, add_date, paid_date`, [amt, invoiceId])
        } else {
            updateQuery = await db.query(`UPDATE invoices SET amt = $1 where id = $2 
            RETURNING id, comp_code, amt, paid, add_date, paid_date`, [amt, invoiceId])
        }

        return res.send({invoice:updateQuery.rows})



    } catch(e) {
        return next(e);
    }
})

router.delete('/:invoiceId', async (req, res, next) => {
    try {
        let {invoiceId} = req.params;

        const invoiceQuery = await db.query(`SELECT * FROM invoices where id = $1`, [invoiceId]);
        if (invoiceQuery.rows.length===0) {
            throw new ExpressError(`Invoice id ${invoiceId} not found`, 404)
        }

        const deleteInvoice = await db.query(`DELETE FROM invoices WHERE id = $1`, [invoiceId])
        return res.send({status:"deleted"})
    } catch(e) {
        return next(e);
    }
})

module.exports = router;