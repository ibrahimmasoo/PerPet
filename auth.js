const ADMIN_EMAIL = 'ibrahimashrf301@gmail.com';

const firebaseConfig = {
  apiKey: "AIzaSyDuj_luq_gHB13FMwYJ2xEzrhf7joOL3mc",
  authDomain: "perpet-84bbb.firebaseapp.com",
  projectId: "perpet-84bbb",
  storageBucket: "perpet-84bbb.firebasestorage.app",
  messagingSenderId: "393990144375",
  appId: "1:393990144375:web:55dcfb576720d282b5a172",
  measurementId: "G-NN4988BJF"
};

if (typeof firebase !== 'undefined' && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = typeof firebase !== 'undefined' ? firebase.auth() : null;
const db = (typeof firebase !== 'undefined' && firebase.firestore) ? firebase.firestore() : null;
if (auth) {
  auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(() => {});
}

const signinForm = document.getElementById('signinForm');
const signupForm = document.getElementById('signupForm');
const authMessage = document.getElementById('authMessage');
const googleSignInBtn = document.getElementById('googleSignInBtn');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');

function setMessage(message, type = '') {
  if (!authMessage) return;
  authMessage.textContent = message || '';
  authMessage.className = 'auth-message' + (type ? ' ' + type : '');
}

function getFriendlyError(error) {
  const code = error && error.code ? error.code : '';
  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';
    case 'auth/email-already-in-use':
      return 'This email is already registered.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/popup-closed-by-user':
      return 'The Google sign-in popup was closed.';
    case 'auth/popup-blocked':
      return 'Your browser blocked the popup. Allow popups and try again.';
    case 'auth/unauthorized-domain':
      return 'Add this domain to Firebase Authorized domains.';
    case 'auth/operation-not-allowed':
      return 'Enable the required sign-in provider in Firebase Authentication.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    default:
      return code || 'Something went wrong. Please try again.';
  }
}

function validateName(value) {
  return String(value || '').trim().length >= 2;
}

function getPostLoginRedirect(user) {
  return user && user.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
    ? 'admin-dashboard.html'
    : 'index.html';
}

async function saveUserProfile(user, extra = {}) {
  if (!db || !user) return;
  try {
    await db.collection('users').doc(user.uid).set({
      email: user.email || '',
      displayName: user.displayName || '',
      firstName: extra.firstName || '',
      lastName: extra.lastName || '',
      lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdAt: extra.isNewUser ? firebase.firestore.FieldValue.serverTimestamp() : undefined,
      role: (user.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user'
    }, { merge: true });
  } catch (error) {
    console.error('Could not save user profile:', error);
  }
}

async function signInWithGoogle() {
  if (!auth || typeof firebase === 'undefined') {
    setMessage('Firebase is not loaded correctly.', 'error');
    return;
  }

  try {
    setMessage('');
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await auth.signInWithPopup(provider);
    await saveUserProfile(result.user);
    window.location.href = getPostLoginRedirect(result.user);
  } catch (error) {
    setMessage(getFriendlyError(error), 'error');
  }
}

if (googleSignInBtn) {
  googleSignInBtn.addEventListener('click', signInWithGoogle);
}

if (signinForm) {
  signinForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!auth) {
      setMessage('Firebase is not loaded correctly.', 'error');
      return;
    }

    const email = document.getElementById('signinEmail').value.trim();
    const password = document.getElementById('signinPassword').value;

    if (!email || !password) {
      setMessage('Please enter your email and password.', 'error');
      return;
    }

    try {
      setMessage('Signing you in...', 'success');
      const result = await auth.signInWithEmailAndPassword(email, password);
      await saveUserProfile(result.user);
      window.location.href = getPostLoginRedirect(result.user);
    } catch (error) {
      setMessage(getFriendlyError(error), 'error');
    }
  });
}

if (signupForm) {
  signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!auth) {
      setMessage('Firebase is not loaded correctly.', 'error');
      return;
    }

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!validateName(firstName) || !validateName(lastName)) {
      setMessage('Please enter a valid first name and last name.', 'error');
      return;
    }

    if (!email) {
      setMessage('Please enter your email address.', 'error');
      return;
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Password confirmation does not match.', 'error');
      return;
    }

    try {
      setMessage('Creating your account...', 'success');
      const result = await auth.createUserWithEmailAndPassword(email, password);
      if (result.user) {
        await result.user.updateProfile({ displayName: `${firstName} ${lastName}` });
      }
      window.location.href = 'signin.html?created=1';
    } catch (error) {
      setMessage(getFriendlyError(error), 'error');
    }
  });
}

if (forgotPasswordLink) {
  forgotPasswordLink.addEventListener('click', async (event) => {
    event.preventDefault();
    if (!auth) {
      setMessage('Firebase is not loaded correctly.', 'error');
      return;
    }

    const email = document.getElementById('signinEmail').value.trim();
    if (!email) {
      setMessage('Enter your email first, then press forgot password again.', 'error');
      return;
    }

    try {
      await auth.sendPasswordResetEmail(email);
      setMessage('Password reset email sent successfully.', 'success');
    } catch (error) {
      setMessage(getFriendlyError(error), 'error');
    }
  });
}

const params = new URLSearchParams(window.location.search);
if (params.get('created') === '1') {
  setMessage('Account created successfully. Sign in with your new email and password.', 'success');
}
