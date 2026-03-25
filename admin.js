
const adminFirebaseConfig = {
  apiKey: "AIzaSyDuj_luq_gHB13FMwYJ2xEzrhf7joOL3mc",
  authDomain: "perpet-84bbb.firebaseapp.com",
  projectId: "perpet-84bbb",
  storageBucket: "perpet-84bbb.firebasestorage.app",
  messagingSenderId: "393990144375",
  appId: "1:393990144375:web:55dcfb576720d282b5a172",
  measurementId: "G-NN4988BJF"
};

const ADMIN_EMAIL = 'ibrahimashrf301@gmail.com';

if (typeof firebase !== 'undefined' && !firebase.apps.length) {
  firebase.initializeApp(adminFirebaseConfig);
}

const adminAuth = typeof firebase !== 'undefined' ? firebase.auth() : null;
const adminDb = (typeof firebase !== 'undefined' && firebase.firestore) ? firebase.firestore() : null;

const adminGate = document.getElementById('adminGate');
const adminApp = document.getElementById('adminApp');
const adminAuthBtn = document.getElementById('adminAuthBtn');
const reloadAdminBtn = document.getElementById('reloadAdminBtn');

const totalSiteVisits = document.getElementById('totalSiteVisits');
const homePageVisits = document.getElementById('homePageVisits');
const adminTotalMessages = document.getElementById('adminTotalMessages');
const adminTotalUsers = document.getElementById('adminTotalUsers');
const adminTotalPets = document.getElementById('adminTotalPets');

const globalSettingsForm = document.getElementById('globalSettingsForm');
const homeSettingsForm = document.getElementById('homeSettingsForm');
const pageSettingsForm = document.getElementById('pageSettingsForm');
const petManagerForm = document.getElementById('petManagerForm');
const adminPetsList = document.getElementById('adminPetsList');
const resetPetBtn = document.getElementById('resetPetBtn');

const settingIds = {
  brandName: 'brandNameInput',
  logoUrl: 'logoUrlInput',
  faviconUrl: 'faviconUrlInput',
  contactEmail: 'contactEmailInput',
  footerText: 'footerTextInput',
  homeEyebrow: 'homeEyebrowInput',
  homeHeroTitle: 'homeTitleInput',
  homeHeroSubtitle: 'homeSubtitleInput',
  homeHeroImage: 'homeHeroImageInput',
  homePrimaryCtaText: 'homePrimaryTextInput',
  homePrimaryCtaLink: 'homePrimaryLinkInput',
  homeSecondaryCtaText: 'homeSecondaryTextInput',
  homeSecondaryCtaLink: 'homeSecondaryLinkInput',
  homeBottomCtaTitle: 'homeBottomTitleInput',
  homeBottomCtaText: 'homeBottomTextInput',
  homeBottomCtaButton: 'homeBottomButtonInput',
  findHeroTitle: 'findTitleInput',
  findHeroSubtitle: 'findSubtitleInput',
  listHeroTitle: 'listTitleInput',
  listHeroSubtitle: 'listSubtitleInput',
  whyHeroTitle: 'whyTitleInput',
  whyHeroSubtitle: 'whySubtitleInput',
  contactHeroTitle: 'contactTitleInput',
  contactHeroSubtitle: 'contactSubtitleInput',
  contactPanelTitle: 'contactPanelTitleInput',
  contactPanelText: 'contactPanelTextInput'
};

function adminToast(message) {
  const oldToast = document.querySelector('.toast');
  if (oldToast) oldToast.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2600);
}

function isAdmin(user) {
  return !!(user && user.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());
}

function getInputValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function setInputValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value || '';
}

function fillSettingsForm(settings) {
  Object.entries(settingIds).forEach(([key, id]) => setInputValue(id, settings[key] || ''));
}

async function loadAdminStats() {
  if (!adminDb) return;
  const [totalsDoc, homeDoc, messagesSnap, usersSnap, petsSnap] = await Promise.all([
    adminDb.collection('analytics').doc('siteTotals').get(),
    adminDb.collection('analytics').doc('page_index_html').get(),
    adminDb.collection('contactMessages').get(),
    adminDb.collection('users').get(),
    adminDb.collection('pets').get()
  ]);

  totalSiteVisits.textContent = String((totalsDoc.data() || {}).totalVisits || 0);
  homePageVisits.textContent = String((homeDoc.data() || {}).visits || 0);
  adminTotalMessages.textContent = String(messagesSnap.size || 0);
  adminTotalUsers.textContent = String(usersSnap.size || 0);
  adminTotalPets.textContent = String(petsSnap.size || 0);
}

async function loadSettings() {
  if (!adminDb) return;
  const doc = await adminDb.collection('siteContent').doc('main').get();
  const settings = doc.exists ? (doc.data() || {}) : {};
  fillSettingsForm(settings);
}

async function saveSettings(keys) {
  if (!adminDb) return;
  const payload = {};
  keys.forEach(key => {
    const id = settingIds[key];
    payload[key] = getInputValue(id);
  });
  payload.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
  await adminDb.collection('siteContent').doc('main').set(payload, { merge: true });
  adminToast('Settings saved successfully.');
}

async function loadPets() {
  if (!adminDb || !adminPetsList) return;
  const snapshot = await adminDb.collection('pets').orderBy('createdAt', 'desc').get();
  adminPetsList.innerHTML = '';

  if (snapshot.empty) {
    adminPetsList.innerHTML = '<div class="admin-empty-box">No pets yet. Add your first pet from the form above.</div>';
    return;
  }

  snapshot.forEach(doc => {
    const pet = doc.data() || {};
    const card = document.createElement('article');
    card.className = 'admin-pet-item';
    card.innerHTML = `
      <img src="${pet.image || ''}" alt="${pet.name || 'Pet'}">
      <div class="admin-pet-copy">
        <h3>${pet.name || 'Unnamed pet'}</h3>
        <p>${pet.type || 'dog'} · ${pet.age || 0} years</p>
        <small>${pet.description || ''}</small>
      </div>
      <div class="admin-pet-actions">
        <button class="btn btn-light" type="button" data-edit-pet="${doc.id}">Edit</button>
        <button class="btn btn-outline" type="button" data-delete-pet="${doc.id}">Delete</button>
      </div>
    `;
    card.dataset.pet = JSON.stringify({
      id: doc.id,
      name: pet.name || '',
      type: pet.type || 'dog',
      age: pet.age || '',
      image: pet.image || '',
      description: pet.description || ''
    });
    adminPetsList.appendChild(card);
  });
}

function fillPetForm(pet) {
  document.getElementById('petDocId').value = pet.id || '';
  document.getElementById('petNameInput').value = pet.name || '';
  document.getElementById('petTypeInput').value = pet.type || 'dog';
  document.getElementById('petAgeInput').value = pet.age || '';
  document.getElementById('petImageInput').value = pet.image || '';
  document.getElementById('petDescriptionInput').value = pet.description || '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetPetForm() {
  petManagerForm.reset();
  document.getElementById('petDocId').value = '';
}

async function bootAdmin() {
  await Promise.all([loadAdminStats(), loadSettings(), loadPets()]);
}

if (globalSettingsForm) {
  globalSettingsForm.addEventListener('submit', async event => {
    event.preventDefault();
    await saveSettings(['brandName', 'logoUrl', 'faviconUrl', 'contactEmail', 'footerText']);
  });
}

if (homeSettingsForm) {
  homeSettingsForm.addEventListener('submit', async event => {
    event.preventDefault();
    await saveSettings([
      'homeEyebrow', 'homeHeroTitle', 'homeHeroSubtitle', 'homeHeroImage',
      'homePrimaryCtaText', 'homePrimaryCtaLink', 'homeSecondaryCtaText',
      'homeSecondaryCtaLink', 'homeBottomCtaTitle', 'homeBottomCtaText', 'homeBottomCtaButton'
    ]);
  });
}

if (pageSettingsForm) {
  pageSettingsForm.addEventListener('submit', async event => {
    event.preventDefault();
    await saveSettings([
      'findHeroTitle', 'findHeroSubtitle', 'listHeroTitle', 'listHeroSubtitle',
      'whyHeroTitle', 'whyHeroSubtitle', 'contactHeroTitle', 'contactHeroSubtitle',
      'contactPanelTitle', 'contactPanelText'
    ]);
  });
}

if (petManagerForm) {
  petManagerForm.addEventListener('submit', async event => {
    event.preventDefault();
    const id = document.getElementById('petDocId').value.trim();
    const payload = {
      name: document.getElementById('petNameInput').value.trim(),
      type: document.getElementById('petTypeInput').value,
      age: Number(document.getElementById('petAgeInput').value),
      image: document.getElementById('petImageInput').value.trim(),
      description: document.getElementById('petDescriptionInput').value.trim(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (!payload.name || !payload.image || !payload.description) {
      adminToast('Please complete all pet fields.');
      return;
    }

    if (id) {
      await adminDb.collection('pets').doc(id).set(payload, { merge: true });
      adminToast('Pet updated.');
    } else {
      payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      await adminDb.collection('pets').add(payload);
      adminToast('Pet added.');
    }

    resetPetForm();
    await Promise.all([loadPets(), loadAdminStats()]);
  });
}

if (resetPetBtn) {
  resetPetBtn.addEventListener('click', resetPetForm);
}

if (adminPetsList) {
  adminPetsList.addEventListener('click', async event => {
    const editId = event.target.getAttribute('data-edit-pet');
    const deleteId = event.target.getAttribute('data-delete-pet');

    if (editId) {
      const card = event.target.closest('.admin-pet-item');
      if (!card) return;
      const pet = JSON.parse(card.dataset.pet || '{}');
      fillPetForm(pet);
    }

    if (deleteId) {
      const ok = window.confirm('Delete this pet from the site?');
      if (!ok) return;
      await adminDb.collection('pets').doc(deleteId).delete();
      adminToast('Pet deleted.');
      await Promise.all([loadPets(), loadAdminStats()]);
    }
  });
}

if (reloadAdminBtn) {
  reloadAdminBtn.addEventListener('click', bootAdmin);
}

if (adminAuthBtn && adminAuth) {
  adminAuthBtn.addEventListener('click', async () => {
    await adminAuth.signOut();
    window.location.href = 'signin.html';
  });
}

if (adminAuth) {
  adminAuth.onAuthStateChanged(async user => {
    if (!user) {
      window.location.href = 'signin.html';
      return;
    }

    if (!isAdmin(user)) {
      if (adminGate) {
        adminGate.innerHTML = '<h2>Access denied</h2><p>This dashboard is available only for the admin account.</p>';
      }
      if (adminAuthBtn) adminAuthBtn.textContent = 'Back to sign in';
      return;
    }

    if (adminGate) adminGate.classList.add('hidden-panel');
    if (adminApp) adminApp.classList.remove('hidden-panel');
    await bootAdmin();
  });
}
