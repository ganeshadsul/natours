const ApiFeatures = require('../../utils/apiFeatures');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');

exports.deleteOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id);

        if (!doc) {
            return next(
                new AppError('Document not found for specified id', 404)
            );
        }

        res.status(204).json({
            status: 'success',
            data: null,
        });
    });

exports.updateOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!doc) {
            return next(
                new AppError('Document not found for specified id', 404)
            );
        }

        res.status(200).json({
            status: 'success',
            data: {
                doc,
            },
        });
    });

exports.createOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                tour: doc,
            },
        });
    });

exports.getOne = (Model, populateOptions) =>
    catchAsync(async (req, res, next) => {
        const docQuery = Model.findById(req.params.id);
        if (populateOptions.length)
            populateOptions.forEach((populateOption) =>
                docQuery.populate(populateOption)
            );
        const doc = await docQuery;

        if (!doc) {
            return next(
                new AppError('Document not found for specified id', 404)
            );
        }
        res.status(200).json({
            status: 'success',
            data: {
                doc,
            },
        });
    });

exports.getAll = (Model) =>
    catchAsync(async (req, res, next) => {
        let filter = {};
        if (req.params.tourId) filter = { tour: req.params.tourId };
        const features = new ApiFeatures(Model.find(filter), req.query)
            .filter()
            .sort()
            .limitFilds()
            .pagination();

        const docs = await features.query

        res.status(200).json({
            status: 'success',
            results: docs.length,
            data: {
                documents: docs,
            },
        });
    });
