// API Base URL
const API_BASE_URL = 'https://library-management-lawg.onrender.com';

// ============ Helper: Fetch with Token ============
/**
 * Make API calls with authentication token
 * Automatically adds Authorization header with Bearer token
 * Handles 401 errors by redirecting to login
 */
async function fetchWithToken(url, options = {}) {
  const token = localStorage.getItem('authToken');
  
  console.log('fetchWithToken called for:', url);
  console.log('Token available:', !!token);
  
  if (!token) {
    console.error('No token found. Redirecting to login...');
    window.location.href = 'login.html';
    return null;
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    console.log('Response status:', response.status);

    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      console.warn('Token expired or invalid. Redirecting to login...');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = 'login.html';
      return null;
    }

    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    console.error('Error message:', error.message);
    console.error('URL attempted:', url);
    console.error('Make sure backend is running at https://library-management-lawg.onrender.com');
    throw error;
  }
}

// ============ DOM Elements (Initialized in DOMContentLoaded) ============
let logoutBtn, dropdownTrigger, dropdownMenu, dropdownItems;
let booksSection, authorsSection, usersSection;
let filterBookName, filterAuthor, filterCategory, filterStatus, searchBooksBtn, resetBooksBtn, booksResults;
let usersResults, authorsResults;
let userDetailModal, closeModalBtn;
// New interactive view elements
let viewCardBtn, viewTableBtn, viewListBtn, sortBy, filterBtns;
let booksContainer, booksTable, booksListContainer, authorsContainer;
// Add/Edit book modal elements
let addBookBtn, addBookModal, closeAddBookBtn, addBookForm;
let editBookModal, closeEditBookBtn, editBookForm;
let addAuthorBtn, addAuthorModal, closeAddAuthorBtn, addAuthorForm;
let editAuthorModal, closeEditAuthorBtn, editAuthorForm;
let editBookId, editAuthorId;

// State management
let currentView = 'list'; // 'list' or 'table'
let currentBooks = [];
let currentAuthors = [];
let currentStatusFilter = 'all'; // 'all', 'available', 'issued'

// ============ Initialization ============
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded - Initializing elements...');
  
  // Select all DOM elements after DOM is ready
  logoutBtn = document.getElementById('logoutBtn');
  dropdownTrigger = document.querySelector('.dropdown__trigger');
  dropdownMenu = document.querySelector('.dropdown__menu');
  dropdownItems = document.querySelectorAll('.dropdown__item');

  // Section elements
  booksSection = document.getElementById('booksSection');
  authorsSection = document.getElementById('authorsSection');
  usersSection = document.getElementById('usersSection');

  // Books filter elements
  filterBookName = document.getElementById('filterBookName');
  filterAuthor = document.getElementById('filterAuthor');
  filterCategory = document.getElementById('filterCategory');
  filterStatus = document.getElementById('filterStatus');
  searchBooksBtn = document.getElementById('searchBooksBtn');
  resetBooksBtn = document.getElementById('resetBooksBtn');
  booksResults = document.getElementById('booksResults');
  
  // New interactive elements
  viewCardBtn = document.getElementById('viewCardBtn');
  viewTableBtn = document.getElementById('viewTableBtn');
  viewListBtn = document.getElementById('viewListBtn');
  sortBy = document.getElementById('sortBy');
  filterBtns = document.querySelectorAll('.filter-btn');
  booksContainer = document.getElementById('booksContainer');
  booksTable = document.getElementById('booksTable');
  booksListContainer = document.getElementById('booksListContainer');
  authorsContainer = document.getElementById('authorsContainer');
  
  // Add/Edit book modal elements
  addBookBtn = document.getElementById('addBookBtn');
  addBookModal = document.getElementById('addBookModal');
  closeAddBookBtn = document.getElementById('closeAddBookModal');
  addBookForm = document.getElementById('addBookForm');
  editBookModal = document.getElementById('editBookModal');
  closeEditBookBtn = document.getElementById('closeEditBookModal');
  editBookForm = document.getElementById('editBookForm');
  
  // Add/Edit author modal elements
  addAuthorBtn = document.getElementById('addAuthorBtn');
  addAuthorModal = document.getElementById('addAuthorModal');
  closeAddAuthorBtn = document.getElementById('closeAddAuthorModal');
  addAuthorForm = document.getElementById('addAuthorForm');
  editAuthorModal = document.getElementById('editAuthorModal');
  closeEditAuthorBtn = document.getElementById('closeEditAuthorModal');
  editAuthorForm = document.getElementById('editAuthorForm');

  // Issued books elements
  issuedResults = document.getElementById('issuedResults');

  // Users elements
  usersResults = document.getElementById('usersResults');

  // Modal elements
  userDetailModal = document.getElementById('userDetailModal');
  closeModalBtn = document.getElementById('closeModal');

  // Debug: Log which elements exist
  console.log('=== DOM Elements Status ===');
  console.log('booksContainer:', !!booksContainer);
  console.log('booksListContainer:', !!booksListContainer);
  console.log('booksTable:', !!booksTable);
  console.log('addBookBtn:', !!addBookBtn);
  console.log('addBookModal:', !!addBookModal);
  console.log('=== End DOM Elements Status ===');
  
  // Check if token exists, if not redirect to login
  const token = localStorage.getItem('authToken');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  console.log('Dashboard loaded');
  console.log('Token from localStorage:', token);
  console.log('User from localStorage:', user);
  
  if (!token) {
    console.warn('No token found! Redirecting to login...');
    window.location.href = 'login.html';
    return;
  }

  setupEventListeners();
  loadBooksData();
});

// ============ Setup Event Listeners ============
function setupEventListeners() {
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
  document.addEventListener('click', closeDropdownsOutside);

  // Books filters
  searchBooksBtn.addEventListener('click', searchBooks);
  resetBooksBtn.addEventListener('click', resetBooksFilters);

  // View toggle buttons - only List and Table views
  viewListBtn.addEventListener('click', () => switchView('list'));
  viewTableBtn.addEventListener('click', () => switchView('table'));

  // Sort dropdown
  sortBy.addEventListener('change', () => {
    applySort();
    renderBooks();
  });

  // Status filter buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons
      filterBtns.forEach(b => b.classList.remove('active'));
      // Add active class to clicked button
      btn.classList.add('active');
      // Update filter
      currentStatusFilter = btn.getAttribute('data-filter');
      filterAndRenderBooks();
    });
  });

  // Real-time search
  filterBookName.addEventListener('input', () => {
    filterAndRenderBooks();
  });
  filterAuthor.addEventListener('input', () => {
    filterAndRenderBooks();
  });
  filterCategory.addEventListener('input', () => {
    filterAndRenderBooks();
  });
  filterStatus.addEventListener('change', () => {
    currentStatusFilter = filterStatus.value || 'all';
    filterAndRenderBooks();
  });

  // Add Book
  addBookBtn.addEventListener('click', openAddBookModal);
  closeAddBookBtn.addEventListener('click', closeAddBookModal);
  document.getElementById('cancelAddBook').addEventListener('click', closeAddBookModal);
  addBookForm.addEventListener('submit', handleAddBook);

  // Edit Book
  closeEditBookBtn.addEventListener('click', closeEditBookModal);
  document.getElementById('cancelEditBook').addEventListener('click', closeEditBookModal);
  editBookForm.addEventListener('submit', handleEditBook);

  // Add Author
  if (addAuthorBtn) {
    addAuthorBtn.addEventListener('click', openAddAuthorModal);
  }
  if (closeAddAuthorBtn) {
    closeAddAuthorBtn.addEventListener('click', closeAddAuthorModal);
  }
  const cancelAddAuthorBtn = document.getElementById('cancelAddAuthor');
  if (cancelAddAuthorBtn) {
    cancelAddAuthorBtn.addEventListener('click', closeAddAuthorModal);
  }
  if (addAuthorForm) {
    addAuthorForm.addEventListener('submit', handleAddAuthor);
  }

  // Edit Author
  if (closeEditAuthorBtn) {
    closeEditAuthorBtn.addEventListener('click', closeEditAuthorModal);
  }
  const cancelEditAuthorBtn = document.getElementById('cancelEditAuthor');
  if (cancelEditAuthorBtn) {
    cancelEditAuthorBtn.addEventListener('click', closeEditAuthorModal);
  }
  if (editAuthorForm) {
    editAuthorForm.addEventListener('submit', handleEditAuthor);
  }

  // Close modals on background click
  addBookModal.addEventListener('click', (e) => {
    if (e.target === addBookModal) closeAddBookModal();
  });
  editBookModal.addEventListener('click', (e) => {
    if (e.target === editBookModal) closeEditBookModal();
  });

  // Modal
  closeModalBtn.addEventListener('click', closeModal);
  userDetailModal.addEventListener('click', (e) => {
    if (e.target === userDetailModal) closeModal();
  });
}

// ============ Profile & Auth ============
function toggleMenuDropdown() {
  const isOpen = dropdownMenu.style.display !== 'none';
  dropdownMenu.style.display = isOpen ? 'none' : 'block';
  dropdownTrigger.setAttribute('aria-expanded', !isOpen);
}

function closeDropdownsOutside(e) {
  if (!e.target.closest('.dropdown')) {
    dropdownMenu.style.display = 'none';
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
  } else if (section === 'authors') {
    authorsSection.style.display = 'block';
    authorsSection.classList.add('active');
    loadAuthorsData();
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
    const response = await fetchWithToken(`${API_BASE_URL}/books/search`);
    
    if (!response) return;

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      currentBooks = data;
      hideLoading('booksResults');
      applySort();
      filterAndRenderBooks();
    } else {
      showEmptyState('booksResults', 'No books available.');
    }
  } catch (error) {
    console.error('Error fetching books:', error);
    showError('booksResults', 'Failed to load books. Please try again.');
  }
}

function renderBooksTable(books) {
  currentBooks = books;
  
  if (books.length === 0) {
    showEmptyState('booksResults', 'No books found. Try adjusting your filters.');
    return;
  }

  hideLoading('booksResults');
  renderBooks();
}

// ============ Interactive View Functions ============
function switchView(view) {
  currentView = view;
  
  // Update button states
  viewListBtn.classList.remove('active');
  viewTableBtn.classList.remove('active');
  booksListContainer.style.display = 'none';
  booksTable.style.display = 'none';
  
  if (view === 'list') {
    viewListBtn.classList.add('active');
    booksListContainer.style.display = 'flex';
  } else if (view === 'table') {
    viewTableBtn.classList.add('active');
    booksTable.style.display = 'block';
  }
  
  renderBooks();
}

function renderListView(books) {
  if (!booksListContainer) return;
  
  if (books.length === 0) {
    booksListContainer.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--text-light);">No books found</div>';
    return;
  }
  
  let html = '';
  books.forEach(book => {
    const statusClass = book.status === 'available' ? 'status-available' : 'status-issued';
    const statusText = book.status === 'available' ? '✓ Available' : '✗ Issued';
    
    html += `
      <div class="book-list-row">
        <div class="book-row-icon">📖</div>
        <div class="book-row-info">
          <div class="book-row-title">${book.title}</div>
          <div class="book-row-meta">
            <span class="author">${book.author_name || 'Unknown'}</span>
            <span class="category">${book.category || 'Other'}</span>
            <span class="status ${statusClass}">${statusText}</span>
          </div>
        </div>
        <div class="book-row-actions">
          <button class="btn-action view-btn" onclick="openBookDetail(${book.id})" title="View Details">👁️</button>
          ${book.status === 'available' 
            ? `<button class="btn-action issue-btn" onclick="issueBook(${book.id})" title="Mark as Issued">📤</button>`
            : `<button class="btn-action return-btn" onclick="returnBook(${book.id})" title="Mark as Available">✓</button>`
          }
          <button class="btn-action delete-btn" onclick="showDeleteConfirm(${book.id})" title="Delete">🗑️</button>
        </div>
      </div>
    `;
  });
  
  booksListContainer.innerHTML = html;
}

function renderTableView(books) {
  if (!booksTable) return;
  
  // Filter to show only available books in table view
  const availableBooks = books.filter(b => b.status === 'available');
  
  if (availableBooks.length === 0) {
    booksTable.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--text-light);">No available books</div>';
    return;
  }
  
  let html = '<table class="books-table"><thead><tr>';
  html += '<th>Title</th>';
  html += '<th>Author</th>';
  html += '<th>Category</th>';
  html += '<th>Actions</th>';
  html += '</tr></thead><tbody>';

  availableBooks.forEach((book) => {
    html += '<tr>';
    html += `<td class="col-title">${book.title}</td>`;
    html += `<td class="col-author">${book.author_name || 'Unknown'}</td>`;
    html += `<td class="col-category">${book.category || 'Other'}</td>`;
    html += `<td class="col-actions">
      <button class="btn-action view-btn" onclick="openBookDetail(${book.id})" title="View">👁️</button>
      ${book.status === 'available' 
        ? `<button class="btn-action issue-btn" onclick="issueBook(${book.id})" title="Mark as Issued">📤</button>`
        : `<button class="btn-action return-btn" onclick="returnBook(${book.id})" title="Mark as Available">✓</button>`
      }
      <button class="btn-action delete-btn" onclick="showDeleteConfirm(${book.id})" title="Delete">🗑️</button>
    </td>`;
    html += '</tr>';
  });

  html += '</tbody></table>';
  booksTable.innerHTML = html;
}


function filterAndRenderBooks() {
  const filtered = filterBooks(currentBooks);
  renderBooks();
}

function filterBooks(books) {
  let filtered = books;
  
  // Filter by status
  if (currentStatusFilter !== 'all') {
    filtered = filtered.filter(b => b.status === currentStatusFilter);
  }
  
  // Filter by search inputs
  const nameFilter = filterBookName.value.toLowerCase();
  const authorFilter = filterAuthor.value.toLowerCase();
  const categoryFilter = filterCategory.value.toLowerCase();
  
  filtered = filtered.filter(book => {
    const titleMatch = !nameFilter || book.title.toLowerCase().includes(nameFilter);
    const authorMatch = !authorFilter || (book.author_name || '').toLowerCase().includes(authorFilter);
    const categoryMatch = !categoryFilter || (book.category || '').toLowerCase().includes(categoryFilter);
    return titleMatch && authorMatch && categoryMatch;
  });
  
  currentBooks = filtered;
  return filtered;
}

function applySort() {
  const sortValue = sortBy.value;
  
  currentBooks.sort((a, b) => {
    switch (sortValue) {
      case 'title':
        return (a.title || '').localeCompare(b.title || '');
      case 'title-desc':
        return (b.title || '').localeCompare(a.title || '');
      case 'author':
        return (a.author_name || '').localeCompare(b.author_name || '');
      case 'category':
        return (a.category || '').localeCompare(b.category || '');
      case 'status':
        return (a.status || '').localeCompare(b.status || '');
      default:
        return 0;
    }
  });
}

function getCategoryColor(category) {
  const colors = {
    'Programming': '#4CAF50',
    'Fiction': '#2196F3',
    'Science': '#9C27B0',
    'History': '#FF9800',
    'Biography': '#F44336',
    'Self-Help': '#00BCD4',
    'Mystery': '#795548',
    'Romance': '#E91E63',
  };
  return colors[category] || '#4CAF50';
}

function renderBooks() {
  const filtered = filterBooks(currentBooks);
  
  if (currentView === 'list') {
    renderListView(filtered);
  } else if (currentView === 'table') {
    renderTableView(filtered);
  }
}

function adjustColor(color, percent) {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
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
  
  if (!tableContainer) {
    console.error('issuedTable element not found in DOM');
    return;
  }
  
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
  
  if (!tableContainer) {
    console.error('usersTable element not found in DOM');
    return;
  }
  
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
  if (!resultsDiv) {
    console.error(`Element with id '${resultId}' not found`);
    return;
  }
  
  // Check if loading div already exists
  let loadingDiv = resultsDiv.querySelector('.loading');
  if (!loadingDiv) {
    loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    loadingDiv.style.display = 'block';
    loadingDiv.textContent = 'Loading...';
    resultsDiv.insertBefore(loadingDiv, resultsDiv.firstChild);
  } else {
    loadingDiv.style.display = 'block';
  }
}

function hideLoading(resultId) {
  const resultsDiv = document.getElementById(resultId);
  if (!resultsDiv) {
    console.error(`Element with id '${resultId}' not found`);
    return;
  }
  const loadingDiv = resultsDiv.querySelector('.loading');
  if (loadingDiv) loadingDiv.style.display = 'none';
}

function showEmptyState(resultId, message) {
  const resultsDiv = document.getElementById(resultId);
  if (!resultsDiv) {
    console.error(`Element with id '${resultId}' not found`);
    return;
  }
  
  // Clear the table but keep structure
  const tableContainer = resultsDiv.querySelector('[id$="Table"]');
  if (tableContainer) {
    tableContainer.innerHTML = '';
  }
  
  let emptyDiv = resultsDiv.querySelector('.empty-state');
  if (!emptyDiv) {
    emptyDiv = document.createElement('div');
    emptyDiv.className = 'empty-state';
    resultsDiv.appendChild(emptyDiv);
  }
  emptyDiv.innerHTML = `<p>${message}</p>`;
  emptyDiv.style.display = 'block';
}

function showError(resultId, message) {
  const resultsDiv = document.getElementById(resultId);
  if (!resultsDiv) {
    console.error(`Element with id '${resultId}' not found`);
    return;
  }
  
  // Clear the table but keep structure
  const tableContainer = resultsDiv.querySelector('[id$="Table"]');
  if (tableContainer) {
    tableContainer.innerHTML = '';
  }
  
  let errorDiv = resultsDiv.querySelector('.error-state');
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.className = 'error-state';
    resultsDiv.appendChild(errorDiv);
  }
  errorDiv.style.cssText = `
    padding: 40px 20px;
    text-align: center;
    color: #ff7f7f;
    background: rgba(239, 83, 80, 0.1);
    border: 1px solid #ff7f7f;
    border-radius: 10px;
  `;
  errorDiv.innerHTML = `<p>${message}</p>`;
  errorDiv.style.display = 'block';
}

// ============ ADD/EDIT BOOK FUNCTIONS ============
function openAddBookModal() {
  addBookModal.style.display = 'flex';
  addBookForm.reset();
  document.body.style.overflow = 'hidden';
}

function closeAddBookModal() {
  addBookModal.style.display = 'none';
  addBookForm.reset();
  document.body.style.overflow = 'auto';
}

function openEditBookModal(bookId) {
  const book = currentBooks.find(b => b.id === bookId);
  if (!book) {
    console.error('Book not found:', bookId);
    return;
  }
  
  editBookId = bookId;
  document.getElementById('editBookId').value = bookId;
  document.getElementById('editBookTitle').value = book.title;
  document.getElementById('editAuthorName').value = book.author_name || '';
  document.getElementById('editBookISBN').value = book.isbn || '';
  document.getElementById('editBookCategory').value = book.category || '';
  document.getElementById('editBookStatus').value = book.status || '';
  document.getElementById('editBookDescription').value = book.description || '';
  
  editBookModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeEditBookModal() {
  editBookModal.style.display = 'none';
  editBookForm.reset();
  document.body.style.overflow = 'auto';
}

async function handleAddBook(e) {
  e.preventDefault();
  
  const bookData = {
    title: document.getElementById('bookTitle').value,
    author_name: document.getElementById('authorName').value,
    isbn: document.getElementById('bookISBN').value,
    category: document.getElementById('bookCategory').value,
    status: document.getElementById('bookStatus').value,
    description: document.getElementById('bookDescription').value
  };
  
  try {
    const response = await fetchWithToken(`${API_BASE_URL}/books`, {
      method: 'POST',
      body: JSON.stringify(bookData)
    });
    
    if (response.ok) {
      console.log('Book added successfully');
      closeAddBookModal();
      loadBooksData();
      showSuccess('Book added successfully!');
    } else {
      const error = await response.json();
      showError('booksResults', error.error || 'Failed to add book');
    }
  } catch (error) {
    console.error('Error adding book:', error);
    showError('booksResults', 'Error adding book');
  }
}

async function handleEditBook(e) {
  e.preventDefault();
  
  const bookData = {
    title: document.getElementById('editBookTitle').value,
    author_name: document.getElementById('editAuthorName').value,
    isbn: document.getElementById('editBookISBN').value,
    category: document.getElementById('editBookCategory').value,
    status: document.getElementById('editBookStatus').value,
    description: document.getElementById('editBookDescription').value
  };
  
  try {
    const response = await fetchWithToken(`${API_BASE_URL}/books/${editBookId}`, {
      method: 'PUT',
      body: JSON.stringify(bookData)
    });
    
    if (response.ok) {
      console.log('Book updated successfully');
      closeEditBookModal();
      loadBooksData();
      showSuccess('Book updated successfully!');
    } else {
      const error = await response.json();
      showError('booksResults', error.error || 'Failed to update book');
    }
  } catch (error) {
    console.error('Error updating book:', error);
    showError('booksResults', 'Error updating book');
  }
}

// Delete confirmation modal
function showDeleteConfirm(bookId) {
  const modal = document.createElement('div');
  modal.className = 'delete-confirm-modal';
  modal.innerHTML = `
    <div class="modal-content confirm-modal">
      <h3>Delete Book?</h3>
      <p>Are you sure you want to delete this book? This action cannot be undone.</p>
      <div class="modal-actions">
        <button class="btn btn-cancel" onclick="closeDeleteConfirm()">Cancel</button>
        <button class="btn btn-danger" onclick="confirmDelete(${bookId})">Delete</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function closeDeleteConfirm() {
  const modal = document.querySelector('.delete-confirm-modal');
  if (modal) modal.remove();
}

async function confirmDelete(bookId) {
  closeDeleteConfirm();
  await deleteBook(bookId);
}

async function deleteBook(bookId) {
  try {
    const response = await fetchWithToken(`${API_BASE_URL}/books/${bookId}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      console.log('Book deleted successfully');
      loadBooksData();
      showSuccess('Book deleted successfully!');
    } else {
      const error = await response.json();
      showError('booksResults', error.error || 'Failed to delete book');
    }
  } catch (error) {
    console.error('Error deleting book:', error);
    showError('booksResults', 'Error deleting book');
  }
}

// Issue book
async function issueBook(bookId) {
  try {
    // First, update the book status to 'issued'
    const response = await fetchWithToken(`${API_BASE_URL}/books/${bookId}`, {
      method: 'PUT',
      body: JSON.stringify({
        status: 'issued'
      })
    });

    if (response.ok) {
      console.log('Book marked as issued');
      loadBooksData();
      showSuccess('Book marked as issued!');
    } else {
      const error = await response.json();
      showError('booksResults', error.error || 'Failed to issue book');
    }
  } catch (error) {
    console.error('Error issuing book:', error);
    showError('booksResults', 'Error marking book as issued');
  }
}

// Mark issued book as available
async function returnBook(bookId) {
  try {
    // Update the book status to 'available'
    const response = await fetchWithToken(`${API_BASE_URL}/books/${bookId}`, {
      method: 'PUT',
      body: JSON.stringify({
        status: 'available'
      })
    });

    if (response.ok) {
      console.log('Book marked as available');
      loadBooksData();
      showSuccess('Book marked as available!');
    } else {
      const error = await response.json();
      showError('booksResults', error.error || 'Failed to return book');
    }
  } catch (error) {
    console.error('Error returning book:', error);
    showError('booksResults', 'Error marking book as available');
  }
}

// View book details
function openBookDetail(bookId) {
  const book = currentBooks.find(b => b.id === bookId);
  if (book) {
    alert(`Book Details:\n\nTitle: ${book.title}\nAuthor: ${book.author_name}\nCategory: ${book.category}\nStatus: ${book.status}\nISBN: ${book.isbn || 'N/A'}\nDescription: ${book.description || 'N/A'}`);
  }
}

function showSuccess(message) {
  // Create a temporary toast notification
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10B981;
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    animation: slideIn 300ms ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 300ms ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============ AUTHOR MANAGEMENT FUNCTIONS ============

// Load authors data
async function loadAuthorsData() {
  try {
    const response = await fetchWithToken(`${API_BASE_URL}/authors`, { method: 'GET' });
    
    if (!response || !response.ok) {
      showError('authorsResults', 'Failed to load authors');
      return;
    }

    currentAuthors = await response.json();
    renderAuthors();
  } catch (error) {
    console.error('Error loading authors:', error);
    showError('authorsResults', 'Error loading authors');
  }
}

// Render authors as cards
function renderAuthors() {
  if (!authorsContainer) return;
  
  if (currentAuthors.length === 0) {
    authorsContainer.innerHTML = '<div style="grid-column: 1/-1; padding: 40px; text-align: center; color: var(--text-light);">No authors yet. Add one to get started!</div>';
    return;
  }

  let html = '';
  currentAuthors.forEach((author) => {
    html += `
      <div class="author-card">
        <div class="author-card__header">
          <div class="author-card__icon">✍️</div>
          <div class="author-card__info">
            <h3 class="author-card__name">${author.name}</h3>
            <p class="author-card__bio">${author.bio || 'No biography added'}</p>
          </div>
        </div>
        <div class="author-card__actions">
          <button onclick="editAuthorClick(${author.id})" style="flex: 1;">Edit</button>
          <button onclick="deleteAuthorClick(${author.id})" class="delete-btn" style="flex: 1;">Delete</button>
        </div>
      </div>
    `;
  });

  authorsContainer.innerHTML = html;
}

// Open add author modal
function openAddAuthorModal() {
  if (addAuthorModal) {
    addAuthorModal.style.display = 'flex';
    document.getElementById('authorNameInput').focus();
  }
}

// Close add author modal
function closeAddAuthorModal() {
  if (addAuthorModal) {
    addAuthorModal.style.display = 'none';
    if (addAuthorForm) {
      addAuthorForm.reset();
    }
  }
}

// Handle add author form submission
async function handleAddAuthor(e) {
  e.preventDefault();
  
  const name = document.getElementById('authorNameInput').value.trim();
  const bio = document.getElementById('authorBio').value.trim();

  if (!name) {
    showError('authorsResults', 'Author name is required');
    return;
  }

  try {
    const response = await fetchWithToken(`${API_BASE_URL}/authors`, {
      method: 'POST',
      body: JSON.stringify({
        name: name,
        bio: bio
      })
    });

    if (response && response.ok) {
      closeAddAuthorModal();
      showSuccess('Author added successfully!');
      loadAuthorsData();
    } else {
      const error = await response.json();
      showError('authorsResults', error.message || 'Failed to add author');
    }
  } catch (error) {
    console.error('Error adding author:', error);
    showError('authorsResults', 'Error adding author');
  }
}

// Open edit author modal
async function editAuthorClick(authorId) {
  const author = currentAuthors.find(a => a.id === authorId);
  if (!author) return;

  editAuthorId = authorId;
  document.getElementById('editAuthorId').value = authorId;
  document.getElementById('editAuthorNameInput').value = author.name;
  document.getElementById('editAuthorBio').value = author.bio || '';

  if (editAuthorModal) {
    editAuthorModal.style.display = 'flex';
    document.getElementById('editAuthorNameInput').focus();
  }
}

// Close edit author modal
function closeEditAuthorModal() {
  if (editAuthorModal) {
    editAuthorModal.style.display = 'none';
    if (editAuthorForm) {
      editAuthorForm.reset();
    }
    editAuthorId = null;
  }
}

// Handle edit author form submission
async function handleEditAuthor(e) {
  e.preventDefault();

  const authorId = document.getElementById('editAuthorId').value;
  const name = document.getElementById('editAuthorNameInput').value.trim();
  const bio = document.getElementById('editAuthorBio').value.trim();

  if (!name) {
    showError('authorsResults', 'Author name is required');
    return;
  }

  try {
    const response = await fetchWithToken(`${API_BASE_URL}/authors/${authorId}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: name,
        bio: bio
      })
    });

    if (response && response.ok) {
      closeEditAuthorModal();
      showSuccess('Author updated successfully!');
      loadAuthorsData();
    } else {
      const error = await response.json();
      showError('authorsResults', error.message || 'Failed to update author');
    }
  } catch (error) {
    console.error('Error editing author:', error);
    showError('authorsResults', 'Error editing author');
  }
}

// Delete author
async function deleteAuthorClick(authorId) {
  if (!confirm('Are you sure you want to delete this author?')) {
    return;
  }

  try {
    const response = await fetchWithToken(`${API_BASE_URL}/authors/${authorId}`, {
      method: 'DELETE'
    });

    if (response && response.ok) {
      showSuccess('Author deleted successfully!');
      loadAuthorsData();
    } else {
      const error = await response.json();
      showError('authorsResults', error.message || 'Failed to delete author');
    }
  } catch (error) {
    console.error('Error deleting author:', error);
    showError('authorsResults', 'Error deleting author');
  }
}
