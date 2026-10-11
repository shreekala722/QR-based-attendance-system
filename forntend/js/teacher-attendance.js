async function loadTeacherSessions() {
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

    const sessionSelect = document.getElementById("sessionSelect");

    try {
        console.log("Teacher ID:", teacherId);
        console.log("Loading teacher sessions...");

        const response = await fetch(
            `http://qr-based-attendance-system-1-qi8b.onrender.com/api/teachers/${teacherId}/sessions`
        );

        console.log("Response status:", response.status);

        const data = await response.json();

        console.log("Session API response:", data);

        if (!response.ok) {
            sessionSelect.innerHTML = "";
            
            const option = document.createElement("option");
            option.value = "";
            option.textContent = data.message || "Unable to load sessions.";
            
            sessionSelect.appendChild(option);
            return;
        }

        const sessions = data.sessions || [];

        sessionSelect.innerHTML = "";

        if (sessions.length === 0) {
            const option = document.createElement("option");
            option.value = "";
            option.textContent = "No attendance sessions found";
            sessionSelect.appendChild(option);
            return;
        }

        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Select Attendance Session";
        sessionSelect.appendChild(defaultOption);

        sessions.forEach(function (session) {

            const option = document.createElement("option");

            option.value = session.sessionId;

            const subjectName =
                session.subject && session.subject.name
                    ? session.subject.name
                    : "Unknown Subject";

            const date = session.startTime
                ? new Date(session.startTime).toLocaleString()
                : "Unknown Date";

            option.textContent =
                `${subjectName} - ${date}`;

            sessionSelect.appendChild(option);
        });

        console.log("Sessions displayed successfully.");

    } catch (error) {

        console.log("Load Teacher Sessions Error:", error);

        sessionSelect.innerHTML = "";

        const option = document.createElement("option");
        option.value = "";
        option.textContent = "Unable to load sessions";

        sessionSelect.appendChild(option);
    }
}


async function loadSessionAttendance() {

    const sessionSelect =
        document.getElementById("sessionSelect");

    const sessionId = sessionSelect.value;

    const tableBody =
        document.getElementById("teacherAttendanceTableBody");

    if (!sessionId) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    Please select an attendance session.
                </td>
            </tr>
        `;

        return;
    }

    try {

        tableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    Loading attendance...
                </td>
            </tr>
        `;

        const sessionResponse = await fetch(
            `http://qr-based-attendance-system-1-qi8b.onrender.com/api/sessions/${sessionId}`
        );

        const sessionData =
            await sessionResponse.json();

        if (!sessionResponse.ok) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        ${sessionData.message}
                    </td>
                </tr>
            `;

            return;
        }

        const session = sessionData.session;

        document.getElementById("sessionInfo").style.display = "block";

        document.getElementById("sessionSubject").textContent =
            session.subject
                ? session.subject.name
                : "N/A";

        document.getElementById("sessionId").textContent =
            session.sessionId || sessionId;

        document.getElementById("sessionSemester").textContent =
            session.semester;

        document.getElementById("sessionSection").textContent =
            session.section;


        const attendanceResponse = await fetch(
            `http://qr-based-attendance-system-1-qi8b.onrender.com/api/attendance/session/${sessionId}`
        );

        const attendanceData =
            await attendanceResponse.json();

        if (!attendanceResponse.ok) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        ${attendanceData.message}
                    </td>
                </tr>
            `;

            return;
        }

        const attendance =
            attendanceData.attendance || [];

        if (attendance.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        No students have marked attendance for this session.
                    </td>
                </tr>
            `;

            return;
        }

        tableBody.innerHTML = "";

        attendance.forEach(function (record, index) {

            const row = document.createElement("tr");

            const studentName =
                record.student && record.student.name
                    ? record.student.name
                    : "N/A";

            const studentUSN =
                record.student && record.student.usn
                    ? record.student.usn
                    : "N/A";

            const status =
                record.status || "Present";

            const markedAt =
                record.markedAt
                    ? new Date(record.markedAt).toLocaleString()
                    : "N/A";

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${studentName}</td>
                <td>${studentUSN}</td>
                <td>${status}</td>
                <td>${markedAt}</td>
            `;

            tableBody.appendChild(row);
        });

    } catch (error) {

        console.log("Teacher Attendance Error:", error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    Unable to load attendance records.
                </td>
            </tr>
        `;
    }
}


function logoutUser() {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";
}


document.addEventListener("DOMContentLoaded", function () {

    console.log("Teacher Attendance page loaded.");

    loadTeacherSessions();

});