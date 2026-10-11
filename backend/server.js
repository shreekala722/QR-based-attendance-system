// =========================================
// SERVER.JS
// Main server file for QR Attendance System
// =========================================

// Import packages
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

// Import route files
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Load environment variables
dotenv.config();

// Create Express application
const app = express();


// =========================================
// MIDDLEWARE
// =========================================

// Allow frontend to communicate with backend
app.use(cors());

// Allow JSON data
app.use(express.json());
app.use(express.static(path.join(__dirname, "../forntend")));


// =========================================
// TEST ROUTE
// =========================================

app.get("/", (req, res) => {

    res.send("QR Attendance System Backend is Running!");

});


// =========================================
// API ROUTES
// =========================================

app.use("/api/auth", authRoutes);

app.use("/api/students", studentRoutes);

app.use("/api/teachers", teacherRoutes);

app.use("/api/sessions", sessionRoutes);

app.use("/api/attendance", attendanceRoutes);

app.use("/api/admin", adminRoutes);




// =========================================
// MONGODB CONNECTION
// =========================================

mongoose.connect(process.env.MONGO_URI)
    .then(() => {

        console.log("MongoDB connected successfully.");

    })
    .catch((error) => {

        console.log("MongoDB connection failed.");
        console.log(error);

    });


// =========================================
// SERVER PORT
// =========================================

const PORT = process.env.PORT || 5000;


// =========================================
// START SERVER
// =========================================

app.listen(PORT, () => {

    console.log(
        `Server is running on http://localhost:${PORT}`
    );

});