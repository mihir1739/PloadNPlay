const express = require('express');
const app = express();
const cors = require('cors');
const { dbConnection } = require('./database/connection');
const {readdirSync} = require('fs');
const path = require('path');

require('dotenv').config()

const PORT = process.env.PORT || 4000

//middlewares
app.use(cors())
app.use(express.json())

//routes
readdirSync('./routes').map((route) => app.use('/api', require('./routes/' + route)))

//serve static files
app.use('/public', express.static(path.join(__dirname, 'public')))

const server = () => {
    dbConnection()
    app.listen(PORT, () => {
        console.log(`Server is listening to ${PORT}`)
    })
}

server()