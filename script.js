const firebaseConfig = {
  apiKey: "AIzaSyDuj_luq_gHB13FMwYJ2xEzrhf7joOL3mc",
  authDomain: "perpet-84bbb.firebaseapp.com",
  projectId: "perpet-84bbb",
  storageBucket: "perpet-84bbb.firebasestorage.app",
  messagingSenderId: "393990144375",
  appId: "1:393990144375:web:55dcfb576720d282b5a172",
  measurementId: "G-NN4988BJF"
};

let auth = null;

if (typeof firebase !== "undefined") {
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    auth = firebase.auth();
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(() => {});
  } catch (error) {
    console.error("Firebase init error:", error);
  }
}

const defaultPets = [
  {
    id: 1,
    name: 'Buddy',
    type: 'dog',
    age: 2,
    description: 'Friendly, playful, and loves long walks in the park.',
    image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 2,
    name: 'Luna',
    type: 'cat',
    age: 1,
    description: 'Gentle indoor cat who enjoys sunny windows and soft blankets.',
    image: 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 3,
    name: 'Max',
    type: 'dog',
    age: 4,
    description: 'Calm, loyal, and already trained for basic home routines.',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 4,
    name: 'Milo',
    type: 'cat',
    age: 3,
    description: 'Curious and affectionate cat who loves attention and toys.',
    image: 'https://images.unsplash.com/photo-1548247416-ec66f4900b2e?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 5,
    name: 'Daisy',
    type: 'dog',
    age: 5,
    description: 'Sweet family dog with a gentle nature and a big heart.',
    image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 6,
    name: 'Nala',
    type: 'cat',
    age: 2,
    description: 'Elegant, relaxed, and perfect for a quiet cozy home.',
    image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=1200'
  }
];

const petGrid = document.getElementById('petGrid');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');
const petForm = document.getElementById('petForm');
const signInBtn = document.getElementById('signInBtn');
const signInModal = document.getElementById('signInModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const fakeGoogleBtn = document.getElementById('fakeGoogleBtn');
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');
const contactForm = document.getElementById('contactForm');
const brandLinks = document.querySelectorAll('.brand-home');

let currentFilter = 'all';
let pets = loadPets();
let currentUser = null;

function loadPets() {
  const stored = localStorage.getItem('perpet-static-pets');

  if (!stored) {
    return [...defaultPets];
  }

  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [...defaultPets];
    }
    return [...defaultPets, ...parsed];
  } catch (error) {
    return [...defaultPets];
  }
}

function saveCustomPets() {
  const customPets = pets.filter(
    pet => !defaultPets.some(defaultPet => defaultPet.id === pet.id)
  );
  localStorage.setItem('perpet-static-pets', JSON.stringify(customPets));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderPets() {
  if (!petGrid) return;

  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

  const filtered = pets.filter(pet => {
    const matchesType = currentFilter === 'all' || pet.type === currentFilter;
    const matchesSearch =
      pet.name.toLowerCase().includes(query) ||
      pet.description.toLowerCase().includes(query);

    return matchesType && matchesSearch;
  });

  petGrid.innerHTML = '';

  if (!filtered.length) {
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  filtered.forEach(pet => {
    const card = document.createElement('article');
    card.className = 'pet-card';

    card.innerHTML = `
      <div class="pet-thumb" style="background-image:url('${pet.image}')"></div>
      <div class="pet-body">
        <div class="pet-topline">
          <h3 class="pet-name">${escapeHtml(pet.name)}</h3>
          <span class="pet-badge">${escapeHtml(pet.type)}</span>
        </div>
        <p class="pet-meta">${Number(pet.age)} year${Number(pet.age) === 1 ? '' : 's'} old</p>
        <p class="pet-desc">${escapeHtml(pet.description)}</p>
        <button class="btn btn-dark" type="button">Adopt ${escapeHtml(pet.name)}</button>
      </div>
    `;

    petGrid.appendChild(card);
  });
}

function showToast(message) {
  const oldToast = document.querySelector('.toast');
  if (oldToast) oldToast.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2800);
}

function openModal() {
  window.location.href = 'signin.html';
}

function closeModal() {
  if (!signInModal) return;
  signInModal.classList.add('hidden');
  signInModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function updateAuthUI(user) {
  currentUser = user || null;

  if (!signInBtn) return;

  if (currentUser) {
    const rawName = currentUser.displayName || currentUser.email || 'Account';
    const name = rawName.split(' ')[0];
    signInBtn.textContent = name;
    signInBtn.setAttribute('title', 'Click to sign out');
  } else {
    signInBtn.textContent = 'Sign In';
    signInBtn.removeAttribute('title');
  }
}

function handleLogoClick(event) {
  if (event) event.preventDefault();

  const currentPath = window.location.pathname;
  const currentPage = currentPath.split('/').pop();

  const isHome =
    currentPage === '' ||
    currentPage === 'index.html' ||
    currentPath === '/' ||
    currentPath.endsWith('/');

  if (isHome) {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    setTimeout(() => {
      window.location.href = 'index.html?refresh=' + Date.now();
    }, 300);
  } else {
    window.location.href = 'index.html';
  }
}

async function signOutCurrentUser() {
  if (!auth || !auth.currentUser) return;

  try {
    await auth.signOut();
    showToast('Signed out successfully.');
  } catch (error) {
    console.error('Sign out error:', error);
    showToast('Could not sign out.');
  }
}

function signInWithGoogle() {
  if (!auth || typeof firebase === 'undefined') {
    showToast('Firebase is not loaded.');
    return;
  }

  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  auth.signInWithPopup(provider)
    .then((result) => {
      closeModal();

      const user = result.user;
      const userName = user && user.displayName ? user.displayName : 'User';

      updateAuthUI(user);
      showToast(`Welcome ${userName}`);
    })
    .catch((error) => {
      console.error('Google sign-in error:', error);

      if (error.code === 'auth/popup-closed-by-user') {
        showToast('Login popup was closed.');
      } else if (error.code === 'auth/popup-blocked') {
        showToast('Allow popups in your browser and try again.');
      } else if (error.code === 'auth/unauthorized-domain') {
        showToast('Add this domain to Firebase Authorized domains.');
      } else if (error.code === 'auth/operation-not-allowed') {
        showToast('Enable Google sign-in in Firebase Authentication.');
      } else if (error.code === 'auth/network-request-failed') {
        showToast('Network error. Check your connection and try again.');
      } else if (error.code) {
        showToast(error.code);
      } else {
        showToast('Login failed');
      }
    });
}

window.handleLogoClick = handleLogoClick;

if (auth) {
  auth.onAuthStateChanged((user) => {
    updateAuthUI(user);
  });
}

if (filterButtons.length) {
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      currentFilter = button.dataset.filter || 'all';

      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      renderPets();
    });
  });
}

if (searchInput) {
  searchInput.addEventListener('input', renderPets);
}

if (petForm) {
  petForm.addEventListener('submit', event => {
    event.preventDefault();

    const formData = new FormData(petForm);

    const name = String(formData.get('name') || '').trim();
    const type = String(formData.get('type') || '').trim().toLowerCase();
    const age = Number(formData.get('age'));
    const image = String(formData.get('image') || '').trim();
    const description = String(formData.get('description') || '').trim();

    if (!name || !type || !age || !image || !description) {
      showToast('Please fill in all fields.');
      return;
    }

    const newPet = {
      id: Date.now(),
      name,
      type,
      age,
      image,
      description
    };

    pets.unshift(newPet);
    saveCustomPets();
    petForm.reset();

    currentFilter = 'all';

    if (filterButtons.length) {
      filterButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === 'all');
      });
    }

    showToast(`${newPet.name} was added successfully.`);

    setTimeout(() => {
      window.location.href = 'find-pet.html';
    }, 500);
  });
}

if (signInBtn) {
  signInBtn.addEventListener('click', () => {
    if (currentUser) {
      signOutCurrentUser();
    } else {
      openModal();
    }
  });
}

if (closeModalBtn) {
  closeModalBtn.addEventListener('click', closeModal);
}

if (signInModal) {
  signInModal.addEventListener('click', event => {
    if (event.target.hasAttribute('data-close') || event.target.classList.contains('modal-backdrop')) {
      closeModal();
    }
  });
}

if (fakeGoogleBtn) {
  fakeGoogleBtn.addEventListener('click', signInWithGoogle);
}

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeModal();
  }
});

if (menuBtn && navLinks) {
  menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
    });
  });
}

if (brandLinks.length) {
  brandLinks.forEach(link => {
    link.addEventListener('click', handleLogoClick);
  });
}

if (contactForm) {
  contactForm.addEventListener('submit', event => {
    event.preventDefault();
    contactForm.reset();
    showToast('Thanks! Your message was sent.');
  });
}

renderPets();
