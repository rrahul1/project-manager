import express from "express";
import mongoose from "mongoose";

import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Routes

mongoose
   .connect(process.env.MONGO, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
   })
   .then(() => console.log("Connected to MongoDB"))
   .catch((err) => console.log("Error connecting to MongoDB:", err));

// Server
const PORT = 5000;
app.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`);
});
