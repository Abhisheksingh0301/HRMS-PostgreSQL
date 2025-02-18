//const LogModel = require('../suquelize'); // Correctly import the Sequelize model
const LogModel=require('../../schema/login')

console.log('LogModel:', LogModel); // Add this line to check the model
console.log('LogModel.findAll:', LogModel.findAll); // Add this line to check the findAll function

module.exports = async function (req, res, next) {
    if (req.session && req.session.userId) {
        // User is authenticated if req.session.userId exists
        return next();
    } else {
        try {
            const Loglist = await LogModel.findAll({ order: [['emp_name', 'ASC']] });
            res.render('login', { title: "Login form", userId: req.session.userId, empdata: Loglist });
        } catch (err) {
            console.error(err);
            next(err);
        }
    }
};
