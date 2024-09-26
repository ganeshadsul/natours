const Review = require('../models/reviewModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAllReviews = catchAsync(async (req, res, next) => {
    const reviews = await Review.find();

    res.status(200).json({
        status: 'success',
        data: {
            reviews,
        },
    });
});

exports.createReview = catchAsync(async (req, res, next) => {
    // const data = { ...req.body };
    // data.tour = req.params.id;
    // data.createdBy = req.user.id;
    const review = await Review.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            review,
        },
    });
    next();
});

// exports.getReview = catchAsync(async (req, res, next) => {
//     const reviews = await Review.find({ tour: req.params.id });
//     if (!reviews) {
//         return next(new AppError('No reviews found', 404));
//     }

//     res.status(200).json({
//         status: 'success',
//         data: {
//             reviews,
//         },
//     });
// });
