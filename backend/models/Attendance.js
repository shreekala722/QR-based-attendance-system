const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true
        },

        session: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Session",
            required: true
        },

        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            required: true
        },

        date: {
            type: Date,
            default: Date.now
        },

        status: {
            type: String,
            enum: ["Present", "Absent"],
            default: "Present"
        },

        markedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);


// Prevent the same student from marking
// attendance twice for the same session

attendanceSchema.index(
    {
        student: 1,
        session: 1
    },
    {
        unique: true
    }
);


const Attendance =
    mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance;