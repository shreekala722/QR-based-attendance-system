async function loadSubjects() {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const teacherId = user.id || user._id;

    console.log("Logged-in user:", user);
    console.log("Teacher ID:", teacherId);

    if (!teacherId) {
        console.log("Teacher ID not found.");
        return;
    }

    try {
        const response = await fetch(
            `http://localhost:5000/api/teachers/${teacherId}/subjects`
        );

        const data = await response.json();

        console.log("Subjects response:", data);

        const tableBody =
            document.getElementById("subjectTableBody");

        if (!response.ok) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6">
                        ${data.message}
                    </td>
                </tr>
            `;
            return;
        }

        const subjects = data.subjects || [];

        if (subjects.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6">
                        No subjects found.
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = "";

        subjects.forEach(function (subject, index) {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${subject.name}</td>
                <td>${subject.code}</td>
                <td>${subject.department}</td>
                <td>${subject.semester}</td>
                <td>${subject.section}</td>
            `;

            tableBody.appendChild(row);
        });

    } catch (error) {
        console.log("Load Subjects Error:", error);
    }
}


async function createSubject(event) {

    event.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const teacherId = user.id || user._id;

    console.log("Creating subject for teacher:", teacherId);

    if (!teacherId) {
        alert("Teacher ID not found. Please login again.");
        return;
    }

    const name =
        document.getElementById("subjectName").value.trim();

    const code =
        document.getElementById("subjectCode").value.trim();

    const department =
        document.getElementById("subjectDepartment").value.trim();

    const semester =
        document.getElementById("subjectSemester").value;

    const section =
        document.getElementById("subjectSection").value.trim();

    const message =
        document.getElementById("subjectMessage");

    try {

        const response = await fetch(
            `http://qr-based-attendance-system-1-qi8b.onrender.com/api/teachers/${teacherId}/subjects/create`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    code: code,
                    department: department,
                    semester: Number(semester),
                    section: section
                })
            }
        );

        const data = await response.json();

        console.log("Create subject response:", data);

        if (!response.ok) {
            message.textContent = data.message || "Unable to create subject.";
            message.style.color = "red";
            return;
        }

        message.textContent = "Subject created successfully!";
        message.style.color = "green";

        document.getElementById("subjectForm").reset();

        loadSubjects();

    } catch (error) {

        console.log("Create Subject Error:", error);

        message.textContent =
            "Unable to connect to the server.";

        message.style.color = "red";
    }
}


function logoutUser() {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";
}


document.addEventListener("DOMContentLoaded", function () {

    console.log("Manage Subjects page loaded.");

    loadSubjects();

});