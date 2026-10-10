// =========================================
// SESSION ROUTES
// Handles attendance session creation,
// QR session data, and session stopping
// =========================================

const express = require("express");

const Session = require("../models/Session");
const Teacher = require("../models/Teacher");
const Subject = require("../models/Subject");

const router = express.Router();


// =========================================
// CREATE ATTENDANCE SESSION
// =========================================

router.post("/create", async (req, res) => {

    try {

        const {
            teacherId,
            subjectId,
            semester,
            section,
            duration
        } = req.body;


        // Check required fields
        if (
            !teacherId ||
            !subjectId ||
            !semester ||
            !section ||
            !duration
        ) {

            return res.status(400).json({
                message: "Please provide all required session details."
            });

        }


        // =====================================
        // CHECK TEACHER
        // =====================================

        const teacher =
            await Teacher.findById(teacherId);

        if (!teacher) {

            return res.status(404).json({
                message: "Teacher not found."
            });

        }


        // =====================================
        // CHECK SUBJECT
        // =====================================

        const subject =
            await Subject.findById(subjectId);

        if (!subject) {

            return res.status(404).json({
                message: "Subject not found."
            });

        }


        // =====================================
        // GENERATE UNIQUE SESSION ID
        // =====================================

        const sessionId =
            "SESSION-" +
            Date.now() +
            "-" +
            Math.floor(Math.random() * 1000);


        // =====================================
        // SET START AND EXPIRY TIME
        // =====================================

        const startTime = new Date();

        const expiryTime =
            new Date(
                startTime.getTime() +
                Number(duration) * 60 * 1000
            );


        // =====================================
        // CREATE SESSION
        // =====================================

        const session =
            new Session({

                sessionId: sessionId,

                subject: subjectId,

                teacher: teacherId,

                semester: Number(semester),

                section: section,

                startTime: startTime,

                expiryTime: expiryTime,

                isActive: true

            });


        await session.save();


        // =====================================
        // QR DATA
        // =====================================

        const qrData = {

            sessionId: session.sessionId,

            subject: subject.name,

            semester: session.semester,

            section: session.section

        };


        // =====================================
        // SEND RESPONSE
        // =====================================

        res.status(201).json({

            message:
                "Attendance session created successfully.",

            session: {

                id: session._id,

                sessionId: session.sessionId,

                subject: subject.name,

                semester: session.semester,

                section: session.section,

                startTime: session.startTime,

                expiryTime: session.expiryTime,

                isActive: session.isActive

            },

            qrData: qrData

        });


    } catch (error) {

        console.log(
            "Create Session Error:",
            error
        );

        res.status(500).json({

            message:
                "Server error while creating attendance session."

        });

    }

});


// =========================================
// GET SESSION BY SESSION ID
// =========================================

router.get("/:sessionId", async (req, res) => {

    try {

        const session =
            await Session.findOne({
                sessionId: req.params.sessionId
            })
            .populate("subject", "name code")
            .populate("teacher", "name email");


        if (!session) {

            return res.status(404).json({

                message:
                    "Attendance session not found."

            });

        }


        // =====================================
        // CHECK EXPIRY
        // =====================================

        const currentTime = new Date();


        if (
            currentTime > session.expiryTime &&
            session.isActive
        ) {

            session.isActive = false;

            await session.save();

        }


        res.status(200).json({

            message:
                "Session details retrieved successfully.",

            session: session

        });


    } catch (error) {

        console.log(
            "Get Session Error:",
            error
        );

        res.status(500).json({

            message:
                "Server error while retrieving session."

        });

    }

});


// =========================================
// STOP ATTENDANCE SESSION
// =========================================

router.put("/:sessionId/stop", async (req, res) => {

    try {

        const session =
            await Session.findOne({
                sessionId: req.params.sessionId
            });


        if (!session) {

            return res.status(404).json({

                message:
                    "Attendance session not found."

            });

        }


        session.isActive = false;

        await session.save();


        res.status(200).json({

            message:
                "Attendance session stopped successfully.",

            session: {

                sessionId: session.sessionId,

                isActive: session.isActive,

                expiryTime: session.expiryTime

            }

        });


    } catch (error) {

        console.log(
            "Stop Session Error:",
            error
        );

        res.status(500).json({

            message:
                "Server error while stopping session."

        });

    }

});


module.exports = router;