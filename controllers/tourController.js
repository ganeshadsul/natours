const fs = require('fs');
const Tour = require('../models/tourModel');
const ApiFeatures = require('./../utils/apiFeatures')
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlers/factoryHandlers');

// Using FactoryHandler
exports.getAllTours = factory.getAll(Tour);
exports.createTour = factory.createOne(Tour);
exports.getTour = factory.getOne(Tour, ['reviews']);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);


exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingAverage : { $gte : 4.5 } }
        },
        {
            $group: {
                // _id: null,
                // _id: '$difficulty',
                _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1 },
                avgRating: { $avg: '$ratingAverage' },
                avgPrice: { $avg: '$price' },
                minRating: { $min: '$price' },
                maxRating: { $max: '$price' },
            }
        },
        {
            $sort : { avgPrice: 1 }
        }
    ])

    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    })
})

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort : { numTourStarts: -1}
        }
    ])

    res.status(200).json({
        status: 'success',
        results: plan.length,
        data: {
            plan
        }
    })
})


// /tours-within/250/center/34.110636,-118.121568/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
    const {distance, latlng, unit} = req.params
    const [lat, lng] = latlng.split(',')

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1

    if(!lat || !lng) {
        next(new AppError('Please provide latitude and longitude in the format lat,lng.', 400))
    }

    const tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } } })

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours
        }
    })
})