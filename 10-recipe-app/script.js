// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const favoritesBtn = document.getElementById('favoritesBtn');
const filtersBtn = document.getElementById('filtersBtn');
const filtersPanel = document.getElementById('filtersPanel');
const applyFiltersBtn = document.getElementById('applyFilters');
const clearFiltersBtn = document.getElementById('clearFilters');
const recipeGrid = document.getElementById('recipeGrid');
const recipeModal = document.getElementById('recipeModal');
const closeModalBtn = document.getElementById('closeModal');
const loading = document.getElementById('loading');
const noResults = document.getElementById('noResults');

// State
let recipes = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let activeFilters = {
    categories: [],
    cuisines: [],
    dietary: []
};
let currentView = 'all'; // 'all' or 'favorites'

// Sample Recipe Data (Replace with API calls)
const sampleRecipes = [
    {
        id: 1,
        title: "Spaghetti Carbonara",
        image: "SpaghettiCarbonara.jpg",
        prepTime: "30 mins",
        servings: 4,
        difficulty: "Medium",
        categories: ["dinner"],
        cuisines: ["italian"],
        dietary: [],
        tags: ["pasta", "quick", "classic"],
        ingredients: [
            "400g spaghetti",
            "200g pancetta",
            "4 large eggs",
            "100g Pecorino Romano",
            "100g Parmigiano Reggiano",
            "Black pepper",
            "Salt"
        ],
        instructions: [
            "Bring a large pot of salted water to boil and cook spaghetti according to package instructions.",
            "While pasta cooks, cut pancetta into small cubes and fry until crispy.",
            "In a bowl, whisk eggs and grated cheeses together.",
            "Drain pasta, reserving some pasta water.",
            "Working quickly, mix pasta with egg mixture, adding pasta water as needed.",
            "Add pancetta and plenty of black pepper.",
            "Serve immediately with extra cheese."
        ],
        nutrition: {
            calories: 650,
            protein: "30g",
            carbs: "70g",
            fat: "25g"
        }
    },
    // Add more recipes...
];

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    recipes = sampleRecipes;
    renderRecipes();
});

searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

favoritesBtn.addEventListener('click', toggleFavorites);
filtersBtn.addEventListener('click', toggleFilters);
applyFiltersBtn.addEventListener('click', applyFilters);
clearFiltersBtn.addEventListener('click', clearFilters);
closeModalBtn.addEventListener('click', closeModal);

// Recipe Rendering Functions
function renderRecipes(filteredRecipes = recipes) {
    showLoading();
    recipeGrid.innerHTML = '';
    
    const recipesToShow = currentView === 'favorites' 
        ? filteredRecipes.filter(recipe => favorites.includes(recipe.id))
        : filteredRecipes;
    
    if (recipesToShow.length === 0) {
        showNoResults();
        return;
    }
    
    recipesToShow.forEach(recipe => {
        const card = createRecipeCard(recipe);
        recipeGrid.appendChild(card);
    });
    
    hideLoading();
    noResults.classList.add('hidden');
}

function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.innerHTML = `
        <img src="${recipe.image}" alt="${recipe.title}">
        <div class="recipe-card-content">
            <h3>${recipe.title}</h3>
            <div class="recipe-card-meta">
                <span><i class="fas fa-clock"></i> ${recipe.prepTime}</span>
                <span><i class="fas fa-user"></i> ${recipe.servings} servings</span>
            </div>
            <div class="recipe-card-tags">
                ${recipe.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => showRecipeDetails(recipe));
    return card;
}

function showRecipeDetails(recipe) {
    const modal = document.getElementById('recipeModal');
    const content = modal.querySelector('.recipe-details');
    
    content.innerHTML = `
        <div class="recipe-header">
            <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">
            <div class="recipe-info">
                <h2 class="recipe-title">${recipe.title}</h2>
                <div class="recipe-meta">
                    <span class="prep-time">
                        <i class="fas fa-clock"></i>
                        <span>${recipe.prepTime}</span>
                    </span>
                    <span class="servings">
                        <i class="fas fa-users"></i>
                        <span>${recipe.servings} servings</span>
                    </span>
                    <span class="difficulty">
                        <i class="fas fa-chart-line"></i>
                        <span>${recipe.difficulty}</span>
                    </span>
                </div>
                <div class="recipe-tags">
                    ${recipe.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <button class="favorite-btn ${favorites.includes(recipe.id) ? 'active' : ''}" 
                        onclick="toggleFavoriteRecipe(${recipe.id}, event)">
                    <i class="fa${favorites.includes(recipe.id) ? 's' : 'r'} fa-heart"></i>
                </button>
            </div>
        </div>
        <div class="recipe-content">
            <div class="ingredients">
                <h3>Ingredients</h3>
                <ul class="ingredients-list">
                    ${recipe.ingredients.map(ingredient => `
                        <li>${ingredient}</li>
                    `).join('')}
                </ul>
            </div>
            <div class="instructions">
                <h3>Instructions</h3>
                <ol class="instructions-list">
                    ${recipe.instructions.map(instruction => `
                        <li>${instruction}</li>
                    `).join('')}
                </ol>
            </div>
            <div class="nutrition">
                <h3>Nutrition Information</h3>
                <div class="nutrition-grid">
                    ${Object.entries(recipe.nutrition).map(([key, value]) => `
                        <div class="nutrition-item">
                            <div class="value">${value}</div>
                            <div class="label">${key}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Search and Filter Functions
function handleSearch() {
    const query = searchInput.value.toLowerCase().trim();
    
    if (!query) {
        renderRecipes();
        return;
    }
    
    const filteredRecipes = recipes.filter(recipe => {
        return recipe.title.toLowerCase().includes(query) ||
               recipe.tags.some(tag => tag.toLowerCase().includes(query)) ||
               recipe.ingredients.some(ingredient => ingredient.toLowerCase().includes(query));
    });
    
    renderRecipes(filteredRecipes);
}

function toggleFilters() {
    filtersPanel.classList.toggle('hidden');
}

function applyFilters() {
    activeFilters = {
        categories: getSelectedFilters('categoryFilters'),
        cuisines: getSelectedFilters('cuisineFilters'),
        dietary: getSelectedFilters('dietaryFilters')
    };
    
    const filteredRecipes = recipes.filter(recipe => {
        const categoryMatch = activeFilters.categories.length === 0 ||
            activeFilters.categories.some(category => recipe.categories.includes(category));
            
        const cuisineMatch = activeFilters.cuisines.length === 0 ||
            activeFilters.cuisines.some(cuisine => recipe.cuisines.includes(cuisine));
            
        const dietaryMatch = activeFilters.dietary.length === 0 ||
            activeFilters.dietary.every(requirement => recipe.dietary.includes(requirement));
            
        return categoryMatch && cuisineMatch && dietaryMatch;
    });
    
    renderRecipes(filteredRecipes);
    filtersPanel.classList.add('hidden');
}

function getSelectedFilters(containerId) {
    const container = document.getElementById(containerId);
    const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(checkbox => checkbox.value);
}

function clearFilters() {
    const checkboxes = filtersPanel.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = false);
    activeFilters = { categories: [], cuisines: [], dietary: [] };
    renderRecipes();
}

// Favorites Management
function toggleFavorites() {
    currentView = currentView === 'all' ? 'favorites' : 'all';
    favoritesBtn.classList.toggle('active');
    renderRecipes();
}

function toggleFavoriteRecipe(recipeId, event) {
    event.stopPropagation();
    const index = favorites.indexOf(recipeId);
    
    if (index === -1) {
        favorites.push(recipeId);
    } else {
        favorites.splice(index, 1);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    const btn = event.currentTarget;
    btn.classList.toggle('active');
    btn.innerHTML = `<i class="fa${favorites.includes(recipeId) ? 's' : 'r'} fa-heart"></i>`;
    
    if (currentView === 'favorites') {
        renderRecipes();
    }
}

// Modal Management
function closeModal() {
    recipeModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Loading State Management
function showLoading() {
    loading.classList.remove('hidden');
    recipeGrid.classList.add('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
    recipeGrid.classList.remove('hidden');
}

function showNoResults() {
    noResults.classList.remove('hidden');
    recipeGrid.classList.add('hidden');
    hideLoading();
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === recipeModal) {
        closeModal();
    }
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !recipeModal.classList.contains('hidden')) {
        closeModal();
    }
}); 