// =========================================
// AUTH ROUTES
// Handles student and teacher registration
// and login
// =========================================

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Admin = require("../models/Admin");

const router = express.Router();


// =========================================
// REGISTER USER
// =========================================

router.post("/register", async (req, res) => {

    try {

        const {
            userType,
            name,
            usn,
            email,
            department,
            semester,
            section,
            password
        } = req.body;


        // Check required fields
        if (
            !userType ||
            !name ||
            !email ||
            !department ||
            !semester ||
            !section ||
            !password
        ) {

            return res.status(400).json({
                message: "Please fill all required fields."
            });

        }


        // =====================================
        // STUDENT REGISTRATION
        // =====================================

        if (userType === "student") {

            if (!usn) {

                return res.status(400).json({
                    message: "USN is required for student registration."
                });

            }


            // Check whether email already exists
            const existingEmail =
                await Student.findOne({ email });

            if (existingEmail) {

                return res.status(400).json({
                    message: "Student email already registered."
                });

            }


            // Check whether USN already exists
            const existingUSN =
                await Student.findOne({ usn });

            if (existingUSN) {

                return res.status(400).json({
                    message: "USN is already registered."
                });

            }


            // Encrypt password
            const hashedPassword =
                await bcrypt.hash(password, 10);


            // Create student
            const student =
                new Student({
                    name,
                    usn,
                    email,
                    password: hashedPassword,
                    department,
                    semester,
                    section,
                    role: "student"
                });


            await student.save();


            return res.status(201).json({

                message: "Student registered successfully.",

                user: {
                    id: student._id,
                    name: student.name,
                    usn: student.usn,
                    email: student.email,
                    department: student.department,
                    semester: student.semester,
                    section: student.section,
                    role: student.role
                }

            });

        }


        // =====================================
        // TEACHER REGISTRATION
        // =====================================

        if (userType === "teacher") {


            // Check whether email already exists
            const existingTeacher =
                await Teacher.findOne({ email });

            if (existingTeacher) {

                return res.status(400).json({
                    message: "Teacher email already registered."
                });

            }


            // Encrypt password
            const hashedPassword =
                await bcrypt.hash(password, 10);


            // Create teacher
            const teacher =
                new Teacher({
                    name,
                    email,
                    password: hashedPassword,
                    department,
                    role: "teacher"
                });


            await teacher.save();


            return res.status(201).json({

                message: "Teacher registered successfully.",

                user: {
                    id: teacher._id,
                    name: teacher.name,
                    email: teacher.email,
                    department: teacher.department,
                    role: teacher.role
                }

            });

        }


        // Invalid user type
        return res.status(400).json({
            message: "Invalid user type."
        });


    } catch (error) {

        console.log("Registration Error:", error);

        res.status(500).json({
            message: "Server error during registration."
        });

    }

});


// =========================================
// LOGIN USER
// =========================================

router.post("/login", async (req, res) => {

    try {

        const {
            userType,
            email,
            password
        } = req.body;


        // Check required fields
        if (
            !userType ||
            !email ||
            !password
        ) {

            return res.status(400).json({
                message: "Please enter email and password."
            });

        }


       let user;

if (userType === "student") {
    user = await Student.findOne({ email });

} else if (userType=== "teacher") {
    user = await Teacher.findOne({ email });

} else if (userType === "admin") {
    user = await Admin.findOne({ email });

}else {

            return res.status(400).json({
                message: "Invalid user type."
            });

        }


        // User not found
        if (!user) {

            return res.status(401).json({
                message: "Invalid email or password."
            });

        }


        // =====================================
        // CHECK PASSWORD
        // =====================================

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).json({
                message: "Invalid email or password."
            });

        }


        // =====================================
        // CREATE JWT TOKEN
        // =====================================

        const token =
            jwt.sign(
                {
                    id: user._id,
                    role: user.role
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "1d"
                }
            );


        // =====================================
        // USER DATA
        // =====================================

        let userData;


        if (userType === "student") {

            userData = {

                id: user._id,
                name: user.name,
                usn: user.usn,
                email: user.email,
                department: user.department,
                semester: user.semester,
                section: user.section,
                role: user.role

            };

        } else {

            userData = {

                id: user._id,
                name: user.name,
                email: user.email,
                department: user.department,
                role: user.role

            };

        }


        // =====================================
        // SEND RESPONSE
        // =====================================

        res.status(200).json({

            message: "Login successful.",

            token: token,

            user: userData

        });


    } catch (error) {

        console.log("Login Error:", error);

        res.status(500).json({
            message: "Server error during login."
        });

    }

});


module.exports = router;