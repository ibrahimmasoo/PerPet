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

function loadPets() {
  const stored = localStorage.getItem('perpet-static-pets');
  if (!stored) return [...defaultPets];
  try {
    const parsed = JSON.parse(stored);
    return [...defaultPets, ...parsed];
  } catch {
    return [...defaultPets];
  }
}

function saveCustomPets() {
  const customPets = pets.filter(pet => !defaultPets.some(defaultPet => defaultPet.id === pet.id));
  localStorage.setItem('perpet-static-pets', JSON.stringify(customPets));
}

function renderPets() {
  if (!petGrid || !emptyState || !searchInput) return;

  const query = searchInput.value.trim().toLowerCase();
  const filtered = pets.filter(pet => {
    const matchesType = currentFilter === 'all' || pet.type === currentFilter;
    const matchesSearch = pet.name.toLowerCase().includes(query) || pet.description.toLowerCase().includes(query);
    return matchesType && matchesSearch;
  });

  petGrid.innerHTML = '';

  if (!filtered.length) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  filtered.forEach(pet => {
    const card = document.createElement('article');
    card.className = 'pet-card';
    card.innerHTML = `
      <div class="pet-thumb" style="background-image:url('${pet.image}')"></div>
      <div class="pet-body">
        <div class="pet-topline">
          <h3 class="pet-name">${escapeHtml(pet.name)}</h3>
          <span class="pet-badge">${pet.type}</span>
        </div>
        <p class="pet-meta">${pet.age} year${Number(pet.age) === 1 ? '' : 's'} old</p>
        <p class="pet-desc">${escapeHtml(pet.description)}</p>
        <button class="btn btn-dark" type="button">Adopt ${escapeHtml(pet.name)}</button>
      </div>
    `;
    petGrid.appendChild(card);
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    renderPets();
  });
});

if (searchInput) searchInput.addEventListener('input', renderPets);

if (petForm) {
  petForm.addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(petForm);
    const newPet = {
      id: Date.now(),
      name: formData.get('name').toString().trim(),
      type: formData.get('type').toString(),
      age: Number(formData.get('age')),
      image: formData.get('image').toString().trim(),
      description: formData.get('description').toString().trim()
    };

    pets.unshift(newPet);
    saveCustomPets();
    petForm.reset();
    currentFilter = 'all';
    filterButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.filter === 'all'));
    showToast(`${newPet.name} was added successfully.`);
    window.location.href = 'find-pet.html';
  });
}

function openModal() {
  if (!signInModal) return;
  signInModal.classList.remove('hidden');
  signInModal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  if (!signInModal) return;
  signInModal.classList.add('hidden');
  signInModal.setAttribute('aria-hidden', 'true');
}

if (signInBtn) signInBtn.addEventListener('click', openModal);
if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
if (signInModal) {
  signInModal.addEventListener('click', event => {
    if (event.target.hasAttribute('data-close')) closeModal();
  });
}
if (fakeGoogleBtn) {
  fakeGoogleBtn.addEventListener('click', () => {
    closeModal();
    showToast('This static demo has no real authentication.');
  });
}

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeModal();
});

if (menuBtn && navLinks) {
  menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

brandLinks.forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    const current = window.location.pathname.split('/').pop() || 'index.html';
    if (current === '' || current === 'index.html') {
      window.location.reload();
      return;
    }
    window.location.href = 'index.html';
  });
});

if (contactForm) {
  contactForm.addEventListener('submit', event => {
    event.preventDefault();
    contactForm.reset();
    showToast('Thanks! Your message was sent.');
  });
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 2500);
}

renderPets();
function handleLogoClick(e) {
  e.preventDefault();

  // لو احنا في الصفحة الرئيسية
  if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
    
    // Scroll للأعلى الأول
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // بعد جزء صغير يعمل refresh
    setTimeout(() => {
      window.location.reload();
    }, 300);

  } else {
    // لو في صفحة تانية يرجع للهوم
    window.location.href = 'index.html';
  }
}
