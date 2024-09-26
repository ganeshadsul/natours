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
    // Allowing nested routes
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;
    const review = await Review.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            review,
        },
    });
});

exports.getReview = catchAsync(async (req, res, next) => {
    const reviews = await Review.find({ tour: req.params.tourId });
    if (!reviews) {
        return next(new AppError('No reviews found', 404));
    }

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews,
        },
    });
});
