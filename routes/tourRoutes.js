const express = require('express');
const {getAllTours, createTour, getTour, updateTour, deleteTour, getTourStats, getMonthlyPlan} = require('./../controllers/tourController');
const authController = require('../controllers/authController')
const router = express.Router()

router.param('id', (req, res, next, value) => {
    console.log(value);
    next()
})

// Routes
router.route('/')
    .get(authController.protect, getAllTours)
    .post(createTour)

router.route('/stats')
    .get(getTourStats)

router.route('/monthly-plan/:year')
    .get(getMonthlyPlan)

router.route('/:id')
    .get(getTour)
    .patch(updateTour)
    .delete(authController.protect, authController.restictTo('admin', 'lead-guide'), deleteTour)


module.exports = router