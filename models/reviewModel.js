const mongoose = require('mongoose');
const Tour = require('./tourModel')

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

reviewSchema.index({ tour: 1, user: 1 }, { unique: true })

reviewSchema.statics.calcAverageRating = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match : { tour : tourId }
        },
        {
            $group : {
                _id : '$tour',
                count : { $sum : 1 },
                average : { $avg : '$rating' }
            }
        }
    ])

    if(stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingAverage: stats[0].average,
            ratingQuantity: stats[0].count
        })
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingAverage: 4.5,
            ratingQuantity: 0
        })
    }
}

reviewSchema.post('save', function() {
    // this keyword points to the current object of the model

    // to get call function on model use this.constructor
    this.constructor.calcAverageRating(this.tour)
})


reviewSchema.pre(/^findOneAnd/, async function(next) {
    this.r = await this.findOne()
    
    next()
})
reviewSchema.post(/^findOneAnd/, async function() {
    await this.r.constructor.calcAverageRating(this.r.tour)
})


// Middlewares
reviewSchema.pre(/^find/, function (next) {
    // this.populate('tour').populate('user');
    this.populate({
        path: 'user',
        select: '_id name photo',
    });
    next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
