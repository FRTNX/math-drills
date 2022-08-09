module.exports.config = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
    jwtSecret: process.env.JWT_SECRET || 'no_one_really_knows_what_they_put_in_kfc_to_give_it_that_thing_could_be_gross',
    mongoUri: process.env.MONGODB_URI || process.env.MONGO_HOST || 'mongodb://' + (process.env.IP || 'localhost') + ':' + (process.env.MONGO_PORT || '27017') + '/drills',
    request: { limit: '20mb' },
    adminKey: process.env.ADMIN_API_KEY || 'the_keys_to_the_city',
    drillBotServer: process.env.DRILL_BOT_SERVER || 'http://127.0.0.1:4002/drillbot'
};
