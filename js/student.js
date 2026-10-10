async function loadStudentDashboard() {

    const userData = localStorage.getItem("user");

    if (!userData) {
        window.location.href = "login.html";
        return;
    }

    const user = JSON.parse(userData);

    // Make sure this is a student account
    if (user.role !== "student") {
        window.location.href = "login.html";
        return;
    }

    // MongoDB usually gives the ID as _id
    const studentId = user._id || user.id;

    if (!studentId) {
        console.log("Student ID not found.");
        return;
    }

    try {

        // Get student details
        const response = await fetch(
            `http://localhost:5000/api/students/${studentId}`
        );

        const data = await response.json();

        if (!response.ok) {
            console.log(data.message);
            return;
        }

        const student = data.student;

        // Display student information
        document.getElementById("studentName").textContent =
            student.name;

        document.getElementById("studentUSN").textContent =
            student.usn;

        document.getElementById("studentDepartment").textContent =
            student.department;

        document.getElementById("studentSemester").textContent =
            student.semester;

        document.getElementById("studentSection").textContent =
            student.section;


        // =========================================
        // GET ATTENDANCE SUMMARY
        // =========================================

        const summaryResponse = await fetch(
            `http://localhost:5000/api/students/${studentId}/attendance-summary`
        );

        const summaryData =
            await summaryResponse.json();

        if (summaryResponse.ok) {

            document.getElementById("totalClasses").textContent =
                summaryData.summary.totalClasses;

            document.getElementById("classesAttended").textContent =
                summaryData.summary.classesAttended;

            document.getElementById("attendancePercentage").textContent =
                summaryData.summary.attendancePercentage + "%";
        }

    } catch (error) {

        console.log(
            "Dashboard Error:",
            error
        );

    }
}


// =========================================
// LOGOUT
// =========================================

function logoutUser() {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";
}


// =========================================
// LOAD DASHBOARD
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {
        loadStudentDashboard();
    }
);