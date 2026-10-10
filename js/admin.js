document.addEventListener("DOMContentLoaded", function () {

    const userData = localStorage.getItem("user");

    if (!userData) {
        window.location.href = "login.html";
        return;
    }

    const admin = JSON.parse(userData);

    // Make sure only admin can open this page
    if (admin.role !== "admin") {
        window.location.href = "login.html";
        return;
    }

    // Show admin details
    document.getElementById("adminName").textContent =
        admin.name || "Admin";

    document.getElementById("adminNameInfo").textContent =
        admin.name || "Admin";

    document.getElementById("adminEmail").textContent =
        admin.email || "-";

    document.getElementById("adminRole").textContent =
        "Administrator";
});


function logoutAdmin() {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";
}