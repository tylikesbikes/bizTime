const express = require('express');
const db = require('../db')

const router = new express.Router();

router.get('', async (req, res, next) => {
    const result = await db.query(`SELECT * FROM companies`);
    res.send({"companies":result.rows})
})

module.exports = router;