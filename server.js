// ==========================================
// PHYGITAL DINING CORE SERVER CONFIGURATION
// ==========================================

// IMPORT SYSTEM ENGINES
// Express acts as our primary web framework engine to listen for connections.
import express from 'express';
// Dotenv allows our script to read parameters from a secret hidden system environment file.
import dotenv from 'dotenv';

// Tell Dotenv to seek out and load any environment parameters found in our configuration workspace.
// 1. MUST BE INITIALIZED BEFORE ANY CONTROLLER/ROUTE IMPORTS
dotenv.config();
// conneting database configuration db.js
import connectDB from './config/db.js';
//Mounting Routes into
import menuRoutes from './routes/menuRoutes.js';
//AI routing module configuration file using unified ES module syntax.
import aiChatRoutes from './routes/aiChatRoutes.js';
// INITIALIZE SYSTEM CONFIGURATIONs


// INITIALIZE THE SERVER INSTANCE
// Instantiate the Express system engine. This object represents our active running web server.
const app = express();

// INITIALIZE THE DATABASE INSTANCE db.js
connectDB();


// Body parser middleware (Crucial for reading data from POST/PUT requests)
app.use(express.json());
//mounting menu items API gateway
app.use('/api/menu', menuRoutes);
//mounting AI endpoint 
app.use('/api/chat', aiChatRoutes);

// DEFINE CONSOLE SERVER COMMUNICATION CHANNELS
// Set the virtual network communication terminal line. Default to local lane 5000 if nothing else is defined.
const PORT = process.env.PORT || 5000;

// SYSTEM WORKSPACE MIDDLEWARE DEFINITIONS
// Instruct Express to automatically parse incoming text blocks formatted in JSON layout.
app.use(express.json());

// Expose the static public folder structure to serve frontend views
app.use(express.static('public'));

// ==========================================
// CORE ROOT STATUS DIAGNOSTIC LINE
// ==========================================
// A basic root URL mapping path handler to test our server environment connection locally.
app.get('/', (req, res) => {
  res.status(200).json({
    status: "online",
    message: "Welcome to the Phygital Dining Backend Architecture Suite!",
    timestamp: new Date()
  });
});

// START THE SERVER LISTENING PORT PROTOCOL
// Instruct our Express instance to boot up on our network communication terminal lane.
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` PHY-DIGITAL DINING SERVER STARTED SUCCESSFULLY!`);
  console.log(` ACTIVE AND LISTENING ON LOCAL PORT: http://localhost:${PORT}`);
  console.log(`=======================================================`);
});