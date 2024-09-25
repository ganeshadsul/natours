const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

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
        default: 4.5
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
    ]
}


const tourSchema = mongoose.Schema(schema, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})

// Middleware
// Document Middleware
// tourSchema.pre('save', function (next) {
//     console.log(`Saving the Tour ${this.name}`);
//     next()
// })
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true })
    next()
})
// tourSchema.post('save', function (doc, next) {
//     console.log(doc);
//     next()
// })

// Query Middleware
// tourSchema.pre('find', function(next) {
tourSchema.pre(/^find/, function(next) {
    this.find({ secretTour: { $ne: true } })

    this.start = Date.now()
    next()
})

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

const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour