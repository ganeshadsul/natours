const fs = require('fs');
const Tour = require('../models/tourModel');
const ApiFeatures = require('./../utils/apiFeatures')
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlers/factoryHandlers');
const multer = require('multer');
const sharp = require('sharp');

// const multerStorage = multer.diskStorage({
//     destination: (req, res, callback) => {
//         callback(null, 'public/img/tours')
//     },
//     filename: (req, file, callback) => {
//         const fileExtension = file.mimetype.split('/')[1]
//         callback(null, `user-${req.user.id}-${Date.now()}.${fileExtension}`)
//     }
// })
const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, callback) => {
    if(file.mimetype.startsWith('image')) {
        callback(null, true)
    } else {
        callback(new AppError('Not an Image! Please upload only images', 400), false)
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})

exports.uploadTourImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 },
])
exports.resizeTourPhoto = catchAsync(async(req, res, next) => {
    if(!req.files.imageCover || !req.files.images) return next()

    // uploading tour cover image
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1300)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${req.body.imageCover}`)

    // uploading tour images
    req.body.images = []
    await Promise.all(
        req.files.images.map(async(file, i) => {
            const imageName = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`
            await sharp(file.buffer)
                .resize(2000, 1300)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`public/img/tours/${imageName}`)
            req.body.images.push(imageName)
        })
    )

    next()
})

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

exports.getToursDistance = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params
    const [lat, lng] = latlng.split(',')

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001
    if(!lat || !lng) {
        next(new AppError('Please provide latitude and longitude in the format lat,lng.', 400))
    }

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                // key: 'startLocation', // incase there are multiple indexes for cordinates
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1,
                name: 1,
                id: 1
            }
        }
    ])

    res.status(200).json({
        status: 'success',
        data: {
            distances
        }
    })
})