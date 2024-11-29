const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const schema = {
    name: {
        type: String,
        required: [true, 'User must have a name'],
        trim: true,
        minLength: [2, 'User name should be more than 2 characters']
    },
    email: {
        type: String,
        required: ['true', 'User must have an email'],
        unique: true,
        trim: true,
        lowercase: true,
        validate: [validator.isEmail, 'Invalid email']
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    photo: {
        type: String,
        // required: [true, 'User must have an image'],
        default: 'default.jpg'
    },
    password: {
        type: String,
        required: [true, 'User must have a password'],
        minLength: [8, 'Password should be of atleast 8 characters'],
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Confirm passowod is mandatory'],
        minLength: [8, 'Confirmed password should be of atleast 8 characters'],
        validate: {
            validator: function(val) {
                return val === this.password
            },
            message: 'Confirm passord should be same as password'
        },
        select: false
    },
    passwordChangedAt: {
        type: Date,
        select: false
    },
    passwordResetToken: {
        type: String
    },
    passwordResetTokenExpires: {
        type: Date
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    }
}


const userSchema = mongoose.Schema(schema, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})

// Middleware

userSchema.pre(/^find/, function(next) {
    this.find({
        active: {
            $ne: false
        } 
    })
    next()
})

userSchema.pre('save', function(next) {
    if(this.isModified('password') || this.isNew) return next()

    this.passwordChangedAt = Date.now() - 1000
    next()
})

userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return next()

    this.password = await bcrypt.hash(this.password, 12)
    this.passwordConfirm = undefined
    next()
})

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changedPassowrdAfter = function(JWTTimstamp) {
    if(this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
        return JWTTimstamp < changedTimestamp
    }
    return false
}

userSchema.methods.createPasswordResetToken = function () {

    const token = crypto.randomBytes(32).toString('hex')

    this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex')
    this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000

    return token
}

const User = mongoose.model('User', userSchema)

module.exports = User