const express = require('express');
const router = express.Router()
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')


router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.post('/forgot-password', authController.forgotPassword)
router.patch('/reset-password/:token', authController.resetPassword)

router.use(authController.protect)

router.get('/me', userController.getMe, userController.getUser)
router.patch('/update-password', authController.updatePassword)
router.patch('/update-my-details', userController.updateMyDetails)
router.delete('/delete-my-account', userController.deleteMyAccount)

router.route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser)
    
router.route('/:id')
    .get(userController.getUser)


module.exports= router