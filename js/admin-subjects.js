// =========================================
// ADMIN SUBJECT MANAGEMENT
// =========================================

document.addEventListener("DOMContentLoaded", function () {

    checkAdmin();

    loadTeachers();

    loadSubjects();

});


// =========================================
// CHECK ADMIN LOGIN
// =========================================

function checkAdmin() {

    const userData = localStorage.getItem("user");

    if (!userData) {

        window.location.href = "login.html";

        return;
    }

    const admin = JSON.parse(userData);

    if (admin.role !== "admin") {

        window.location.href = "login.html";

        return;
    }

}


// =========================================
// LOAD TEACHERS
// =========================================

async function loadTeachers() {

    const teacherSelect =
        document.getElementById("teacherSelect");

    try {

        const response = await fetch(
    "http://localhost:5000/api/admin/teachers",
    {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    }
);

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.message || "Failed to load teachers."
            );

        }


        teacherSelect.innerHTML =
            '<option value="">Select Teacher</option>';


        data.teachers.forEach(function (teacher) {

            const option =
                document.createElement("option");

            option.value = teacher._id;

            option.textContent =
                `${teacher.name} - ${teacher.department}`;

            teacherSelect.appendChild(option);

        });

    } catch (error) {

        console.log("Load Teachers Error:", error);

        teacherSelect.innerHTML =
            '<option value="">Unable to load teachers</option>';

    }

}


// =========================================
// LOAD SUBJECTS
// =========================================

async function loadSubjects() {

    const subjectSelect =
        document.getElementById("subjectSelect");

    const tableBody =
        document.getElementById("subjectsTableBody");

    try {

        const response = await fetch(
    "http://localhost:5000/api/admin/subjects",
    {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    }
);

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.message || "Failed to load subjects."
            );

        }


        // Clear subject dropdown

        subjectSelect.innerHTML =
            '<option value="">Select Subject</option>';


        // Clear table

        tableBody.innerHTML = "";


        data.subjects.forEach(function (subject) {

            // -----------------------------
            // Subject dropdown
            // -----------------------------

            const option =
                document.createElement("option");

            option.value = subject._id;

            option.textContent =
                `${subject.name} (${subject.code})`;

            subjectSelect.appendChild(option);


            // -----------------------------
            // Table row
            // -----------------------------

            const row =
                document.createElement("tr");


            const teacherName =
                subject.teacher
                    ? subject.teacher.name
                    : "Not Assigned";


            row.innerHTML = `

                <td>${subject.name}</td>

                <td>${subject.code}</td>

                <td>${subject.department}</td>

                <td>${subject.semester}</td>

                <td>${subject.section}</td>

                <td>${teacherName}</td>

<td>
    <button
        type="button"
        class="btn"
        onclick="deleteSubject('${subject._id}', '${subject.name}')"
    >
        Delete
    </button>
</td>

            `;


            tableBody.appendChild(row);

        });


        if (data.subjects.length === 0) {

            tableBody.innerHTML = `

                <tr>

                    <td colspan="6">
                        No subjects found.
                    </td>

                </tr>

            `;

        }

    } catch (error) {

        console.log("Load Subjects Error:", error);

        subjectSelect.innerHTML =
            '<option value="">Unable to load subjects</option>';

        tableBody.innerHTML = `

            <tr>

                <td colspan="6">
                    Unable to load subjects.
                </td>

            </tr>

        `;

    }

}


// =========================================
// ASSIGN TEACHER
// =========================================

async function assignTeacher() {

    const subjectId =
        document.getElementById("subjectSelect").value;

    const teacherId =
        document.getElementById("teacherSelect").value;

    const message =
        document.getElementById("assignMessage");


    if (!subjectId || !teacherId) {

        message.textContent =
            "Please select both subject and teacher.";

        message.style.color = "red";

        return;
    }


    try {

        const response = await fetch(

            `http://localhost:5000/api/admin/subjects/${subjectId}/assign-teacher`,

            {

                method: "PUT",

                headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token")}`
},

                body: JSON.stringify({

                    teacherId: teacherId

                })

            }

        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message || "Failed to assign teacher."
            );

        }


        message.textContent =
            "Teacher assigned successfully.";

        message.style.color = "green";


        // Reload subjects so the table shows the new teacher

        await loadSubjects();


        // Keep the selected subject

        document.getElementById("subjectSelect").value =
            subjectId;


    } catch (error) {

        console.log("Assign Teacher Error:", error);

        message.textContent =
            error.message;

        message.style.color = "red";

    }

}

// =========================================
// DELETE SUBJECT
// =========================================

async function deleteSubject(subjectId, subjectName) {

    const confirmDelete = confirm(
        `Are you sure you want to delete "${subjectName}"?`
    );

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(
            `http://localhost:5000/api/admin/subjects/${subjectId}`,
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.message || "Failed to delete subject."
            );

        }

        alert("Subject deleted successfully.");

        // Reload the subject list
        loadSubjects();

    } catch (error) {

        console.log("Delete Subject Error:", error);

        alert(error.message);

    }
}


// =========================================
// ADMIN LOGOUT
// =========================================

function logoutAdmin() {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    window.location.href = "login.html";

}