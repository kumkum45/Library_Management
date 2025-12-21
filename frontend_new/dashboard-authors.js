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
    const bookCount = 0; // Can enhance this with actual count
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
    // Since API doesn't have PUT endpoint for authors, we'll delete and recreate
    // Or you can implement PUT endpoint in backend
    showError('authorsResults', 'Edit functionality requires backend API update');
    
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
