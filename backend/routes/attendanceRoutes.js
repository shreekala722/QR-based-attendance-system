// =========================================
// ATTENDANCE ROUTES
// Handles marking and viewing attendance
// =========================================

const express = require("express");

const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const Session = require("../models/Session");
const Subject = require("../models/Subject");

const router = express.Router();


// =========================================
// MARK ATTENDANCE
// =========================================

router.post("/mark", async (req, res) => {

    try {

        const {
            studentId,
            sessionId
        } = req.body;


        // Check required fields
        if (!studentId || !sessionId) {

            return res.status(400).json({
                message: "Student ID and Session ID are required."
            });

        }


        // =====================================
        // CHECK STUDENT
        // =====================================

        const student =
            await Student.findById(studentId);

        if (!student) {

            return res.status(404).json({
                message: "Student not found."
            });

        }


        // =====================================
        // CHECK SESSION
        // =====================================

        const session =
            await Session.findOne({
                sessionId: sessionId
            });

        if (!session) {

            return res.status(404).json({
                message: "Attendance session not found."
            });

        }


        // =====================================
        // CHECK WHETHER SESSION IS ACTIVE
        // =====================================

        if (!session.isActive) {

            return res.status(400).json({
                message: "Attendance session is no longer active."
            });

        }


        // =====================================
        // CHECK SESSION EXPIRY
        // =====================================

        const currentTime = new Date();

        if (currentTime > session.expiryTime) {

            session.isActive = false;

            await session.save();

            return res.status(400).json({
                message: "Attendance QR code has expired."
            });

        }


        // =====================================
        // CHECK STUDENT CLASS
        // =====================================

        if (
            student.semester !== session.semester ||
            student.section.toUpperCase() !==
            session.section.toUpperCase()
        ) {

            return res.status(403).json({
                message:
                    "Student does not belong to this class."
            });

        }


        // =====================================
        // CHECK DUPLICATE ATTENDANCE
        // =====================================

        const existingAttendance =
            await Attendance.findOne({

                student: studentId,

                session: session._id

            });


        if (existingAttendance) {

            return res.status(400).json({
                message:
                    "Attendance has already been marked for this session."
            });

        }


        // =====================================
        // CREATE ATTENDANCE RECORD
        // =====================================

        const attendance =
            new Attendance({

                student: studentId,

                session: session._id,

                subject: session.subject,

                date: new Date(),

                status: "Present",

                markedAt: new Date()

            });


        await attendance.save();


        // =====================================
        // SEND SUCCESS RESPONSE
        // =====================================

        res.status(201).json({

            message:
                "Attendance marked successfully.",

            attendance: {

                id: attendance._id,

                studentId: studentId,

                sessionId: session.sessionId,

                status: attendance.status,

                date: attendance.date,

                markedAt: attendance.markedAt

            }

        });


    } catch (error) {

        console.log(
            "Mark Attendance Error:",
            error
        );

        res.status(500).json({

            message:
                "Server error while marking attendance."

        });

    }

});


// =========================================
// GET ATTENDANCE FOR A STUDENT
// =========================================

router.get("/student/:studentId", async (req, res) => {

    try {

        const student =
            await Student.findById(
                req.params.studentId
            );

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
            .populate(
                "session",
                "sessionId semester section startTime"
            )
            .sort({
                date: -1
            });


        res.status(200).json({

            message:
                "Student attendance retrieved successfully.",

            attendance: attendance

        });


    } catch (error) {

        console.log(
            "Student Attendance Error:",
            error
        );

        res.status(500).json({

            message:
                "Server error while retrieving attendance."

        });

    }

});


// =========================================
// GET ATTENDANCE FOR A SESSION
// =========================================

router.get("/session/:sessionId", async (req, res) => {

    try {

        const session =
            await Session.findOne({

                sessionId:
                    req.params.sessionId

            });


        if (!session) {

            return res.status(404).json({

                message:
                    "Attendance session not found."

            });

        }


        const attendance =
            await Attendance.find({

                session: session._id

            })
            .populate(
                "student",
                "name usn email department semester section"
            )
            .populate(
                "subject",
                "name code"
            )
            .sort({
                markedAt: 1
            });


        res.status(200).json({

            message:
                "Session attendance retrieved successfully.",

            attendance: attendance

        });


    } catch (error) {

        console.log(
            "Session Attendance Error:",
            error
        );

        res.status(500).json({

            message:
                "Server error while retrieving session attendance."

        });

    }

});


// =========================================
// GET ATTENDANCE SUMMARY FOR STUDENT
// =========================================

router.get(
    "/student/:studentId/summary",
    async (req, res) => {

        try {

            const student =
                await Student.findById(
                    req.params.studentId
                );

            if (!student) {

                return res.status(404).json({
                    message: "Student not found."
                });

            }


            const attendance =
                await Attendance.find({

                    student:
                        req.params.studentId

                });


            const totalClasses =
                attendance.length;


            const classesAttended =
                attendance.filter(
                    record =>
                        record.status === "Present"
                ).length;


            const classesAbsent =
                attendance.filter(
                    record =>
                        record.status === "Absent"
                ).length;


            let percentage = 0;


            if (totalClasses > 0) {

                percentage =
                    (classesAttended /
                        totalClasses) *
                    100;

            }


            percentage =
                percentage.toFixed(2);


            res.status(200).json({

                message:
                    "Attendance summary retrieved successfully.",

                summary: {

                    totalClasses:
                        totalClasses,

                    classesAttended:
                        classesAttended,

                    classesAbsent:
                        classesAbsent,

                    attendancePercentage:
                        percentage

                }

            });


        } catch (error) {

            console.log(
                "Attendance Summary Error:",
                error
            );

            res.status(500).json({

                message:
                    "Server error while retrieving attendance summary."

            });

        }

    }
);


module.exports = router;