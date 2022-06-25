const { config } = require('./../config/config');
const app = require('./express');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(config.mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on('error', () => {
    throw new Error(`Unable to connect to database: ${config.mongoUri}`)
});

app.listen(config.port, (error) => {
    if (error) {
        console.log(error);
    }

    else {
        console.log(`Server running on http://localhost:${config.port}/`);
    }
});
