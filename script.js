/* global firebase Stripe */

console.warn('\n███████╗████████╗ ██████╗ ██████╗ ██╗\n██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗██║\n███████╗   ██║   ██║   ██║██████╔╝██║\n╚════██║   ██║   ██║   ██║██╔═══╝ ╚═╝\n███████║   ██║   ╚██████╔╝██║     ██╗\n╚══════╝   ╚═╝    ╚═════╝ ╚═╝     ╚═╝\n Don\'t Type Anything in This Box Unless You Know What You\'re Doing. And no, you cannot get Minty for free!');

asnync function copyToken() {
  var copyText = await user.getIdToken(true);
  copyText.select();
  copyText.setSelectionRange(0, 99999)
  document.execCommand("copy");
};


(async () => {
  const status = document.getElementById("status");
  const PUBLIC_STRIPE_KEY =
    "pk_test_51IMlcNF4xI825b1kf0ajPLuDrfSqQlGUPB63mDJyVLO41qrlkJq45S1QlRTkBpFm4BqkBNv4FiCiT50Lck3gVqE400CNChLgK4";
  try {
    const params = new URLSearchParams(location.search);
    function loginCheck() {
      if (!!firebase.auth().currentUser) {
        console.log("Logged in!", firebase.auth().currentUser);
        return signedIn(firebase.auth().currentUser);
      } else {
        signedOut();
      }
    }

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
    firebase.auth().onAuthStateChanged(loginCheck);
    const db = firebase.firestore();
    const stripe = Stripe(PUBLIC_STRIPE_KEY);
    await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    let providerGoogle = new firebase.auth.GoogleAuthProvider();
    let providerGithub = new firebase.auth.GithubAuthProvider();
    try {
      document
        .querySelector(".signin.google")
        .addEventListener("click", async function() {
          await firebase.auth().signInWithRedirect(providerGoogle);
        });
      document
        .querySelector(".signin.github")
        .addEventListener("click", async function() {
          await firebase.auth().signInWithRedirect(providerGithub);
        });
      document
        .querySelector(".signout")
        .addEventListener("click", async function() {
          await firebase.auth().signOut();
        });
    } catch (e) {}
    await firebase.auth().getRedirectResult();

    async function signedIn(user) {
      let welcomeBaseText;
      let buyMintyBtn, activateMintyBtn;
      let token = await user.getIdToken(/* forceRefresh */ true);
      async function buyMinty() {
        try {
          buyMintyBtn.disabled = true;
          buyMintyBtn.textContent = "Loading...";
          let session = await (await fetch(
            "https://minty-backend.vercel.app/api/create-checkout-session.js",
            {
              method: "POST",
              body: JSON.stringify({
                token
              }),
              headers: { "content-type": "application/json" }
            }
          )).json();
          let result = await (await stripe).redirectToCheckout({
            sessionId: session.id
          });
          if (result.error) {
            throw new Error();
          }
        } catch (e) {
          buyMintyBtn.textContent = "Error";
        }
      }
      window.user = user;
      status.textContent = "";
      let showActivate = params.get("showActivationButton") == "1";
      let userWelcome = document.createElement("span");
      userWelcome.textContent = welcomeBaseText = `Signed in as ${user.displayName}.`;

      let userPhoto = document.createElement("img");
      userPhoto.src = user.photoURL;
      userPhoto.className = "avatar";

      buyMintyBtn = document.createElement("button");
      buyMintyBtn.textContent = "Loading...";
      buyMintyBtn.className = "matter-button-outlined buy-minty";
      buyMintyBtn.disabled = true;
      buyMintyBtn.onclick = buyMinty;

      activateMintyBtn = document.createElement("a");
      activateMintyBtn.textContent = "Loading...";
      activateMintyBtn.className = "matter-button-outlined activate-minty";
      activateMintyBtn.disabled = true;
      activateMintyBtn.style.display = "none";

      status.append(userPhoto, userWelcome, buyMintyBtn, activateMintyBtn);
      document
        .querySelectorAll(".signin")
        .forEach(e => (e.style.display = "none"));
      document
        .querySelectorAll(".signout")
        .forEach(e => (e.style.display = "flex"));

      (async () => {
        if (await hasPurchasedMinty(user)) {
          if (showActivate) {
            activateMintyBtn.style.display = "flex";
            buyMintyBtn.style.display = "none";
          }
          buyMintyBtn.textContent = "You own a Minty license.";
          activateMintyBtn.onclick = "copyToken()";
          activateMintyBtn.textContent = "Activate Minty";
        } else {
          buyMintyBtn.disabled = false;
          buyMintyBtn.textContent = "Buy Minty";
        }
      })();
    }

    async function hasPurchasedMinty(user) {
      try {
        let doc = await db
          .collection("users")
          .doc(user.email)
          .get();
        if (doc.exists) {
          return doc.data().hasPurchasedMinty || false;
        }
        return false;
      } catch (e) {
        console.warn(e);
        return false;
      }
    }

    async function signedOut() {
      document
        .querySelectorAll(".signin")
        .forEach(e => (e.style.display = "flex"));
      document
        .querySelectorAll(".signout")
        .forEach(e => (e.style.display = "none"));
      if(!status.classList.contains("error")) document.getElementById("status").textContent = "";
    }
  } catch (e) {
    console.error(e);
    firebase.auth().onAuthStateChanged(()=>{})
    status.textContent = `There was an error: ${e.message}`;
    status.classList.add("error")
  }
})();
