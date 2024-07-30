const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;

const UserSchema = new mongoose.Schema({

    username: {
        type: String,
        required: [true, "username already existed"]
    },
    email: {
        type: String,
        required: [true, "email not provided"],
        unique: [true, "email already exists in database!"],
    },
    password: {
        type: String,
        required: true,
    },
    birthday: {
        type: String,
        required: true,
    },
    phonenumber: {
        type: String,
        required: true
    }, role: {
        type: String,
        default: "normal user"
    }, username_lower: {
        type: String,
        required: true,
        index: { unique: true }
    },
    expiresAt: {
        type: Date,
    },
    otp: {
        type: String,
    },

}, { timestamps: true })

UserSchema.pre('save', function (next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);
            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};





module.exports = mongoose.model('User', UserSchema)

