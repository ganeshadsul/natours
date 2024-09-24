const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')

const app = express()

// middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}
app.use(express.json())
app.use(express.static(`${__dirname}/public`))

// app.get('/', (req, res) => {
//     // res.status(200).send('Hello From Home Page!')
//     res.status(200).json({
//         success: true,
//         request_type: 'get',
//         message: 'Hello From Home Page!',
//         app: 'Natours'
//     })
// })

// app.post('/', (req, res) => {
//     res.status(200).json({
//         success: true,
//         request_type: 'POST',
//         message: 'Hello From Home Page!',
//         app: 'Natours'
//     })
// })


// app.get('/api/v1/tours', getAllTours)
// app.post('/api/v1/tours', createTour)
// app.get('/api/v1/tours/:id', getTour)


app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)


app.all('*', (req, res, next) => {
    
    // res.status(200).json({
    //     status: 'fail',
    //     message: `Can't find ${req.originalUrl} on this server`
    // })

    // const err = new Error(`Can't find ${req.originalUrl} on this server`)
    // err.status = 'fail'
    // err.statusCode = 404

    // next(err)

    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404))
})

app.use(globalErrorHandler)

module.exports = app