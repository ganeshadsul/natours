const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModel');

const schema = {
    name: {
        type: String,
        unique: true,
        required: [true, 'Tour must have a name'],
        trim: true,
        minLength: [ 2, 'Tour name length should be more than 2' ],
        // maxLength: [ 15, 'Tour name length should be less than 15' ],
        // validate: [ validator.isAlpha , 'Tour name should only contain alphabets']
    },
    slug: String,
    price: {
        type: Number,
        required: [true, 'Tour must have a price'],
        default: 0.0
    },
    priceDiscount: {
        type: Number,
        default: 0.0,
        validate: {
            validator: function (val) {
                return val < this.price
            },
            message: 'Discount price should be less than original price'
        }
    },
    ratingAverage: {
        type: Number,
        default: 4.5,
        set: val => Math.round(val * 10) / 10
    },
    ratingQuantity: {
        type: Number,
        default: 0
    },
    duration: {
        type: Number,
        required: [true, 'Tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'Tour must have max group size']
    },
    difficulty: {
        type: String,
        required: [true, 'Tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Invalid tour difficulty given'
        }
    },
    summary: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        required: [true, 'Tour must have a description']
    },
    imageCover: {
        type: String,
        required: [true, 'Tour must have a cover image']
    },
    images: [String], // Array of string,
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point'],
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
}


const tourSchema = mongoose.Schema(schema, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})

// tourSchema.index({ price : 1 })
tourSchema.index({
    price : 1,
    ratingAverage : -1
})

tourSchema.index({
    slug : 1
})

// Middleware
// Document Middleware
// tourSchema.pre('save', function (next) {
//     console.log(`Saving the Tour ${this.name}`);
//     next()
// })

// Using Embedding to save user(guides in same object)
// tourSchema.pre('save', function (next) {
//     this.slug = slugify(this.name, { lower: true })
//     next()
// })

tourSchema.pre('save', async function (next) {
    const guidePromises = this.guides.map(async id => await User.findById(id))
    this.guides = await Promise.all(guidePromises)
	next();
})
// tourSchema.post('save', function (doc, next) {
//     console.log(doc);
//     next()
// })

// Query Middleware
// tourSchema.pre('find', function(next) {
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } });

    this.start = Date.now();
    next();
});

tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v',
    });
    next();
});

tourSchema.post(/^find/, function(docs, next) {
    console.log(`Time took for Query Excecution: ${Date.now() - this.start} milliseconds`);
    next()
})

// Aggregation
tourSchema.pre('aggregate', function(next) {
    this.pipeline().unshift({ $match: { secretTour: { $ne : true } } })
    next()
})

// Virtuals
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7
})
// Virtual populating
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id',
});

const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour