// =========================================
// STUDENT ROUTES
// Handles student profile and attendance data
// =========================================

const express = require("express");

const Student = require("../models/Student");
const Attendance = require("../models/Attendance");

const router = express.Router();


// =========================================
// GET STUDENT PROFILE
// =========================================

router.get("/:studentId", async (req, res) => {

    try {

        const student =
            await Student.findById(req.params.studentId)
                .select("-password");

        if (!student) {

            return res.status(404).json({
                message: "Student not found."
            });

        }

        res.status(200).json({
            message: "Student profile retrieved successfully.",
            student: student
        });

    } catch (error) {

        console.log("Student Profile Error:", error);

        res.status(500).json({
            message: "Server error while retrieving student profile."
        });

    }

});


// =========================================
// GET STUDENT ATTENDANCE
// =========================================

router.get("/:studentId/attendance", async (req, res) => {

    try {

        const student =
            await Student.findById(req.params.studentId);

        if (!student) {

            return res.status(404).json({
                message: "Student not found."
            });

        }


        const attendance =
            await Attendance.find({
                student: req.params.studentId
            })
            .populate("subject", "name code")
            .populate("session", "sessionId semester section")
            .sort({ date: -1 });


        res.status(200).json({

            message: "Attendance records retrieved successfully.",

            attendance: attendance

        });


    } catch (error) {

        console.log("Attendance Retrieval Error:", error);

        res.status(500).json({
            message: "Server error while retrieving attendance."
        });

    }

});


// =========================================
// GET ATTENDANCE SUMMARY
// =========================================

router.get("/:studentId/attendance-summary", async (req, res) => {

    try {

        const student =
            await Student.findById(req.params.studentId);

        if (!student) {

            return res.status(404).json({
                message: "Student not found."
            });

        }


        const attendance =
            await Attendance.find({
                student: req.params.studentId
            });


        const totalClasses =
            attendance.length;


        const classesAttended =
            attendance.filter(
                record => record.status === "Present"
            ).length;


        const classesAbsent =
            attendance.filter(
                record => record.status === "Absent"
            ).length;


        let attendancePercentage = 0;


        if (totalClasses > 0) {

            attendancePercentage =
                (classesAttended / totalClasses) * 100;

        }


        attendancePercentage =
            attendancePercentage.toFixed(2);


        res.status(200).json({

            message: "Attendance summary retrieved successfully.",

            summary: {

                totalClasses: totalClasses,

                classesAttended: classesAttended,

                classesAbsent: classesAbsent,

                attendancePercentage:
                    attendancePercentage

            }

        });


    } catch (error) {

        console.log("Attendance Summary Error:", error);

        res.status(500).json({
            message:
                "Server error while retrieving attendance summary."
        });

    }

});


module.exports = router;