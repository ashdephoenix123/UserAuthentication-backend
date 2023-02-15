const mongoose = require('mongoose')
const URL = process.env.URL;


mongoose.set('strictQuery', true);
mongoose.connect(URL, {useNewUrlParser: true}).then(()=> console.log('DB connected')).catch(err=> console.log(err));

