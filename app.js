require('dotenv').config();
const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')

require('./db/conn')

const app = express();
app.use(cookieParser()) //handles the cookies
app.use(express.json())  // tells the server to serve the json responses in object form
app.use(cors())
// app.use(cors({
//     origin: "https://userauthenticationreact.netlify.app",
//     credentials: true
// }))
app.use(require('./router/auth'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=> {
    console.log(`Server connected on port http://localhost:${PORT}`);
})
