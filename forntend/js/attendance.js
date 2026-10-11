// =========================================
// ATTENDANCE.JS
// Loads student's real attendance records
// =========================================

let attendanceRecords = [];


// LOAD ATTENDANCE PAGE
async function loadAttendancePage() {

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const studentId = user.id || user._id;

    if (!studentId) {
        console.log("Student ID not found.");
        return;
    }

    try {

        // =========================================
        // GET STUDENT INFORMATION
        // =========================================

        const studentResponse = await fetch(
            `https://qr-based-attendance-system-1-qi8b.onrender.com/api/students/${studentId}`
        );

        const studentData = await studentResponse.json();

        if (!studentResponse.ok) {
            console.log(studentData.message);
            return;
        }

        const student = studentData.student;


        document.getElementById("attendanceStudentName").textContent =
            student.name;

        document.getElementById("attendanceStudentUSN").textContent =
            student.usn;

        document.getElementById("attendanceStudentDepartment").textContent =
            student.department;

        document.getElementById("attendanceStudentSemester").textContent =
            student.semester;


        // =========================================
        // GET ATTENDANCE SUMMARY
        // =========================================

        const summaryResponse = await fetch(
            `https://qr-based-attendance-system-1-qi8b.onrender.com/api/students/${studentId}/attendance-summary`
        );

        const summaryData = await summaryResponse.json();

        if (summaryResponse.ok) {

            const summary = summaryData.summary;

            document.getElementById("totalClasses").textContent =
                summary.totalClasses;

            document.getElementById("classesAttended").textContent =
                summary.classesAttended;

            document.getElementById("classesAbsent").textContent =
                summary.classesAbsent;

            document.getElementById("attendancePercentage").textContent =
                summary.attendancePercentage + "%";

            document.getElementById("percentageDisplay").textContent =
                summary.attendancePercentage + "%";
        }


        // =========================================
        // GET ATTENDANCE RECORDS
        // =========================================

        const attendanceResponse = await fetch(
            `https://qr-based-attendance-system-1-qi8b.onrender.com/api/students/${studentId}/attendance`
        );

        const attendanceData = await attendanceResponse.json();

        if (!attendanceResponse.ok) {
            console.log(attendanceData.message);
            return;
        }


        attendanceRecords = attendanceData.attendance || [];

        displayAttendance(attendanceRecords);

    } catch (error) {

        console.log(
            "Attendance Page Error:",
            error
        );

        const tableBody =
            document.getElementById("attendanceTableBody");

        if (tableBody) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        Unable to load attendance records.
                    </td>
                </tr>
            `;
        }
    }
}


// =========================================
// DISPLAY ATTENDANCE RECORDS
// =========================================

function displayAttendance(records) {

    const tableBody =
        document.getElementById("attendanceTableBody");

    if (!tableBody) {
        return;
    }


    // No records
    if (!records || records.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    No attendance records available.
                </td>
            </tr>
        `;

        return;
    }


    tableBody.innerHTML = "";


    records.forEach(function (record, index) {

        const row =
            document.createElement("tr");


        // Date
        let dateText = "N/A";

        if (record.date) {

            dateText =
                new Date(record.date)
                    .toLocaleDateString();
        }


        // Subject
        let subjectName = "N/A";

        if (record.subject) {

            if (typeof record.subject === "object") {
                subjectName =
                    record.subject.name || "N/A";
            } else {
                subjectName =
                    record.subject;
            }
        }


        // Session
        let sessionText = "N/A";

        if (record.session) {

            if (typeof record.session === "object") {

                sessionText =
                    record.session.sessionId || "N/A";

            } else {

                sessionText =
                    record.session;
            }
        }


        // Status
        const status =
            record.status || "Present";


        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${dateText}</td>
            <td>${subjectName}</td>
            <td>${sessionText}</td>
            <td>${status}</td>
        `;


        tableBody.appendChild(row);

    });
}


// =========================================
// LOGOUT
// =========================================

function logoutUser() {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    window.location.href =
        "login.html";
}


// =========================================
// PAGE LOAD
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadAttendancePage();

    }
);