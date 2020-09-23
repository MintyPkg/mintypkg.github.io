import firebase from "https://jspm.dev/firebase";
(async () => {
  const firebaseConfig = {
    apiKey: "AIzaSyBnXkbaED2AeInnZItginGOEVFlCrRk1s4",
    authDomain: "minty-70da2.firebaseapp.com",
    databaseURL: "https://minty-70da2.firebaseio.com",
    projectId: "minty-70da2",
    storageBucket: "minty-70da2.appspot.com",
    messagingSenderId: "887993313270",
    appId: "1:887993313270:web:fb6d3634c36f93845089d7",
    measurementId: "G-63RV1J0LJK"
  };
  firebase.initializeApp(firebaseConfig);
  let provider = new firebase.auth.GoogleAuthProvider();
  let result;
  document
    .querySelector("button.signin")
    .addEventListener("click", async function() {
      try {
        result = await firebase.auth().signInWithPopup(provider);
      } catch (e) {
        document.getElementById(
          "status"
        ).textContent = `There was an error: ${e.message}`;
      }
      // This gives you a Google Access Token. You can use it to access the Google API.
      let token = result.credential.accessToken;
      // The signed-in user info.
      let user = result.user;
      document.getElementById(
        "status"
      ).textContent = `Signed in as ${user.displayName}. Your email is ${user.displayName}`;
      document.querySelector("button.signin").disabled = true;
    });
})();
