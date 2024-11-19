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

exports.getTour = (req, res) => {
	res.status(200).render('tour', {
		title: 'This is Tour Title',
		tour: 'The Forest Hiker'
	})
}