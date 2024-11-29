const User = require("../models/userModel")
const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")
const factory = require('./handlers/factoryHandlers');
const multer = require('multer')

const multerStorage = multer.diskStorage({
    destination: (req, res, callback) => {
        callback(null, 'public/img/users')
    },
    filename: (req, file, callback) => {
        const fileExtension = file.mimetype.split('/')[1]
        callback(null, `user-${req.user.id}-${Date.now()}.${fileExtension}`)
    }
})

const multerFilter = (req, file, callback) => {
    console.log(file.mimetype.startsWith('image'));
    if(file.mimetype.startsWith('image')) {
        callback(null, true)
    } else {
        callback(new AppError('Not an Image! Please upload only images', 400), false)
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})

exports.uploadUserPhoto = upload.single('photo')

const filteObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) {
            newObj[el] = obj[el];
        }
    });
    return newObj;
};

exports.getAllUsers = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!',
    });
};
exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'Use Signup Route to create User',
    });
};
exports.getUser = factory.getOne(User, []);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

exports.updateMyDetails = catchAsync(async(req, res, next) => {

    if(req.body.password || req.body.passwordConfirm) {
        return next(new AppError('Password updation not allowed on this route', 400))
    }

    const filteredObject = filteObj(req.body, 'name', 'email')
    if(req.file) filteredObject.photo = req.file.filename

    const user = await User.findByIdAndUpdate(req.user.id, filteredObject, {
        new:true,
        runValidators: true
    })

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    })
})

exports.deleteMyAccount = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false })

    res.status(204).json({
        status: 'success',
        data: null
    })
})

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id
    next()
}