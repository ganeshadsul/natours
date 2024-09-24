const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');
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


const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'))

// Create Entries
const importData = async () => {
    try {
        const newTours = await Tour.create(tours)
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