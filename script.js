document.addEventListener('DOMContentLoaded', function() {
    // Show spinner when posts are being loaded
    document.getElementById('spinner-container').style.display = 'block';

    // Generate a current timestamp
    const timestamp = new Date().getTime();
    // Build the JSON file URL with the timestamp as a query parameter
    const jsonUrl = `post.json?timestamp=${timestamp}`;

    let postsData = [];
    let currentPostIndex = 0;
    const postsPerPage = 12;

    // Fetch data from JSON file
    fetch(jsonUrl)
        .then(response => response.json())
        .then(data => {
            postsData = data;
            populateFilters(postsData); // Populate language and category filters
            loadMorePosts(); // Load initial posts
            addSearchFunctionality(postsData); // Add search functionality
        })
        .catch(error => console.error('Error fetching data:', error));

    // Function to load more posts
    function loadMorePosts() {
        const postsContainer = document.getElementById('posts-container');
        const endPostIndex = currentPostIndex + postsPerPage;
        const postsToLoad = postsData.slice(currentPostIndex, endPostIndex);

        postsToLoad.forEach((post, index) => {
            const postHTML = `
                <div class="post" data-tags="${post.tags}" data-language="${post.language}" data-category="${post.category}" style="${index >= 12 ? 'display: none;' : ''}">
                    <input type="checkbox" class="theme-checkbox">
                    <h3 class="post-title">${post.titulo}</h3>
                    <style>${post.estilos}</style>
                    ${post.contenido}
                    <a href="${post.enlace}" target="_blank"><button class="show-code-btn">Show Code { }</button></a>
                    <div class="tags-container">
                        ${post.tags.split(',').map(tag => `<div class="tag">${tag.trim()}</div>`).join('')}
                    </div>
                </div>
            `;
            postsContainer.innerHTML += postHTML;
        });

        currentPostIndex += postsPerPage;
        initializeThemeToggle(); // Initialize theme toggle functionality
        document.getElementById('spinner-container').style.display = 'none'; // Hide spinner after posts are loaded

        // Check if there are more posts to load
        if (currentPostIndex >= postsData.length) {
            // No more posts to load
            const loadMoreBtn = document.getElementById('load-more-btn');
            loadMoreBtn.textContent = 'No more elements';
            loadMoreBtn.disabled = true;
        }
    }

    // Function to toggle theme for a specific post using the checkbox
    function initializeThemeToggle() {
        const checkboxes = document.querySelectorAll('.theme-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const post = checkbox.closest('.post');
                const isChecked = checkbox.checked;
                if (isChecked) {
                    post.style.background = 'rgba(217, 217, 217, 0.90)';
                    post.style.color = 'black';
                    post.style.border = '3px solid  #6e8efb';
                    post.style.boxShadow = '0px 0px 11.3px 2px rgba(0, 0, 0, 0.25) inset';
                    const postTitle = post.querySelector('.post-title');
                    if (postTitle) postTitle.style.color = 'black';
                } else {
                    post.style.background = 'rgba(37, 35, 35, 0.9)';
                    post.style.color = '#fff';
                    post.style.border = '3px solid  #6e8efb';
                    post.style.boxShadow = '0px 0px 11.3px 4px rgba(0, 0, 0, 0.25) inset';
                    const postTitle = post.querySelector('.post-title');
                    if (postTitle) postTitle.style.color = '#fff';
                }
            });
        });
    }

    // Function to populate filters
    function populateFilters(posts) {
        const languageSelect = document.querySelector('.language-select');
        const categorySelect = document.querySelector('.category-select');

        const languages = [...new Set(posts.map(post => post.language).filter(lang => lang))];
        const categories = [...new Set(posts.map(post => post.category).filter(cat => cat))];

        languages.forEach(language => {
            const option = document.createElement('option');
            option.value = language;
            option.textContent = language;
            languageSelect.appendChild(option);
        });

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });

        // Add event listeners for filtering
        languageSelect.addEventListener('change', filterPosts);
        categorySelect.addEventListener('change', filterPosts);
    }

    // Function to filter posts based on filters
    function filterPosts() {
        const language = document.querySelector('.language-select').value;
        const category = document.querySelector('.category-select').value;
        const searchTerm = document.getElementById('search-box').value.toLowerCase();

        const posts = document.querySelectorAll('.post');
        posts.forEach(post => {
            const matchesLanguage = !language || post.dataset.language === language;
            const matchesCategory = !category || post.dataset.category === category;
            const matchesSearch = !searchTerm || post.querySelector('.post-title').textContent.toLowerCase().includes(searchTerm);

            if (matchesLanguage && matchesCategory && matchesSearch) {
                post.style.display = 'block';
            } else {
                post.style.display = 'none';
            }
        });

        const noResultsMessage = document.getElementById('no-results-message');
        const visiblePosts = Array.from(posts).some(post => post.style.display === 'block');
        noResultsMessage.style.display = visiblePosts ? 'none' : 'block';
    }

    // Function to add search functionality
    function addSearchFunctionality(posts) {
        const searchInput = document.getElementById('search-box');

        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();

            if (searchTerm === '') {
                // Clear search, reset posts order
                const postsContainer = document.getElementById('posts-container');
                postsContainer.innerHTML = '';
                currentPostIndex = 0;
                postsData.sort((a, b) => a.originalIndex - b.originalIndex); // Reset to original order
                loadMorePosts();
                return;
            }

            posts.sort((a, b) => {
                const aMatches = a.titulo.toLowerCase().includes(searchTerm);
                const bMatches = b.titulo.toLowerCase().includes(searchTerm);
                return bMatches - aMatches;
            });

            document.getElementById('posts-container').innerHTML = ''; // Clear posts
            currentPostIndex = 0; // Reset index
            loadMorePosts(); // Reload sorted posts
        });
    }
});