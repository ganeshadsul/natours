const express = require('express');
const router = express.Router()
const viewController = require('../controllers/viewsController')
const {protect, isLoggedIn} = require('../controllers/authController')


// router.get('/', viewController.base)
router.use(isLoggedIn)

router.get('/', viewController.getOverview)
router.get('/tour/:slug', viewController.getTour)
router.get('/login', viewController.getLoginForm)
module.exports = router