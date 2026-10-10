// =========================================
// TEACHER ROUTES
// Handles teacher profile and teacher data
// =========================================

const express = require("express");

const Teacher = require("../models/Teacher");
const Subject = require("../models/Subject");
const Session = require("../models/Session");
const Student = require("../models/Student");

const router = express.Router();


// =========================================
// GET TEACHER PROFILE
// =========================================

router.get("/:teacherId", async (req, res) => {

    try {

        const teacher =
            await Teacher.findById(req.params.teacherId)
                .select("-password");

        if (!teacher) {

            return res.status(404).json({
                message: "Teacher not found."
            });

        }

        res.status(200).json({

            message: "Teacher profile retrieved successfully.",

            teacher: teacher

        });

    } catch (error) {

        console.log("Teacher Profile Error:", error);

        res.status(500).json({
            message: "Server error while retrieving teacher profile."
        });

    }

});


// =========================================
// GET TEACHER SUBJECTS
// =========================================

router.get("/:teacherId/subjects", async (req, res) => {

    try {

        const teacher =
            await Teacher.findById(req.params.teacherId);

        if (!teacher) {

            return res.status(404).json({
                message: "Teacher not found."
            });

        }


        const subjects =
            await Subject.find({
                teacher: req.params.teacherId
            });


        res.status(200).json({

            message: "Subjects retrieved successfully.",

            subjects: subjects

        });

    } catch (error) {

        console.log("Teacher Subjects Error:", error);

        res.status(500).json({
            message: "Server error while retrieving subjects."
        });

    }

});


// =========================================
// GET TEACHER SESSIONS
// =========================================

router.get("/:teacherId/sessions", async (req, res) => {

    try {

        const teacher =
            await Teacher.findById(req.params.teacherId);

        if (!teacher) {

            return res.status(404).json({
                message: "Teacher not found."
            });

        }


        const sessions =
            await Session.find({
                teacher: req.params.teacherId
            })
            .populate("subject", "name code")
            .sort({ startTime: -1 });


        res.status(200).json({

            message: "Attendance sessions retrieved successfully.",

            sessions: sessions

        });

    } catch (error) {

        console.log("Teacher Sessions Error:", error);

        res.status(500).json({
            message:
                "Server error while retrieving attendance sessions."
        });

    }

});


// =========================================
// GET TEACHER DASHBOARD SUMMARY
// =========================================

router.get("/:teacherId/summary", async (req, res) => {

    try {

        const teacher =
            await Teacher.findById(req.params.teacherId);

        if (!teacher) {

            return res.status(404).json({
                message: "Teacher not found."
            });

        }


        const totalSubjects =
            await Subject.countDocuments({
                teacher: req.params.teacherId
            });


        const totalSessions =
            await Session.countDocuments({
                teacher: req.params.teacherId
            });

            const totalStudents =
            await Student.countDocuments();


        res.status(200).json({

            message: "Teacher summary retrieved successfully.",

    summary: {

    totalStudents: totalStudents,

    totalSubjects: totalSubjects,

    totalSessions: totalSessions

}

        });

    } catch (error) {

        console.log("Teacher Summary Error:", error);

        res.status(500).json({
            message:
                "Server error while retrieving teacher summary."
        });

    }

});

// =========================================
// CREATE SUBJECT
// =========================================

router.post("/:teacherId/subjects/create", async (req, res) => {

    try {

        const {
            name,
            code,
            department,
            semester,
            section
        } = req.body;

        if (
            !name ||
            !code ||
            !department ||
            !semester ||
            !section
        ) {
            return res.status(400).json({
                message: "Please provide all subject details."
            });
        }

        const teacher =
            await Teacher.findById(req.params.teacherId);

        if (!teacher) {
            return res.status(404).json({
                message: "Teacher not found."
            });
        }

        const existingSubject =
            await Subject.findOne({ code: code });

        if (existingSubject) {
            return res.status(400).json({
                message: "Subject with this code already exists."
            });
        }

        const subject = new Subject({

            name: name,

            code: code,

            department: department,

            semester: Number(semester),

            section: section,

            teacher: req.params.teacherId

        });

        await subject.save();

        res.status(201).json({

            message: "Subject created successfully.",

            subject: subject

        });

    } catch (error) {

        console.log("Create Subject Error:", error);

        res.status(500).json({
            message: "Server error while creating subject."
        });

    }

});

module.exports = router;