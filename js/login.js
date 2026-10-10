async function loginUser() {
    const userType = document.getElementById("userType").value;
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const message = document.getElementById("loginMessage");

    if (!userType || !email || !password) {
        message.textContent = "Please fill all fields.";
        message.style.color = "red";
        return;
    }

    try {
        const response = await fetch(
            "http://localhost:5000/api/auth/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userType: userType,
                    email: email,
                    password: password
                })
            }
        );

        const data = await response.json();

        if (response.ok) {
            message.textContent = "Login successful!";
            message.style.color = "green";

            // Save login information
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            // Open the correct dashboard
            if (userType === "student") {

                window.location.href = "student-dashboard.html";

            } else if (userType === "teacher") {

                window.location.href = "teacher-dashboard.html";

            } else if (userType === "admin") {

                window.location.href = "admin-dashboard.html";

            }

        } else {
            message.textContent = data.message || "Login failed.";
            message.style.color = "red";
        }

    } catch (error) {
        message.textContent =
            "Cannot connect to the backend server.";
        message.style.color = "red";

        console.log("Login Error:", error);
    }
}