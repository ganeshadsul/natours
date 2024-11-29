const express = require('express');
const router = express.Router()
const viewController = require('../controllers/viewsController')
const {protect, isLoggedIn} = require('../controllers/authController')


// router.get('/', viewController.base)

router.get('/', isLoggedIn, viewController.getOverview)
router.get('/tour/:slug', isLoggedIn, viewController.getTour)
router.get('/login', isLoggedIn, viewController.getLoginForm)
router.get('/me', protect, viewController.getAccount)
module.exports = router