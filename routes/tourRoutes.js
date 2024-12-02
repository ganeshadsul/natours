const express = require('express');
const {getAllTours, createTour, getTour, updateTour, deleteTour, getTourStats, getMonthlyPlan, getToursWithin, getToursDistance, uploadTourImages, resizeTourPhoto} = require('./../controllers/tourController');
const authController = require('../controllers/authController')
const reviewController = require('../controllers/reviewController');
const router = express.Router();
const reviewRouter = require('../routes/reviewRoutes');

router.param('id', (req, res, next, value) => {
	console.log(value);
	next();
});

// Routes
router
	.route('/')
	.get(getAllTours)
	.post(authController.protect, authController.restictTo('admin', 'lead-guide'), createTour);


router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(getToursWithin)
router.route('/distances/:latlng/unit/:unit').get(getToursDistance)

router.route('/stats').get(getTourStats);

router.route('/monthly-plan/:year').get(authController.protect, authController.restictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);

router
	.route( '/:id')
	.get(authController.protect, authController.restictTo('admin', 'lead-guide', 'user'), getTour)
	.patch(authController.protect, authController.restictTo('admin', 'lead-guide'), uploadTourImages, resizeTourPhoto, updateTour)
	.delete(
		authController.protect,
		authController.restictTo('admin', 'lead-guide'),
		deleteTour
	);

// Using standard way
// router
//     .route('/:tourId/review')
//     .get(reviewController.getReview)
//     .post(
//         authController.protect,
//         authController.restictTo('user'),
//         reviewController.createReview
//     );

// using merge params
router.use('/:tourId/review', reviewRouter);

module.exports = router