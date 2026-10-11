// =========================================
// ADMIN ROUTES
// Handles admin subject and teacher management
// =========================================

const express = require("express");

const Teacher = require("../models/Teacher");
const Subject = require("../models/Subject");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
router.use(authMiddleware);


// =========================================
// GET ALL TEACHERS
// =========================================

router.get("/teachers", async (req, res) => {

    try {

        const teachers = await Teacher.find()
            .select("-password")
            .sort({ name: 1 });

        res.status(200).json({

            message: "Teachers retrieved successfully.",

            teachers: teachers

        });

    } catch (error) {

        console.log("Admin Teachers Error:", error);

        res.status(500).json({
            message: "Server error while retrieving teachers."
        });

    }

});


// =========================================
// GET ALL SUBJECTS
// =========================================

router.get("/subjects", async (req, res) => {

    try {

        const subjects = await Subject.find()
            .populate("teacher", "name email department")
            .sort({ name: 1 });

        res.status(200).json({

            message: "Subjects retrieved successfully.",

            subjects: subjects

        });

    } catch (error) {

        console.log("Admin Subjects Error:", error);

        res.status(500).json({
            message: "Server error while retrieving subjects."
        });

    }

});


// =========================================
// ASSIGN / CHANGE SUBJECT TEACHER
// =========================================

router.put("/subjects/:subjectId/assign-teacher", async (req, res) => {

    try {

        const {
            teacherId
        } = req.body;


        if (!teacherId) {

            return res.status(400).json({
                message: "Teacher ID is required."
            });

        }


        // Check teacher
        const teacher =
            await Teacher.findById(teacherId);

        if (!teacher) {

            return res.status(404).json({
                message: "Teacher not found."
            });

        }


        // Find subject
        const subject =
            await Subject.findById(req.params.subjectId);

        if (!subject) {

            return res.status(404).json({
                message: "Subject not found."
            });

        }


        // Change teacher
        subject.teacher = teacherId;

        await subject.save();


        // Get updated subject with teacher information
        const updatedSubject =
            await Subject.findById(req.params.subjectId)
                .populate(
                    "teacher",
                    "name email department"
                );


        res.status(200).json({

            message: "Teacher assigned successfully.",

            subject: updatedSubject

        });

    } catch (error) {

        console.log("Assign Teacher Error:", error);

        res.status(500).json({
            message: "Server error while assigning teacher."
        });

    }

});


// =========================================
// DELETE SUBJECT
// =========================================

router.delete("/subjects/:subjectId", async (req, res) => {

    try {

        const subject =
            await Subject.findById(req.params.subjectId);

        if (!subject) {

            return res.status(404).json({
                message: "Subject not found."
            });

        }


        // Delete the subject
        await Subject.findByIdAndDelete(
            req.params.subjectId
        );


        res.status(200).json({

            message: "Subject deleted successfully."

        });

    } catch (error) {

        console.log("Delete Subject Error:", error);

        res.status(500).json({

            message:
                "Server error while deleting subject."

        });

    }

});

module.exports = router;