const express = require('express');
const router = express.Router();
const UserModel = require('../models/users');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const sendEmail = require('./email')

function contains(arr, key, val) {

  for (var i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) return true;
  }
  return false;
}


router.get('/getusers', async function (req, res, next) {
  try {
    const result = await UserModel.find({ role: "normal user" }, { 'password': 0 })
    res.json(result)
  } catch (error) {
    res.send(error)
  }

});

router.get('/getusers/:id', async function (req, res, next) {
  try {
    const result = await UserModel.findOne({ role: "normal user", username_lower: req.params.id.toLowerCase() }, { 'password': 0 }).limit(50)
    res.json(result)

  } catch (error) {
    res.send(error)
  }

});
router.get('/getlikeUsers/:id', async function (req, res, next) {
  try {
    const result = await UserModel.find({ role: "normal user", username: { $regex: new RegExp("^" + req.params.id.toLowerCase(), "i") } }, { 'password': 0 }).limit(50)
    res.json(result)

  } catch (error) {
    res.send(error)
  }

});

router.post('/auth', async function (req, res, next) {
  try {
    const result = await UserModel.findOne({ 'username_lower': req.body.username.toLowerCase() })
    if(result){
      result.comparePassword(req.body.password, function (err, isMatch) {
        console.log(isMatch)
        if (err) throw err;
        if (isMatch) {
          res.json({ "status": "auth success", "obj": result })
  
        } else {
          res.json({ "status": "auth failed" })
        }
      });

    }else{
      res.json({ "status": "auth failed" })
      
    }
    


  } catch (error) {
    res.send(error)
  }


});

router.post('/Auth/admin', async function (req, res, next) {
  try {
    const result = await UserModel.findOne({ 'username_lower': req.body.username.toLowerCase(), role: "admin" })
    if (result) {
      result.comparePassword(req.body.password, function (err, isMatch) {
        if (err) throw err;
        if (isMatch) {
          res.json({ "status": "auth success", "obj": result })

        } else {
          res.json({ "status": "auth failed" })
        }
      });

    } else {
      res.json({ "status": "auth failed" })
    }

  } catch (error) {
    res.send(error)
  }


});

router.post('/Auth/owner', async function (req, res, next) {
  try {
    const result = await UserModel.findOne({ 'username_lower': req.body.username.toLowerCase(), role: "owner" })
    if(result){
      result.comparePassword(req.body.password, function (err, isMatch) {
        if (err) throw err;
        if (isMatch) {
          res.json({ "status": "auth success", "obj": result })
  
        } else {
          res.json({ "status": "auth failed" })
        }
      });
    }else{
      res.json({ "status": "auth failed" })
    }
    

  } catch (error) {
    res.send(error)
  }


});


router.post('/addUser', async function (req, res, next) {
  console.log(req.body)
  try {
    const usedEmail = await UserModel.find({}, { 'email': 1, '_id': 0 })
    const usedUsername = await UserModel.findAll({}, { 'username_lower': 1, '_id': 0 })
    const lowerUsername = req.body.username.toLowerCase()
    if (!contains(usedEmail, "email", req.body.email) && !contains(usedUsername, "username_lower", lowerUsername)) {
      const newuser = new UserModel(req.body);
      newuser.username_lower = req.body.username.toLowerCase();
      const result = await newuser.save();
      console.log(result)
      res.json({ "status": "added", "obj": result });

    } else {
      res.json({ "error": 'this email or username is already taken!!' })
    }

  } catch (error) {

    console.log(error)
    res.send(error)
  }

});

router.put('/edit/:id', async function (req, res, next) {
  console.log(req.body)
  req.body.username_lower = req.body.username.toLowerCase();
  try {
    const result = await UserModel.findOneAndUpdate({ username: req.params.id }, {
      $set: req.body
    }, { new: true });

    res.json({ status: 'edited', obj: result });
  } catch (error) {
    res.status(500).json({ error });
  }
});

const generateOTP = () => {
  const otpLength = 6;
  const characters = '0123456789';
  let otp = '';

  for (let i = 0; i < otpLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    otp += characters[randomIndex];
  }

  return otp;
};

router.post('/forgotPassword', async (req, res, next) => {
  console.log(req.body);
  try {
    const user = await UserModel.findOne({ 'email': req.body.email });
    console.log(user);

    if (!user) {
      res.json({ status: 'ไม่มีอีเมลดังกล่าว' });
      return;
    }

    const resetToken = generateOTP();
    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpires = Date.now() + 10 * 60 * 1000;

    await saveOTP(user.email, resetToken, user.resetPasswordTokenExpires);

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const emailMessage = `To reset your password, use the OTP: ${resetToken}`;
    await sendEmail({
      email: user.email,
      subject: 'Reset Password',
      message: emailMessage,
    });

    res.status(200).json({ status: 'success', message: 'Reset link sent to user email' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

async function saveOTP(email, otp, expiresAt) {
  try {
    const user = await UserModel.findOne({ email });
    if (user) {
      user.otp = otp;
      user.expiresAt = expiresAt;
      await user.save({ validateBeforeSave: false });
    }
  } catch (error) {
    throw error;
  }
}

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await UserModel.findOne({ email, otp });

    if (!user) {
      res.json({ status: 'invalid OTP or email' });
      return;
    }

    if (new Date() > user.expires) {
      res.json({ status: 'expired OTP' });
      // เรียกฟังก์ชันลบ OTP
      await deleteOTP(user.email);
      return;
    }

    res.json({ status: 'OTP verified' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

async function deleteOTP(email) {
  try {
    await UserModel.updateOne({ email }, { $unset: { otp: 1, expires: 1 } });
  } catch (error) {
    throw error;
  }
}


router.post('/resetPassword/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { newPassword } = req.body;

    const user = await UserModel.findOne({
      email: email,
      expiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ status: 'invalid or expired token' });
    }

    user.password = newPassword;
    user.email = undefined;
    user.expiresAt = undefined;

    await user.save();

    res.json({ status: 'password reset success' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});







module.exports = router;
