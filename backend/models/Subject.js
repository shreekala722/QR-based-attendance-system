const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true
        },

        department: {
            type: String,
            required: true,
            trim: true
        },

        semester: {
            type: Number,
            required: true,
            min: 1,
            max: 8
        },

        section: {
            type: String,
            required: true,
            uppercase: true,
            trim: true
        },

        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Subject = mongoose.model("Subject", subjectSchema);

module.exports = Subject;