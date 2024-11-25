const Tour = require('../models/tourModel')
const catchAsync =  require('../utils/catchAsync')

exports.base = (req, res) => {
	res.status(200).render('base', {
		title: 'This is Home to the Tours!',
		tour: 'The Forest Hiker',
		user: 'Manthan Adsul'
	})
}

exports.getOverview = catchAsync(async (req, res, next) => {
	
	const tours = await Tour.find()
	res.status(200).render('overview', {
		title: 'All Tours',
		tours
	})
})

exports.getTour = catchAsync(async (req, res, next) => {
	res.setHeader(
        "Content-Security-Policy",
        "script-src 'self' https://cdn.maptiler.com; worker-src 'self' blob:;"
    );
	const tour = await Tour.findOne({ slug: req.params.slug }).populate({
		path: 'reviews',
		fields: 'review rating user'
	})
	const mapKey = process.env.MAPTILER_KEY

	res.status(200).render('tour', {
		title: tour.name,
		tour,
		mapKey
	})
})

// User Login Page
exports.getLoginForm = catchAsync(async (req, res, next) => {
	res.setHeader(
        "Content-Security-Policy",
        "script-src 'self' https://cdnjs.cloudflare.com/ajax/libs/axios/1.7.7/axios.min.js; worker-src 'self' blob:;"
    );
	res.status(200).render('login', {
		title: 'Login'
	})
})