const mongoose = require('mongoose');

const schema = {
    review: {
        type: String,
        required: [true, 'Review field cannot be empty'],
    },
    rating: {
        type: Number,
        default: 0,
        min: [1, 'Rating cannot be below 0'],
        max: [5, 'Rating cannot be more than 5'],
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
};

const reviewSchema = mongoose.Schema(schema, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// Middlewares
reviewSchema.pre(/^find/, function (next) {
    // this.populate('tour').populate('user');
    this.populate({
        path: 'user',
        select: '_id name',
    });
    next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
