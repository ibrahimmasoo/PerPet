const firebaseConfig = {
  apiKey: "AIzaSyDuj_luq_gHB13FMwYJ2xEzrhf7joOL3mc",
  authDomain: "perpet-84bbb.firebaseapp.com",
  projectId: "perpet-84bbb",
  storageBucket: "perpet-84bbb.firebasestorage.app",
  messagingSenderId: "117896633331",
  appId: "1:117896633331:web:a7f3d8fa9c8d26816d96ba",
  measurementId: "G-RW19WSQ9E8"
};

if (typeof firebase !== 'undefined' && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = typeof firebase !== 'undefined' ? firebase.auth() : null;
if (auth) {
  auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(() => {});
}

const $ = (id) => document.getElementById(id);
const messageBox = $('authMessage');

function setMessage(text, type = '') {
  if (!messageBox) return;
  messageBox.textContent = text || '';
  messageBox.className = 'auth-message' + (type ? ' ' + type : '');
}

function mapAuthError(error) {
  const code = error && error.code ? error.code : '';
  const map = {
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/missing-password': 'Please enter your password.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/email-already-in-use': 'This email is already used.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/operation-not-allowed': 'Enable the provider in Firebase Authentication.',
    'auth/unauthorized-domain': 'Add this domain to Firebase Authorized domains.'
  };
  return map[code] || code || 'Something went wrong. Please try again.';
}

async function signInWithGoogleRedirectOrPopup() {
  if (!auth || typeof firebase === 'undefined') {
    setMessage('Firebase is not loaded.', 'error');
    return;
  }
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    await auth.signInWithPopup(provider);
    window.location.href = 'index.html';
  } catch (error) {
    setMessage(mapAuthError(error), 'error');
  }
}

const googleBtn = $('googleSignInBtn');
if (googleBtn) {
  googleBtn.addEventListener('click', signInWithGoogleRedirectOrPopup);
}

const signInForm = $('signInForm');
if (signInForm) {
  signInForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage('');
    const email = $('signInEmail').value.trim();
    const password = $('signInPassword').value;
    if (!email || !password) {
      setMessage('Please enter your email and password.', 'error');
      return;
    }
    try {
      await auth.signInWithEmailAndPassword(email, password);
      setMessage('Signed in successfully. Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 600);
    } catch (error) {
      setMessage(mapAuthError(error), 'error');
    }
  });
}

const signUpForm = $('signUpForm');
if (signUpForm) {
  signUpForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage('');
    const firstName = $('firstName').value.trim();
    const lastName = $('lastName').value.trim();
    const email = $('signUpEmail').value.trim();
    const password = $('signUpPassword').value;
    const confirmPassword = $('confirmPassword').value;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setMessage('Please fill in all fields.', 'error');
      return;
    }
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.', 'error');
      return;
    }
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.', 'error');
      return;
    }

    try {
      const result = await auth.createUserWithEmailAndPassword(email, password);
      await result.user.updateProfile({ displayName: `${firstName} ${lastName}`.trim() });
      setMessage('Account created successfully. Redirecting to sign in...', 'success');
      await auth.signOut();
      setTimeout(() => {
        window.location.href = 'signin.html?registered=1&email=' + encodeURIComponent(email);
      }, 900);
    } catch (error) {
      setMessage(mapAuthError(error), 'error');
    }
  });
}

const forgotBtn = $('forgotPasswordLink');
if (forgotBtn) {
  forgotBtn.addEventListener('click', async (event) => {
    event.preventDefault();
    const email = $('signInEmail').value.trim();
    if (!email) {
      setMessage('Enter your email first to reset the password.', 'error');
      return;
    }
    try {
      await auth.sendPasswordResetEmail(email);
      setMessage('Password reset email sent.', 'success');
    } catch (error) {
      setMessage(mapAuthError(error), 'error');
    }
  });
}

const params = new URLSearchParams(window.location.search);
if (params.get('registered') === '1') {
  const email = params.get('email');
  if ($('signInEmail') && email) $('signInEmail').value = email;
  setMessage('Account created successfully. Please sign in.', 'success');
}
