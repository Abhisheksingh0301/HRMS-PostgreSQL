var express = require("express");
var moment = require('moment');
var router = express.Router();
var authMiddleware = require("../routes/middleware/auth");  // Authentication middleware
const bcrypt = require('bcrypt');

// Sequelize Models
const EmpMstModel = require("../schema/emp_master");
const LeaveMstModel = require("../schema/leave_master");
const AttendanceModel = require("../schema/attendance");
const LogModel = require("../schema/login");




/* GET index page */
router.get("/", authMiddleware, function (req, res, next) {
  res.render("index", { title: "Introduction page", userId: req.session.userId });

});

//Get Employees page
router.get("/employees", authMiddleware, function (req, res, next) {
  res.render("employees", { title: "Employees page", userId: req.session.userId })
});
// Add new employee
router.post("/addemp/", authMiddleware, async (req, res) => {
  const str = req.body.empname;
  const rest = str.toUpperCase();

  try {
    const result = await EmpMstModel.count({ where: { emp_name: req.body.empname } });
    console.log('Total count:', result);

    if (result > 0) {
      console.log('Duplicate');
      res.render("hi", { title: "Duplicate record", userId: req.session.userId });
    } else {
      const empData = {
        emp_name: rest,
        year_of_joining: req.body.joinyr,
        gender: req.body.cmbGender,
        mob: req.body.txtmob,
        remarks: req.body.rmrk
      };

      await EmpMstModel.create(empData);

      const empList = await EmpMstModel.findAll({ order: [['emp_name', 'ASC']] });
      res.redirect('../emplist');
    }
  } catch (err) {
    console.log('Error:', err);
    res.status(500).send('Internal Server Error');
  }
});


//DISPLAY LIST OF EMPLOYEES
router.get('/emplist', authMiddleware, async (req, res) => {
  try {
    // Retrieve and sort the employee list
    const employeelist = await EmpMstModel.findAll({ order: [['emp_name', 'ASC']] });
    // Render the employee list view with the retrieved data
    res.render('emplist', {
      employeelist: employeelist,
      title: 'Employees list',
      userId: req.session.userId
    });
  } catch (err) {
    // Log the error and send an appropriate response
    console.error('Error retrieving employee list:', err);
    res.status(500).send('Internal server error');
  }
});



//Get leaves page
router.get('/leaves', authMiddleware, async (req, res, next) => {
  try {
    // Check if the user has the 'admin' role
    const rolecheck = await LogModel.count({ where: { role: 'admin', emp_name: req.session.fullName } });

    if (rolecheck > 0) {
      res.render('leaves', { title: 'Leaves page', userId: req.session.userId });
    } else {
      res.render('hi', { title: 'You are not authorised !!!', userId: req.session.userId });
    }
  } catch (err) {
    console.error('Error checking role:', err);
    res.status(500).send('Internal server error');
  }
});


//Add leave category
router.post("/addlv/", authMiddleware, async (req, res) => {
  try {
    const result = await LeaveMstModel.count({ where: { leave_abb: req.body.lvabb } });

    if (result > 0) {
      console.log('Duplicate');
      res.render("hi", { title: "Duplicate record", userId: req.session.userId });
    } else {
      const lvData = {
        leave_abb: (req.body.lvabb).toUpperCase(),
        leave_desc: (req.body.lvdesc).toUpperCase(),
        leave_alloted: req.body.lvallot,
        remarks: req.body.lvrmrk
      };

      await LeaveMstModel.create(lvData);

      console.log(lvData);
      res.redirect('../leaves');
    }
  } catch (err) {
    console.log('Error:', err);
    res.status(500).send('Internal Server Error');
  }
});



//DISPLAY LEAVES CATEGORY
router.get('/leavetype', authMiddleware, async (req, res) => {
  try {
    // Fetch the leave types and sort them
    const lvlist = await LeaveMstModel.findAll({ order: [['leave_abb', 'ASC']] });

    // Render the leave type view with the retrieved data
    res.render('leavetype', {
      lvlist: lvlist,
      title: "Leaves Category",
      userId: req.session.userId
    });
  } catch (err) {
    // Log the error and send an appropriate response
    console.error('Error retrieving leave types:', err);
    res.status(500).send('Internal server error');
  }
});


//EDIT EMPLOYEES
router.get('/edit-empl/:id', authMiddleware, async (req, res, next) => {
  const id = req.params.id;
  console.log(id);

  try {
    const data = await EmpMstModel.findByPk(id);
    res.render('edit-empl', { empdata: data, title: "Edit Employee", userId: req.session.userId });
  } catch (err) {
    next(err);
  }
});


//Edit employee  ::POST method
router.post("/edit-empl", authMiddleware, async (req, res) => {
  const empData = {
    emp_name: (req.body.empname).toUpperCase(),
    year_of_joining: req.body.joinyr,
    gender: req.body.cmbGender,
    mob: req.body.txtmob,
    remarks: req.body.rmrk
  };
  // console.log(empData);

  try {
    await EmpMstModel.update(empData, { where: { id: req.body.id } });
    res.redirect('../emplist');
  } catch (err) {
    console.log('Error:', err);
    res.status(500).send('Internal Server Error');
  }
});


//Leave entry
router.get("/attendance_entry", authMiddleware, async (req, res) => {
  try {
    const empdata = await EmpMstModel.findAll();
    const leavedata = await LeaveMstModel.findAll();
    const prm = await LogModel.findAll({ where: { role: 'admin', emp_name: req.session.fullName } });

    // console.log("prm variable ::::::::::::::::::::", prm.length);

    if (prm.length > 0) {
      console.log(prm.length);
      res.render('attendance_entry', {
        title: "Attendance entry",
        userId: req.session.userId,
        leavedata: leavedata,
        empdata: empdata,
        attData: "",
        moment: moment
      });
    } else {
      console.log(prm.length);
      return res.render("hi", {
        title: "You are not authorised",
        userId: req.session.userId
      });
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Internal Server Error');
  }
});


//ADD ATTENDANCE
router.post("/addatt/", authMiddleware, async (req, res) => {
  try {
    const result = await AttendanceModel.count({ where: { emp_name: req.body.empnm, leave_date: req.body.dt } });

    if (result > 0) {
      console.log('Duplicate');
      res.render("hi", { title: "Duplicate record", userId: req.session.userId });
    } else {
      const lvdt = moment(req.body.dt).format('dddd');
      if (lvdt == 'Sunday') {
        res.render("hi", { title: "Selected date is Sunday", userId: req.session.userId });
      } else {
        const prm = await LogModel.findOne({ where: { role: 'admin', emp_name: req.session.fullName } });

        if (prm) {
          const attData = {
            emp_name: (req.body.empnm).toUpperCase(),
            leave_type: (req.body.lvcat).toUpperCase(),
            leave_date: req.body.dt,
            enteredby: (req.session.fullName).toUpperCase(),
          };

          await AttendanceModel.create(attData);

          const empdata = await EmpMstModel.findAll();
          const leavedata = await LeaveMstModel.findAll();

          res.render('attendance_entry', {
            title: "Attendance entry",
            leavedata: leavedata,
            empdata: empdata,
            attData: attData,
            moment: moment,
            userId: req.session.userId
          });
        } else {
          res.render("hi", { title: "You are not authorized", userId: req.session.userId });
        }
      }
    }
  } catch (err) {
    console.log('Error:', err);
    res.status(500).send('Internal Server Error');
  }
});



//Access report page
router.get('/reports', authMiddleware, (req, res) => {

  res.render('reports', { title: "Report page", userId: req.session.userId });
});

//Daily attendance report
router.get('/dailyreport', authMiddleware, async (req, res) => {
  try {
    const empdata = await EmpMstModel.findAll();
    const lv = await LeaveMstModel.findAll();
    const yr = moment().year();

    res.render('dailyreport', {
      title: "Individual attendance report",
      empdata: empdata,
      moment: moment,
      year: yr,
      userId: req.session.userId,
      lvdata: lv
    });
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Error');
  }
});



//Individual report :: POST menthod
router.post('/individualrpt', authMiddleware, async (req, res) => {
  const currentdate = new Date();
  const empname = req.body.empnm;
  const chkleaves = req.body.chkleaves || [''];
  const stdate = new Date(req.body.stdt);
  const enddate = new Date(req.body.enddt);

  const whereCondition = {
    emp_name: empname,
    leave_date: { [Sequelize.Op.between]: [stdate, enddate] }
  };

  const selectedLv = Array.isArray(chkleaves) ? chkleaves : [chkleaves].filter(Boolean);
  if (selectedLv.length > 0) {
    whereCondition["Leave.leave_abb"] = { [Sequelize.Op.in]: selectedLv };
  }

  try {
    const data = await AttendanceModel.findAll({
      include: [{
        model: LeaveMstModel,
        as: 'Leave',
        where: whereCondition
      }],
      order: [['leave_date', 'ASC']]
    });

    const totalDays = Math.ceil(data.reduce((count, record) => {
      const leaveDate = new Date(record.leave_date);
      return count + (leaveDate.getDay() === 6 ? 0.5 : 1);
    }, 0));

    if (totalDays > 0) {
      res.render('individualreport', {
        heading: "Employee Attendance Report",
        title: empname,
        data: data,
        dept: "COE Office",
        moment: moment,
        stdate: stdate,
        enddate: enddate,
        curdt: currentdate,
        totalRecords: totalDays
      });
    } else {
      res.render("hi", { title: "No leaves in this period", userId: req.session.userId });
    }
  } catch (err) {
    console.log("Error:", err);
    res.status(500).send('Internal Server Error');
  }
});



//Summary Report :: Get method
router.get('/summaryreport', authMiddleware, async (req, res) => {
  try {
    const empdata = await EmpMstModel.findAll();
    const yr = moment().year();

    res.render('summaryreport', {
      title: "Summarised report",
      empdata: empdata,
      moment: moment,
      year: yr,
      userId: req.session.userId
    });
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Error');
  }
});


//Summary report :: POST method
router.post('/summaryrpt', authMiddleware, async (req, res) => {
  const currentdate = new Date();
  const stdate = new Date(req.body.stdt);
  const enddate = new Date(req.body.enddt);

  try {
    const data = await AttendanceModel.findAll({
      include: [{
        model: LeaveMstModel,
        as: 'Leave'
      }],
      where: {
        leave_date: { [Sequelize.Op.between]: [stdate, enddate] }
      },
      order: [['emp_name', 'ASC'], ['leave_type', 'ASC']]
    });

    // Create an object to hold adjusted totals for each employee
    const adjustedTotals = {};

    // Calculate total leaves considering Saturdays as 0.5
    data.forEach(record => {
      const leaveDate = new Date(record.leave_date);
      const isSaturday = leaveDate.getDay() === 6; // 6 means Saturday
      const adjustedLeaves = isSaturday ? 0.5 : 1; // Count Saturday as 0.5

      const empName = record.emp_name;
      const leaveType = record.Leave.leave_desc;

      if (!adjustedTotals[empName]) {
        adjustedTotals[empName] = {};
      }

      if (!adjustedTotals[empName][leaveType]) {
        adjustedTotals[empName][leaveType] = 0;
      }

      adjustedTotals[empName][leaveType] += adjustedLeaves; // Accumulate adjusted leaves
    });

    // Convert adjusted totals into an array format
    const formattedPivotTable = Object.keys(adjustedTotals).map(empName => {
      const leaveData = { emp_name: empName };

      Object.keys(adjustedTotals[empName]).forEach(leaveType => {
        leaveData[`${leaveType}_total_leaves`] = Math.ceil(adjustedTotals[empName][leaveType]);
      });

      return leaveData;
    });

    // Calculate total records as an integer
    const totalRecords = Math.ceil(formattedPivotTable.reduce((sum, row) => {
      return sum + Object.values(row).filter(v => typeof v === 'number').reduce((a, b) => a + b, 0);
    }, 0));

    res.render('summreport', {
      title: "Summarised Attendance Report",
      data: formattedPivotTable,
      dept: "COE Office",
      moment: moment,
      stdate: stdate,
      enddate: enddate,
      curdt: currentdate,
      totalRecords: totalRecords // This will be an integer
    });
  } catch (err) {
    console.log("Error:", err);
    res.status(500).send('Internal Server Error');
  }
});


//Login Post Form
router.post('/login', async (req, res, next) => {
  try {
    // Find a user with the given emp_name
    const user = await LogModel.findOne({ where: { emp_name: (req.body.txtuser).toUpperCase() } });

    // If user is not found or password is incorrect
    if (!user || !(await bcrypt.compare(req.body.txtpwd, user.password))) {
      console.log('Invalid credentials');
      return res.render("hi", { title: "Invalid credentials", userId: req.session.userId });
    }

    // Extract first name from full name
    const namePart = req.body.txtuser.split(" ");
    const firstName = namePart[0];

    // Set session variables
    req.session.userId = (firstName).toUpperCase();
    req.session.fullName = req.body.txtuser;
    //console.log(req.session.userId);

    // Render the introduction page
    res.render("index", { title: "Introduction page", userId: req.session.userId });
  } catch (err) {
    console.log(err);
    // Handle errors appropriately
    return next(err);
  }
});



//Signup get method
router.get('/signup', async (req, res) => {
  try {
    const empdata = await EmpMstModel.findAll();
    res.render('signup', { title: "Signup page", empdata: empdata, userId: req.session.userId });
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Error');
  }
});



//Signup post form
router.post('/signup', async (req, res) => {
  try {
    const result = await LogModel.count({ where: { emp_name: req.body.empname } });

    if (result > 0) {
      console.log("Duplicate name");
      res.render('hi', { title: "Duplicate name", userId: req.session.userId });
    } else {
      if (req.body.txtcnfrmpwd == req.body.txtpwd) {
        const employeelist = await EmpMstModel.findAll({
          where: { emp_name: req.body.empname },
          order: [['emp_name', 'ASC']]
        });

        const logindata = {
          emp_name: req.body.empname,
          password: req.body.txtpwd,
        };
        const LogData = LogModel.build(logindata);

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(LogData.password, saltRounds);

        // Set the hashed password
        LogData.password = hashedPassword;

        // Save the new user to the Database
        await LogData.save();

        const Loglist = await LogModel.findAll({ order: [['emp_name', 'ASC']] });

        res.render('login', { title: "Login form", userId: req.session.userId, empdata: Loglist });
      } else {
        res.render('hi', { title: "Password didn't match", userId: req.session.userId });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal server error');
  }
});


//Logout 
router.get('/logout', async (req, res, next) => {
  try {
    await new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
    res.redirect('/');
  } catch (err) {
    next(err);
  }
});




//ABOUT PAGE
router.get('/about', (req, res) => {
  res.render('about', { title: "This is about page", userId: req.session.userId });
});




module.exports = router;

//END OF FILE
