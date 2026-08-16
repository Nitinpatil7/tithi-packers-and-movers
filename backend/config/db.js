const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const logger = require('../utility/logger');

const connectDb = async ()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        logger.info("MongoDB connected", { host: conn.connection.host, database: conn.connection.name });
        
    } catch (error) {
        logger.error("Error connecting to MongoDB", { error: error.message, stack: error.stack });
        process.exit(1);
    }
}

module.exports = connectDb;
