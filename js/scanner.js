// =========================================
// SCANNER.JS
// Scans QR and marks student attendance
// =========================================

let qrScanner = null;
let scanCompleted = false;

// START QR SCANNER
function startScanner() {

    const reader = document.getElementById("reader");
    const message = document.getElementById("scanMessage");

    if (!reader) {
        return;
    }

    if (typeof Html5Qrcode === "undefined") {

        if (message) {
            message.textContent =
                "QR Scanner library is not loaded.";
            message.style.color = "red";
        }

        return;
    }

    qrScanner = new Html5Qrcode("reader");

    const config = {
        fps: 10,
        qrbox: {
            width: 250,
            height: 250
        }
    };

    qrScanner.start(
        { facingMode: "environment" },
        config,

        function (decodedText) {
            handleQRCode(decodedText);
        },

        function (errorMessage) {
            // Scanner is continuously searching.
        }
    )
    .catch(function (error) {

        if (message) {
            message.textContent =
                "Unable to access the camera. Please allow camera permission.";
            message.style.color = "red";
        }

        console.log("Camera Error:", error);
    });
}


// HANDLE SCANNED QR CODE
async function handleQRCode(decodedText) {

    if (scanCompleted) {
        return;
    }

    scanCompleted = true;

    const message =
        document.getElementById("scanMessage");

    try {

        // Convert QR text into JavaScript object
        const qrData = JSON.parse(decodedText);

        const sessionId = qrData.sessionId;
        const subject = qrData.subject;
        const semester = qrData.semester;
        const section = qrData.section;

        // Check QR data
        if (
            !sessionId ||
            !subject ||
            !semester ||
            !section
        ) {

            message.textContent =
                "Invalid attendance QR code.";

            message.style.color = "red";

            scanCompleted = false;

            return;
        }


        // Get logged-in student
        const user =
            JSON.parse(localStorage.getItem("user"));

        if (!user) {

            message.textContent =
                "Please login as a student first.";

            message.style.color = "red";

            scanCompleted = false;

            return;
        }


        const studentId =
            user.id || user._id;

        if (!studentId) {

            message.textContent =
                "Student ID not found.";

            message.style.color = "red";

            scanCompleted = false;

            return;
        }


        // Show scanning information
        message.innerHTML = `
            <strong>QR Code Scanned!</strong><br><br>
            Subject: ${subject}<br>
            Semester: ${semester}<br>
            Section: ${section}<br><br>
            Marking attendance...
        `;

        message.style.color = "blue";


        // Send attendance request to backend
        const response = await fetch(
            "http://localhost:5000/api/attendance/mark",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    studentId: studentId,
                    sessionId: sessionId
                })
            }
        );


        const data = await response.json();


        // Backend error
        if (!response.ok) {

            message.innerHTML = `
                <strong>Attendance not marked.</strong><br><br>
                ${data.message || "Something went wrong."}
            `;

            message.style.color = "red";

            scanCompleted = false;

            return;
        }


        // Attendance successfully marked
        message.innerHTML = `
            <strong>✓ Attendance Marked Successfully!</strong><br><br>
            Subject: ${subject}<br>
            Semester: ${semester}<br>
            Section: ${section}<br><br>
            Time: ${new Date().toLocaleTimeString()}
        `;

        message.style.color = "green";


        // Stop camera
        stopScanner();


        console.log(
            "Attendance marked:",
            data
        );

    } catch (error) {

        console.log(
            "QR / Attendance Error:",
            error
        );

        message.textContent =
            "Invalid QR code or server error.";

        message.style.color = "red";

        scanCompleted = false;
    }
}


// STOP SCANNER
function stopScanner() {

    if (qrScanner) {

        qrScanner.stop()

            .then(function () {

                console.log(
                    "QR scanner stopped."
                );

            })

            .catch(function (error) {

                console.log(
                    "Unable to stop scanner:",
                    error
                );

            });
    }
}


// PAGE LOAD
document.addEventListener(
    "DOMContentLoaded",
    function () {

        startScanner();

    }
);