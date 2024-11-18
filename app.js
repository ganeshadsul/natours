const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');

const app = express();

// setting template engine
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

// Set security HTTP headers
app.use(helmet());

// Global Middleware
// Limit requests from same API
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, Please try again in an one hour',
});
app.use('/api', limiter);

// middleware
// Development Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
app.use(express.json());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
    hpp({
        whitelist: [
            'duration',
            'priceDiscount',
            'ratingAverage',
            'ratingQuantity',
            'maxGroupSize',
            'difficulty',
            'price',
        ],
    })
);

// Serving static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

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


app.get('/', (req, res) => {
    res.status(200).render('base')
})

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
    // res.status(200).json({
    //     status: 'fail',
    //     message: `Can't find ${req.originalUrl} on this server`
    // })

    // const err = new Error(`Can't find ${req.originalUrl} on this server`)
    // err.status = 'fail'
    // err.statusCode = 404

    // next(err)

    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler)

module.exports = app