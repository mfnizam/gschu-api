// ========= Firebase ===============
const firebase = require("firebase-admin"),
			serviceAccount = require("./firebase.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount)
});

module.exports.firebase = firebase