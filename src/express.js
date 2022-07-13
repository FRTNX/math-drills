const express = require('express');
const { config } = require('./../config/config');

const cookieParser = require('cookie-parser');
const compress = require('compression');
const cors = require('cors');
const helmet = require('helmet');

const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const opRoutes = require('./routes/operations.routes');
const userAnswerRoutes = require('./routes/user.answer.routes');
const userStatsRoutes = require('./routes/user.stats.routes');


const app = express();

const logit = (request, response, next) => {
    console.log('Request recieved: ', request.method, request.url);
    next();
};

app.use(logit);

app.use(express.json({ limit: config.request.limit }));
app.use(express.urlencoded());

// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(compress())
app.use(helmet())
app.use(cors())

app.use('/', userAnswerRoutes);
app.use('/', userStatsRoutes);
app.use('/', userRoutes);
app.use('/', authRoutes)
app.use('/', opRoutes)


app.use('*', (request, response) => {
    response.status(404).json({ message: 'Resource not found'});
});

module.exports = app;
