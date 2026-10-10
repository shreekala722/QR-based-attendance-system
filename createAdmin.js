const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

const Admin = require("./models/Admin");

dotenv.config();

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected.");

        const existingAdmin = await Admin.findOne({
            email: "admin@qrattendance.com"
        });

        if (existingAdmin) {
            console.log("Admin already exists.");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(
            "Admin@123",
            10
        );

        const admin = new Admin({
            name: "System Admin",
            email: "admin@qrattendance.com",
            password: hashedPassword,
            role: "admin"
        });

        await admin.save();

        console.log("Admin created successfully.");
        console.log("Email: admin@qrattendance.com");
        console.log("Password: Admin@123");

        process.exit(0);

    } catch (error) {

        console.log("Error creating admin:");
        console.log(error);

        process.exit(1);
    }
}

createAdmin();