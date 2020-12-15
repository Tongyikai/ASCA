const { AsyncLocalStorage } = require("async_hooks");

require("dotenv").config();

module.exports = {
    mongodb: {
        host: process.env.HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE,
        memberCollection: process.env.MEMBER_TABLE,
        memberCountersCollection: process.env.MEMBER_COUNTERS_TABLE
    },
    secret: process.env.SECRET,
    defaultAvatar: process.env.DEFAULT_AVATAR
}