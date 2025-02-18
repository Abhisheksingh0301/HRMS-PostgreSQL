var express = require("express");
var os = require('os');
var moment = require('moment');
var router = express.Router();
var authMiddleware = require("../routes/middleware/auth"); //added on 13-9-24

const LogModel = require("../schema/login"); // Updated to use Sequelize model

/* GET index page */
router.get("/", authMiddleware, async function (req, res, next) {
    if (req.session && req.session.userId) {
        return res.render("index", { title: "Introduction page", userId: req.session.userId });
    } else {
        try {
            const Loglist = await LogModel.findAll({ order: [['emp_name', 'ASC']] });
            res.render('login', { title: "Login form", userId: req.session.userId, empdata: Loglist });
        } catch (err) {
            console.error(err);
            next(err);
        }
    }
});

module.exports = router;
