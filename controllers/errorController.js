const AppError = require("../utils/appError")

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`
    return new AppError(message, 400)
}

const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/"(.*?)"/)[0];
    const message = `Duplicate value for field ${value}`
    return new AppError(message, 400)
}

const sendErrorDev = (err, req, res) => {
    if(req.originalUrl.startsWith('/api')) {
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        })
    } else {
        res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            message: 'Opps!! Something went wrong!'
        })
    }
}

const sendErrorProd = (err, req, res) => {
    if(req.originalUrl.startsWith('/api')) {
        if(err.isOperational) {
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            })
        } else {
            res.status(500).json({
                status: 'error',
                message: 'Something Went Wrong!'
            })
        }
    } else {
        res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            message: 'Opps!! Something went wrong!'
        })
    }
}

const handleValidationError = err => {
    const errors = Object.values(err.errors).map( el => el.message)

    const message = `Invalid input Data! ${errors.join('. ')}`
    return new AppError(message, 400)
}

const handleJsonWebTokenError = err => new AppError('Invalid Token', 401)
const handleTokenExpiredError = err => new AppError('Token Expired', 401)

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'


    if(process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res)
    } else if(process.env.NODE_ENV === 'production') {
        let error = {...err}
        console.log(err.name);
        if(err.name === 'CastError') error = handleCastErrorDB(err)
        if(err.code === 11000) error = handleDuplicateFieldsDB(err)
        if(err.name === 'ValidationError') error = handleValidationError(err)
        if(err.name === 'JsonWebTokenError') error = handleTokenExpiredError()
        if(err.name === 'TokenExpiredError') error = handleTokenExpiredError()
        sendErrorProd(error, req, res)
    }
}