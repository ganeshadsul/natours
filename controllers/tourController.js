const fs = require('fs');
const Tour = require('../models/tourModel');
const ApiFeatures = require('./../utils/apiFeatures')
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');

// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`))

// exports.checkBody = (req, res, next) => {
//     if(!req.name || !req.duration || !req.difficulty) {
//         return res.status(400).json({
//             status: 'fail', 
//             message: 'Data Missing'
//         })
//     }
//     next()
// }


// const catchAsync = fn => {
//     return (req, res, next) => {
//         fn(req, res, next).catch(next)
//     }
// }

exports.getAllTours = catchAsync(async (req, res, next) => {
    
    // Bulding query
    // const queryObj = {...req.query}
    // const excludedField = ['page', 'sort', 'limit', 'fields']
    // excludedField.forEach(el => delete queryObj[el])

    // let query = Tour.find(queryObj)
    
    // Sorting
    // if(req.query.sort) {
    //     let sortBy = req.query.sort.split(',').join(' ')
    //     query = query.sort(sortBy)
    // } else {
    //     query = query.sort('-createdAt')
    // }

    // Field Limiting
    // if(req.query.fields) {
    //     const fields = req.query.fields.split(',').join(' ')
    //     query = query.select(fields)
    // } else {
    //     query = query.select('-__v')
    // }

    // Pagination
    // const page = req.query.page * 1 || 1
    // const limit = req.query.limit * 1 || 10
    // const skip = (page - 1) * limit
    // query = query.skip(skip).limit(limit)

    const features = new ApiFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFilds()
        .pagination()

    const tours = await features.query

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours
        }
    })
})

exports.createTour = catchAsync(async (req, res, next) => {

    // const newTour = new Tour(req.body)
    // newTour.save();

    const newTour = await Tour.create(req.body)
    
    res.status(201).json({
        status: 'success',
        data: {
            tour: newTour
        }
    })
})

exports.getTour = catchAsync(async (req, res, next) => {

    const tour = await Tour.findById(req.params.id)

    if(!tour) {
        // return res.status(404).json({
        //     status: 'fail',
        //     data: {
        //         tour
        //     }
        // })

        return next(new AppError('Tour not found for specified id', 404))
    }
    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    })
})

exports.updateTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    if(!tour) {
        return next(new AppError('Tour not found for specified id', 404))
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    })
})

exports.deleteTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id)

    if(!tour) {
        return next(new AppError('Tour not found for specified id', 404))
    }

    res.status(200).json({
        status: 'success',
        data: null
    })
})

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
