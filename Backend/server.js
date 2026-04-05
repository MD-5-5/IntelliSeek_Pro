import './src/config/env.js'
import app from './src/app.js';
import http from 'http';
import connectDB from './src/config/database.js';
import { iniSocket } from './src/sockets/server.socket.js';

// import { testAi } from './src/services/ai.service.js';

// load environment variables from .env file
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 3000 ;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/perplexity';

iniSocket(httpServer);

connectDB(MONGO_URI)
    .catch((err) => {
        console.error("MongoDB Connection failed:", err);
        process.exit(1);
    });

httpServer.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});