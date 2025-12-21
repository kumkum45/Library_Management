// API Base URL
const API_BASE_URL = 'http://127.0.0.1:5000';

// ============ DOM Elements ============
const profileName = document.getElementById('profileName');
const logoutBtn = document.getElementById('logoutBtn');
const profileBtn = document.getElementById('profileBtn');
const profileDropdown = document.getElementById('profileDropdown');
const dropdownTrigger = document.querySelector('.dropdown__trigger');
const dropdownMenu = document.querySelector('.dropdown__menu');
const dropdownItems = document.querySelectorAll('.dropdown__item');

// Section elements
const booksSection = document.getElementById('booksSection');
const issuedSection = document.getElementById('issuedSection');
const usersSection = document.getElementById('usersSection');

// Books filter elements
const filterBookName = document.getElementById('filterBookName');
const filterAuthor = document.getElementById('filterAuthor');
const filterCategory = document.getElementById('filterCategory');
const filterStatus = document.getElementById('filterStatus');
const searchBooksBtn = document.getElementById('searchBooksBtn');
const resetBooksBtn = document.getElementById('resetBooksBtn');
const booksResults = document.getElementById('booksResults');

// Issued books elements
const issuedResults = document.getElementById('issuedResults');

// Users elements
const usersResults = document.getElementById('usersResults');

// Modal elements
const userDetailModal = document.getElementById('userDetailModal');
const closeModalBtn = document.getElementById('closeModal');

// ============ Initialization ============
document.addEventListener('DOMContentLoaded', () => {
  loadUserProfile();
  setupEventListeners();
  loadBooksData();
});

// ============ Setup Event Listeners ============
function setupEventListeners() {
  // Profile dropdown
  profileBtn.addEventListener('click', toggleProfileDropdown);
  document.addEventListener('click', closeDropdownsOutside);

  // Menu dropdown
  dropdownTrigger.addEventListener('click', toggleMenuDropdown);
  dropdownItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const section = item.getAttribute('data-section');
      navigateToSection(section);
      dropdownMenu.style.display = 'none';
    });
  });

  // Logout
  logoutBtn.addEventListener('click', logout);

  // Books filters
  searchBooksBtn.addEventListener('click', searchBooks);
  resetBooksBtn.addEventListener('click', resetBooksFilters);

  // Modal
  closeModalBtn.addEventListener('click', closeModal);
  userDetailModal.addEventListener('click', (e) => {
    if (e.target === userDetailModal) closeModal();
  });
}

// ============ Profile & Auth ============
function loadUserProfile() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.name) {
    profileName.textContent = user.name.split(' ')[0]; // First name
  }
}

function toggleProfileDropdown() {
  const isOpen = profileDropdown.style.display !== 'none';
  profileDropdown.style.display = isOpen ? 'none' : 'block';
  profileBtn.setAttribute('aria-expanded', !isOpen);
}

function toggleMenuDropdown() {
  const isOpen = dropdownMenu.style.display !== 'none';
  dropdownMenu.style.display = isOpen ? 'none' : 'block';
  dropdownTrigger.setAttribute('aria-expanded', !isOpen);
}

function closeDropdownsOutside(e) {
  if (!e.target.closest('.profile-menu') && !e.target.closest('.dropdown')) {
    profileDropdown.style.display = 'none';
    dropdownMenu.style.display = 'none';
    profileBtn.setAttribute('aria-expanded', 'false');
    dropdownTrigger.setAttribute('aria-expanded', 'false');
  }
}

function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// ============ Navigation ============
function navigateToSection(section) {
  // Hide all sections
  document.querySelectorAll('.section').forEach((s) => {
    s.style.display = 'none';
    s.classList.remove('active');
  });

  // Show selected section
  if (section === 'books') {
    booksSection.style.display = 'block';
    booksSection.classList.add('active');
    loadBooksData();
  } else if (section === 'issued') {
    issuedSection.style.display = 'block';
    issuedSection.classList.add('active');
    loadIssuedBooksData();
  } else if (section === 'users') {
    usersSection.style.display = 'block';
    usersSection.classList.add('active');
    loadUsersData();
  }
}

// ============ Books Section ============
function resetBooksFilters() {
  filterBookName.value = '';
  filterAuthor.value = '';
  filterCategory.value = '';
  filterStatus.value = '';
  loadBooksData();
}

async function searchBooks() {
  const bookName = filterBookName.value.trim();
  const author = filterAuthor.value.trim();
  const category = filterCategory.value.trim();
  const status = filterStatus.value.trim();

  showLoading('booksResults');

  try {
    // Build API URL based on filters
    let url = `${API_BASE_URL}/books/search`;

    // Use path parameters to match your backend API structure
    if (bookName || author || category || status) {
      const param1 = bookName || 'all';
      url += `/${param1}`;

      if (category || status) {
        url += `/${category || 'all'}`;
        if (status) {
          url += `/${status}`;
        }
      }
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (Array.isArray(data)) {
      renderBooksTable(data);
    } else {
      showEmptyState('booksResults', 'No books found.');
    }
  } catch (error) {
    console.error('Error fetching books:', error);
    showError('booksResults', 'Failed to load books. Please try again.');
  }
}

async function loadBooksData() {
  showLoading('booksResults');

  try {
    const response = await fetch(`${API_BASE_URL}/books/search`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      renderBooksTable(data);
    } else {
      showEmptyState('booksResults', 'No books available.');
    }
  } catch (error) {
    console.error('Error fetching books:', error);
    showError('booksResults', 'Failed to load books. Please try again.');
  }
}

function renderBooksTable(books) {
  const tableContainer = document.getElementById('booksTable');
  let html = '<table><thead><tr>';
  html += '<th>Book ID</th>';
  html += '<th>Title</th>';
  html += '<th>Author</th>';
  html += '<th>Category</th>';
  html += '<th>Status</th>';
  html += '</tr></thead><tbody>';

  books.forEach((book) => {
    const statusClass =
      book.status === 'available'
        ? 'status-available'
        : 'status-issued';
    const statusText =
      book.status === 'available' ? 'Available' : 'Issued';

    html += '<tr>';
    html += `<td>${book.id}</td>`;
    html += `<td>${book.title}</td>`;
    html += `<td>${book.author_name || 'Unknown'}</td>`;
    html += `<td>${book.category}</td>`;
    html += `<td><span class="status-badge ${statusClass}">${statusText}</span></td>`;
    html += '</tr>';
  });

  html += '</tbody></table>';
  tableContainer.innerHTML = html;
  hideLoading('booksResults');
}

// ============ Issued Books Section ============
async function loadIssuedBooksData() {
  showLoading('issuedResults');

  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/issued_books`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      renderIssuedBooksTable(data);
    } else {
      showEmptyState('issuedResults', 'No issued books found.');
    }
  } catch (error) {
    console.error('Error fetching issued books:', error);
    showError('issuedResults', 'Failed to load issued books. Please try again.');
  }
}

function renderIssuedBooksTable(issuedBooks) {
  const tableContainer = document.getElementById('issuedTable');
  let html = '<table><thead><tr>';
  html += '<th>Issue ID</th>';
  html += '<th>Book Name</th>';
  html += '<th>Issued To</th>';
  html += '<th>Status</th>';
  html += '</tr></thead><tbody>';

  issuedBooks.forEach((issue) => {
    const statusClass =
      issue.status === 'issued' ? 'status-issued' : 'status-overdue';

    html += '<tr>';
    html += `<td>${issue.id}</td>`;
    html += `<td>${issue.book_title || 'Unknown'}</td>`;
    html += `<td>${issue.user_name || 'Unknown'}</td>`;
    html += `<td><span class="status-badge ${statusClass}">${issue.status === 'issued' ? 'Active' : 'Overdue'}</span></td>`;
    html += '</tr>';
  });

  html += '</tbody></table>';
  tableContainer.innerHTML = html;
  hideLoading('issuedResults');
}

// ============ Users Section ============
async function loadUsersData() {
  showLoading('usersResults');

  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      renderUsersTable(data);
    } else {
      showEmptyState('usersResults', 'No users found.');
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    showError('usersResults', 'Failed to load users. Please try again.');
  }
}

function renderUsersTable(users) {
  const tableContainer = document.getElementById('usersTable');
  let html = '<table><thead><tr>';
  html += '<th>User ID</th>';
  html += '<th>Name</th>';
  html += '<th>Email</th>';
  html += '<th>Role</th>';
  html += '<th>Action</th>';
  html += '</tr></thead><tbody>';

  users.forEach((user) => {
    html += '<tr>';
    html += `<td>${user.id}</td>`;
    html += `<td>${user.name}</td>`;
    html += `<td>${user.email}</td>`;
    html += `<td>${user.role}</td>`;
    html += `<td><button class="btn-view" onclick="viewUserDetails(${user.id}, '${user.name}')">View Details</button></td>`;
    html += '</tr>';
  });

  html += '</tbody></table>';
  tableContainer.innerHTML = html;
  hideLoading('usersResults');
}

// ============ User Details Modal ============
async function viewUserDetails(userId, userName) {
  showModal();
  const modalTitle = document.getElementById('userDetailTitle');
  const modalBody = document.getElementById('userDetailBody');

  modalTitle.textContent = `${userName}'s Issued Books`;
  modalBody.innerHTML = '<p style="text-align: center;">Loading...</p>';

  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/issued_books?user_id=${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    let html = '';
    if (Array.isArray(data) && data.length > 0) {
      html = '<table style="width: 100%;"><thead><tr>';
      html += '<th>Book</th>';
      html += '<th>Status</th>';
      html += '</tr></thead><tbody>';

      data.forEach((issue) => {
        html += '<tr>';
        html += `<td>${issue.book_title || 'Unknown'}</td>`;
        html += `<td><span class="status-badge status-issued">${issue.status}</span></td>`;
        html += '</tr>';
      });

      html += '</tbody></table>';
    } else {
      html = '<p>No issued books for this user.</p>';
    }

    modalBody.innerHTML = html;
  } catch (error) {
    console.error('Error fetching user details:', error);
    modalBody.innerHTML = '<p style="color: #ff7f7f;">Failed to load user details.</p>';
  }
}

function showModal() {
  userDetailModal.style.display = 'flex';
}

function closeModal() {
  userDetailModal.style.display = 'none';
}

// ============ UI Helpers ============
function showLoading(resultId) {
  const resultsDiv = document.getElementById(resultId);
  resultsDiv.innerHTML = '<div class="loading" style="display: block;">Loading...</div>';
}

function hideLoading(resultId) {
  const loadingDiv = document.querySelector(`#${resultId} .loading`);
  if (loadingDiv) loadingDiv.style.display = 'none';
}

function showEmptyState(resultId, message) {
  const resultsDiv = document.getElementById(resultId);
  resultsDiv.innerHTML = `<div class="empty-state" style="display: block;"><p>${message}</p></div>`;
}

function showError(resultId, message) {
  const resultsDiv = document.getElementById(resultId);
  resultsDiv.innerHTML = `<div class="error-state" style="
    padding: 40px 20px;
    text-align: center;
    color: #ff7f7f;
    background: rgba(239, 83, 80, 0.1);
    border: 1px solid #ff7f7f;
    border-radius: 10px;
  "><p>${message}</p></div>`;
}
