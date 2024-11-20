const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');
const Review = require('../../models/reviewModel');
const User = require('../../models/userModel');
dotenv.config({path:'./config.env'})

mongoose.connect(process.env.DATABASE.replace('<db_password>', process.env.DB_PASSWORD), {
    useNewUrlParser:true,
    useCreateIndex: true,
    useFindAndModify:false,
    useUnifiedTopology:true,
})
.then(con => {
    console.log(`MongoDB Connected!`);
})


const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'))
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'))
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'))

// Create Entries
const importData = async () => {
    try {
        await User.create(users, { validateBeforeSave : false })
        await Tour.create(tours)
        await Review.create(reviews)
        console.log('Data loaded successfully');
    } catch (err) {
        console.log(err);
    }
    process.exit()
}
// Detele Entries
const deleteData = async () => {
    try {
        await Tour.deleteMany()
        await User.deleteMany()
        await Review.deleteMany()
        console.log('Data deleted successfully');
    } catch (err) {
        console.log(err);
    }
    process.exit()
}


if(process.argv.includes('--import')) {
    importData()
}
if(process.argv.includes('--delete')) {
    deleteData()
}
// if(process.argv[2] === '--import') {
//     importData()
// }
// if(process.argv[2] === '--delete') {
//     deleteData()
// }

// Delete Tours Command
// node ./dev-data/data/import-dev-data.js --delete

// Import Tours Command
// node ./dev-data/data/import-dev-data.js --import
