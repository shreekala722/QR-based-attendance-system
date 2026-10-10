// =========================================
// TEACHER.JS
// Handles teacher dashboard, subjects,
// QR generation and session timer
// =========================================


// =========================================
// GLOBAL VARIABLES
// =========================================

let teacherData = {};
let teacherSummary = {};

let qrTimerInterval = null;
let currentSessionId = null;


// =========================================
// LOAD TEACHER DASHBOARD
// =========================================

async function loadTeacherDashboard() {

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const teacherId = user.id || user._id;

    if (!teacherId) {
        console.log("Teacher ID not found.");
        return;
    }

    try {

        // Get teacher profile
        const profileResponse = await fetch(
            `http://localhost:5000/api/teachers/${teacherId}`
        );

        const profileData = await profileResponse.json();

        if (!profileResponse.ok) {
            console.log(profileData.message);
            return;
        }

        const teacher = profileData.teacher;

        teacherData = teacher;


        // Display teacher information

        const nameElement =
            document.getElementById("teacherName");

        const emailElement =
            document.getElementById("teacherEmail");

        const departmentElement =
            document.getElementById("teacherDepartment");


        if (nameElement) {
            nameElement.textContent =
                teacher.name;
        }

        if (emailElement) {
            emailElement.textContent =
                teacher.email;
        }

        if (departmentElement) {
            departmentElement.textContent =
                teacher.department;
        }


        // Get teacher summary

        const summaryResponse = await fetch(
            `http://localhost:5000/api/teachers/${teacherId}/summary`
        );

        const summaryData =
            await summaryResponse.json();

        if (!summaryResponse.ok) {
            console.log(summaryData.message);
            return;
        }

        teacherSummary =
            summaryData.summary;


        // Display summary

        const studentsElement =
            document.getElementById("totalStudents");

        const subjectsElement =
            document.getElementById("totalSubjects");

        const sessionsElement =
            document.getElementById("totalSessions");


        if (studentsElement) {
            studentsElement.textContent =
                teacherSummary.totalStudents;
        }

        if (subjectsElement) {
            subjectsElement.textContent =
                teacherSummary.totalSubjects;
        }

        if (sessionsElement) {
            sessionsElement.textContent =
                teacherSummary.totalSessions;
        }


        console.log(
            "Teacher dashboard loaded:",
            teacherData
        );

        console.log(
            "Teacher summary:",
            teacherSummary
        );

    } catch (error) {

        console.log(
            "Teacher Dashboard Error:",
            error
        );

    }
}


// =========================================
// LOAD TEACHER SUBJECTS
// =========================================

async function loadTeacherSubjects() {

    const user =
        JSON.parse(localStorage.getItem("user"));

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const teacherId =
        user.id || user._id;

    if (!teacherId) {
        console.log("Teacher ID not found.");
        return;
    }

    try {

        const response = await fetch(
            `http://localhost:5000/api/teachers/${teacherId}/subjects`
        );

        const data =
            await response.json();


        if (!response.ok) {

            console.log(data.message);

            return;
        }


        const subjectDropdown =
            document.getElementById("subject");


        if (!subjectDropdown) {
            return;
        }


        // Clear existing options

        subjectDropdown.innerHTML = "";


        // If no subjects exist

        if (
            !data.subjects ||
            data.subjects.length === 0
        ) {

            const option =
                document.createElement("option");

            option.value = "";

            option.textContent =
                "No subjects found";

            subjectDropdown.appendChild(
                option
            );

            return;
        }


        // Default option

        const defaultOption =
            document.createElement("option");

        defaultOption.value = "";

        defaultOption.textContent =
            "Select Subject";

        subjectDropdown.appendChild(
            defaultOption
        );


        // Add subjects from MongoDB

        data.subjects.forEach(
            function (subject) {

                const option =
                    document.createElement("option");

                option.value =
                    subject._id;

                option.textContent =
                    `${subject.name} (${subject.code})`;

                subjectDropdown.appendChild(
                    option
                );

            }
        );


        console.log(
            "Subjects loaded:",
            data.subjects
        );

    } catch (error) {

        console.log(
            "Load Subjects Error:",
            error
        );

    }
}


// =========================================
// GENERATE QR CODE
// =========================================

async function generateQR() {

    const user =
        JSON.parse(localStorage.getItem("user"));


    if (!user) {

        window.location.href =
            "login.html";

        return;
    }


    const teacherId =
        user.id || user._id;


    // Get form values

    const subjectId =
        document.getElementById("subject").value;

    const semester =
        document.getElementById("semester").value;

    const section =
        document.getElementById("section").value;

    const duration =
        document.getElementById("duration").value;


    // Get page elements

    const message =
        document.getElementById("qrMessage");

    const qrDisplay =
        document.getElementById("qrDisplay");

    const qrCode =
        document.getElementById("qrcode");

    const sessionInfo =
        document.getElementById("sessionInfo");


    // =========================================
    // VALIDATION
    // =========================================

    if (subjectId === "") {

        message.textContent =
            "Please select a subject.";

        message.style.color =
            "red";

        return;
    }


    if (semester === "") {

        message.textContent =
            "Please select a semester.";

        message.style.color =
            "red";

        return;
    }


    if (section === "") {

        message.textContent =
            "Please select a section.";

        message.style.color =
            "red";

        return;
    }


    if (duration === "") {

        message.textContent =
            "Please select session duration.";

        message.style.color =
            "red";

        return;
    }


    // =========================================
    // CREATE SESSION
    // =========================================

    try {

        message.textContent =
            "Creating attendance session...";

        message.style.color =
            "black";


        const response = await fetch(
            "http://localhost:5000/api/sessions/create",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    teacherId:
                        teacherId,

                    subjectId:
                        subjectId,

                    semester:
                        Number(semester),

                    section:
                        section,

                    duration:
                        Number(duration)

                })
            }
        );


        const data =
            await response.json();


        // =========================================
        // CHECK RESPONSE
        // =========================================

        if (!response.ok) {

            message.textContent =
                data.message ||
                "Unable to create session.";

            message.style.color =
                "red";

            return;
        }


        console.log(
            "Session created:",
            data
        );


        // Save session ID

        currentSessionId =
            data.session.sessionId;


        // =========================================
        // CREATE QR DATA
        // =========================================

        const qrData =
            JSON.stringify(
                data.qrData
            );


        // Clear previous QR

        qrCode.innerHTML = "";


        // Check QR library

        if (
            typeof QRCode ===
            "undefined"
        ) {

            message.textContent =
                "QR Code library is not loaded.";

            message.style.color =
                "red";

            return;
        }


        // =========================================
        // GENERATE QR
        // =========================================

        new QRCode(
            qrCode,
            {
                text:
                    qrData,

                width:
                    220,

                height:
                    220
            }
        );


        // =========================================
        // SHOW SESSION INFORMATION
        // =========================================

        sessionInfo.innerHTML = `

            <strong>Subject:</strong>
            ${data.session.subject}

            <br>

            <strong>Semester:</strong>
            ${data.session.semester}

            <br>

            <strong>Section:</strong>
            ${data.session.section}

            <br>

            <strong>Session ID:</strong>
            ${data.session.sessionId}

        `;


        // Show QR section

        qrDisplay.style.display =
            "block";


        // Success message

        message.textContent =
            "Attendance session created successfully.";

        message.style.color =
            "green";


        // Start timer

        startTimer(
            Number(duration) * 60
        );


    } catch (error) {

        console.log(
            "Generate QR Error:",
            error
        );


        message.textContent =
            "Unable to connect to the server.";

        message.style.color =
            "red";

    }
}


// =========================================
// START QR TIMER
// =========================================

function startTimer(totalSeconds) {

    clearInterval(
        qrTimerInterval
    );


    let remainingSeconds =
        totalSeconds;


    updateTimerDisplay(
        remainingSeconds
    );


    qrTimerInterval =
        setInterval(
            function () {

                remainingSeconds--;


                updateTimerDisplay(
                    remainingSeconds
                );


                if (
                    remainingSeconds <= 0
                ) {

                    clearInterval(
                        qrTimerInterval
                    );


                    const message =
                        document.getElementById(
                            "qrMessage"
                        );


                    if (message) {

                        message.textContent =
                            "Attendance session expired.";

                        message.style.color =
                            "red";

                    }


                    currentSessionId =
                        null;

                }

            },
            1000
        );
}


// =========================================
// UPDATE TIMER DISPLAY
// =========================================

function updateTimerDisplay(
    totalSeconds
) {

    const timer =
        document.getElementById("timer");


    if (!timer) {
        return;
    }


    if (totalSeconds < 0) {
        totalSeconds = 0;
    }


    const minutes =
        Math.floor(
            totalSeconds / 60
        );


    const seconds =
        totalSeconds % 60;


    timer.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}


// =========================================
// STOP SESSION
// =========================================

async function stopSession() {

    clearInterval(
        qrTimerInterval
    );


    if (!currentSessionId) {

        console.log(
            "No active session."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `http://localhost:5000/api/sessions/${currentSessionId}/stop`,
                {
                    method: "PUT"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            console.log(
                data.message
            );

            return;
        }


        console.log(
            "Session stopped:",
            data
        );


        const message =
            document.getElementById(
                "qrMessage"
            );


        if (message) {

            message.textContent =
                "Attendance session stopped.";

            message.style.color =
                "red";

        }


        currentSessionId =
            null;


    } catch (error) {

        console.log(
            "Stop Session Error:",
            error
        );

    }
}


// =========================================
// LOGOUT
// =========================================

function logoutUser() {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "user"
    );

    window.location.href =
        "login.html";
}


// =========================================
// PAGE LOAD
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {


        // Teacher dashboard

        if (
            document.getElementById(
                "teacherName"
            )
        ) {

            loadTeacherDashboard();

        }


        // Generate QR page

        if (
            document.getElementById(
                "subject"
            )
        ) {

            loadTeacherSubjects();

        }

    }
);