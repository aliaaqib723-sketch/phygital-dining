import mongoose from 'mongoose';

/**
 * ASYNCHRONOUS DATABASE CONNECTION ENGINE
 * Connects the Node.js application layer to the MongoDB Atlas cloud instance.
 */
const connectDB = async () => {
  try {
    // Attempt connection using the hidden URI variable from your .env file
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`=======================================================`);
    console.log(` MONGODB ATLAS CLOUD DATABASE CONNECTED SUCCESSFULLY!`);
    console.log(` HOST NODE: ${conn.connection.host}`);
    console.log(`=======================================================`);
  } catch (error) {
    console.error(` DATABASE CONNECTION FAILURE ERROR: ${error.message}`);
    // Force exit the server process with failure code (1) to prevent unstable operations
    process.exit(1);
  }
};

export default connectDB;