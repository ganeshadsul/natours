const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require('../utils/appError');
const ApiFeatures = require('../utils/apiFeatures');
const sendEmail = require('../utils/email');
const crypto = require('crypto');


const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY_DURATION
    })
}

exports.signup = catchAsync(async(req, res, next) => {
  // const user = await User.create(req.body)
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  user.password = undefined;
  // const token = jwt.sign({ id:user._id }, process.env.JWT_SECRET, {
  //     expiresIn: process.env.JWT_EXPIRY_DURATION
  // })
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRY_DURATION * 60 * 60 * 1000
    ),
    secure: process.env.NODE_ENV === 'production' ? true : false,
    httpOnly: true,
  };

  res.cookie('jwt', token, cookieOptions);
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
})

// exports.login = catchAsync(async (req, res, next) => {
//     const { email, password } = req.body
// })
exports.login = catchAsync(async(req, res, next) => {
    const { email, password } = req.body

    if(!email || !password) {
        next(new AppError('Please provide email and password!', 400))
    }

    const user = await User.findOne({ email }).select('+password')

    if(!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect Credentials!', 401))
    }

    
    const token = signToken(user._id)
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRY_DURATION * 60 * 1000),
        secure: process.env.NODE_ENV === 'production' ? true : false,
        httpOnly: true
    }

    res.cookie('jwt', token, cookieOptions)
    res.status(200).json({
        status: 'success',
        token
    })
})

exports.getAllUsers = catchAsync(async(req, res, next) => {
    
    const features = new ApiFeatures(User.find(), req.query)
        .filter()
        .sort()
        .limitFilds()
        .pagination()
    const users = await features.query

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users
        }
    })
})

exports.protect = catchAsync(async (req, res, next) => {
    let token
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }

    if(!token) {
        return next(new AppError('User not logged in!', 401))
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    // const decoded = await jwt.verify(token, process.env.JWT_SECRET)

    const freshUser = await User.findById(decoded.id)
    if(freshUser.changedPassowrdAfter(decoded.iat)) {
        return next(new AppError('User changed Passowrd, Please Login again!', 401))
    }

    if(!freshUser) {
        return next(new AppError('The User belonging to this token no longer exists', 401))
    }

    req.user = freshUser
    next()
})

exports.restictTo = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            next(new AppError('You do not have permission to perform this action', 403))
        }
        next()
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email })

    if(!user) {
        return next(new AppError('There is no user with given email address', 404))
    }

    const token = user.createPasswordResetToken()
    await user.save({
        validateBeforeSave: false
    })

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/reset-passowrd/${token}`

    const message = `Please use the following URL with patch to reset your passowrd \n ${resetURL}`


    try {
        await sendEmail({
            email: user.email,
            subject: `Reset Password Token <Valid for 10 Minutes>`,
            message,
        })
    
        res.status(200).json({
            status: 'success',
            message: 'Reset URL sent on Email!'
        })
    } catch(err) {
        user.passwordResetToken = undefined
        user.passwordResetTokenExpires = undefined

        await user.save({
            validateBeforeSave: false
        })

        return next(new AppError('There was an error sending the email. Please try again later!', 500))
    }
})

exports.resetPassword = catchAsync(async (req, res, next) => {

    const passwordResetToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({ passwordResetToken, passwordResetTokenExpires: { $gt: Date.now() } })

    if(!user) {
        next(new AppError('Token is Invalid or Expired', 400)) 
    }

    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetToken = undefined
    user.passwordResetTokenExpires = undefined
    await user.save()

    const token = signToken(user._id)
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRY_DURATION * 60 * 1000),
        secure: process.env.NODE_ENV === 'production' ? true : false,
        httpOnly: true
    }

    res.cookie('jwt', token, cookieOptions)
    res.status(200).json({
        status: 'success',
        token
    })
})

exports.updatePassword = catchAsync(async (req, res, next) => {
    
    if(!req.body.currentPassword || !req.body.password || !req.body.passwordConfirm) return next(new AppError('Password is required', 400))

    const  {currentPassword, password, passwordConfirm } = req.body     
    const user = await User.findById(req.user.id).select('+password')

    if(!user || !(await user.correctPassword(currentPassword, user.password))) {
        return next(new AppError('Incorrect Credentials!', 401))
    }

    user.password = password
    user.passwordConfirm = passwordConfirm
    await user.save()
    
    const token = signToken(user.id)
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRY_DURATION * 60 * 1000),
        secure: process.env.NODE_ENV === 'production' ? true : false,
        httpOnly: true
    }

    res.cookie('jwt', token, cookieOptions)
    res.status(200).json({
        status: 'success',
        token
    })

})