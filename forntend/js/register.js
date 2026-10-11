async function registerUser() {
    const userType = document.getElementById("userType").value;
    const name = document.getElementById("name").value.trim();
    const usn = document.getElementById("usn").value.trim();
    const email = document.getElementById("email").value.trim();
    const department = document.getElementById("department").value.trim();
    const semester = document.getElementById("semester").value;
    const section = document.getElementById("section").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const message = document.getElementById("registerMessage");

    if (
        !userType ||
        !name ||
        !email ||
        !department ||
        !semester ||
        !section ||
        !password ||
        !confirmPassword
    ) {
        message.textContent = "Please fill all required fields.";
        message.style.color = "red";
        return;
    }

    if (userType === "student" && !usn) {
        message.textContent = "Please enter your USN.";
        message.style.color = "red";
        return;
    }

    if (password !== confirmPassword) {
        message.textContent = "Passwords do not match.";
        message.style.color = "red";
        return;
    }

    const userData = {
        userType: userType,
        name: name,
        email: email,
        department: department,
        semester: Number(semester),
        section: section,
        password: password
    };

    if (userType === "student") {
        userData.usn = usn;
    }

    try {
        const response = await fetch(
            "http://qr-based-attendance-system-1-qi8b.onrender.com/api/auth/register",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)
            }
        );

        const data = await response.json();

        if (response.ok) {
            message.textContent = "Registration successful!";
            message.style.color = "green";

            console.log("Registration response:", data);
        } else {
            message.textContent = data.message || "Registration failed.";
            message.style.color = "red";
        }
    } catch (error) {
        message.textContent =
            "Cannot connect to the backend server.";
        message.style.color = "red";

        console.log("Error:", error);
    }
}