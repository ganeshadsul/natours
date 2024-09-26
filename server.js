const mongoose = require('mongoose');
const dotenv = require('dotenv');


process.on('uncaughtException', err => {
    console.log(`Uncaught Exception Detected`);
	console.log(err);
    console.log(err.name, err.message);
    console.log('Shutting Down Server!!');
    process.exit(1)
})


dotenv.config({path:'./config.env'})
const app = require('./app');

mongoose.connect(process.env.DATABASE.replace('<db_password>', process.env.DB_PASSWORD), {
    useNewUrlParser:true,
    useCreateIndex: true,
    useFindAndModify:false,
    useUnifiedTopology:true,
})
.then(con => {
    console.log(con.connections);
    console.log(`MongoDB Connected!`);
})

// const testTour = new Tour({
//     name:'The River Diver',
//     price:350,
//     rating:4.1
// })

// testTour.save().then(doc => console.log(doc)).catch(err => console.log('Something Went Wrong!'))


const PORT = process.env.PORT || 3000
const server = app.listen(PORT, () => {
    console.log(`App running on Port ${PORT}..........`);
})

process.on('unhandledRejection', err => {
    console.log(`Unhandled Rejected Detected`);
    console.log(err);
    server.close(() => {
        console.log('Shutting Down Server!!');
        process.exit(1)
    })
})
