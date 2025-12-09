// LocalStorage Management
const storage = {
  getPlan() {
    const saved = localStorage.getItem("tripPlan")
    if (!saved) {
      return {
        wallet: 5000,
        destinations: [],
        itinerary: []
      }
    }

    let plan = JSON.parse(saved);

    // Data Migration: Convert old structure to new itinerary array if needed
    if (!plan.itinerary && (plan.flights || plan.hotels || plan.activities)) {
      console.log("Migrating data to unified itinerary...");
      plan.itinerary = [];

      if (plan.flights) {
        plan.flights.forEach(f => plan.itinerary.push({ ...f, type: 'flight' }));
        delete plan.flights;
      }
      if (plan.hotels) {
        plan.hotels.forEach(h => plan.itinerary.push({ ...h, type: 'hotel' }));
        delete plan.hotels;
      }
      if (plan.activities) {
        plan.activities.forEach(a => plan.itinerary.push({ ...a, type: 'activity' }));
        delete plan.activities;
      }
      localStorage.setItem("tripPlan", JSON.stringify(plan));
    }

    // Ensure itinerary exists
    if (!plan.itinerary) plan.itinerary = [];

    return plan;
  },

  savePlan(plan) {
    localStorage.setItem("tripPlan", JSON.stringify(plan))
  },

  clearAll() {
    localStorage.removeItem("tripPlan")
  },
}




// Initialize Plan
let plan = storage.getPlan()

// Utility: Get budget category
function getBudgetCategory(minBudget, maxBudget) {
  if (maxBudget < 800) return "budget"
  if (minBudget > 1500) return "luxury"
  return "mid"
}





// Dark mode management
function initDarkMode() {
  const darkModeToggle = document.getElementById("darkModeToggle")
  const isDarkMode = localStorage.getItem("darkMode") === "true"

  if (isDarkMode) {
    document.body.classList.add("dark-mode")
    if (darkModeToggle) darkModeToggle.textContent = "☀️"
  }

  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode")
      const newDarkMode = document.body.classList.contains("dark-mode")
      localStorage.setItem("darkMode", newDarkMode)
      darkModeToggle.textContent = newDarkMode ? "☀️" : "🌙"
    })
  }
}

initDarkMode()





// Mobile Menu Toggle
const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");
const links = document.querySelectorAll(".nav-links li");

if (hamburger) {
  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    hamburger.classList.toggle("toggle");
  });
}




/*----------------------------------la logique d'authentification---------------------------------done*/
const auth = {
  login(username) {
    localStorage.setItem("user", username);
    this.updateUI();
    window.location.reload(); // Refresh to update UI/State
  },
  logout() {
    localStorage.removeItem("user");
    this.updateUI();
    window.location.reload();
  },
  getUser() {
    return localStorage.getItem("user");
  },
  isLoggedIn() {
    return !!this.getUser();
  },
  updateUI() {
    const user = this.getUser();
    const loginBtn = document.getElementById("loginBtn");

    if (loginBtn) {
      if (user) {
        loginBtn.textContent = user; // Show username
        loginBtn.onclick = () => {
          if (confirm("Do you want to logout?")) {
            auth.logout();
          }
        };
      } else {
        loginBtn.textContent = "Sign In";
        loginBtn.onclick = () => openLoginModal();
      }
    }
  }
};

/*----------------------------------la logique de la modal---------------------------------done*/
const loginModal = document.getElementById("loginModal");
const closeModal = document.querySelector(".close-modal");
const loginForm = document.getElementById("loginForm");

function openLoginModal() {
  console.log("Opening login modal");
  if (loginModal) {
    loginModal.style.display = "flex";
    setTimeout(() => {
      const input = document.getElementById("username");
      if (input) input.focus();
    }, 100);
  } else {
    console.error("Login modal element not found!");
  }
}

if (closeModal) {
  closeModal.onclick = () => loginModal.style.display = "none";
}

window.onclick = (event) => {
  if (event.target === loginModal) {
    loginModal.style.display = "none";
  }
}

if (loginForm) {
  loginForm.onsubmit = (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    if (username) {
      auth.login(username);
      loginModal.style.display = "none";
    }
  };
}

// Initial UI Update
auth.updateUI();









/*----------------------------------la logique de drag and drop---------------------------------done*/
let draggedItem = null;

function formatDate(date) {
  if (!date) return 'TBD';
  return new Date(date).toLocaleDateString();
}

function handleDragStart(e) {
  this.style.opacity = '0.4';
  draggedItem = this;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragEnter(e) {
  if (this !== draggedItem) {
    this.classList.add('drag-over');
  }
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = 'move';
  return false;
}

function handleDragLeave(e) {
  this.classList.remove('drag-over');
}

function handleDrop(e) {
  if (e.stopPropagation) e.stopPropagation();
  this.classList.remove('drag-over');

  if (draggedItem && draggedItem !== this) {
    // Reorder Data
    const fromIndex = Number(draggedItem.dataset.index);
    const toIndex = Number(this.dataset.index);

    const movedItem = plan.itinerary.splice(fromIndex, 1)[0];
    plan.itinerary.splice(toIndex, 0, movedItem);

    storage.savePlan(plan);
    updateDisplay();
  }
  return false;
}

function handleDragEnd(e) {
  this.style.opacity = '1';
  this.classList.remove('dragging');
  const items = document.querySelectorAll('.itinerary-item');
  items.forEach(item => item.classList.remove('drag-over'));
}

// Update display
function updateDisplay() {
  plan = storage.getPlan()

  // Update wallet
  const walletAmount = document.getElementById('walletAmount'); // Ensure getting element
  if (walletAmount) walletAmount.textContent = plan.wallet

  // Calculate total spent
  const totalSpentAmount = plan.itinerary.reduce((sum, item) => sum + item.cost, 0);

  const totalSpent = document.getElementById('totalSpent');
  const remaining = document.getElementById('remaining');

  if (totalSpent) totalSpent.textContent = totalSpentAmount.toFixed(2)
  if (remaining) remaining.textContent = (plan.wallet - totalSpentAmount).toFixed(2)

  // Planned destinations
  const plannedDestinations = document.getElementById('plannedDestinations');
  const emptyState = document.getElementById('emptyState');

  if (plannedDestinations && emptyState) {
    if (plan.destinations.length === 0) {
      plannedDestinations.innerHTML = ""
      emptyState.style.display = "block"
    } else {
      emptyState.style.display = "none"
      plannedDestinations.innerHTML = plan.destinations
        .map(
          (dest) => `
                    <div class="planned-destination">
                        <button class="remove-destination" onclick="removeDestination(${dest.id})">Remove</button>
                        <img src="${dest.image}" alt="${dest.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; display: inline-block; vertical-align: middle; margin-right: 10px;">
                        <div style="display: inline-block; vertical-align: middle;">
                            <h4>${dest.name}</h4>
                            <p>${dest.continent}</p>
                            <p>Min Budget: $${dest.minBudgetDay}/day</p>
                        </div>
                    </div>
                `,
        )
        .join("")
    }
  }

  // Itinerary List
  const itineraryList = document.getElementById("itineraryList");
  if (itineraryList) {
    itineraryList.innerHTML = "";

    plan.itinerary.forEach((item, index) => {
      const el = document.createElement('div');
      el.className = `itinerary-item type-${item.type} ${item.completed ? 'completed' : ''}`;
      el.dataset.index = index; // Add index for drag & drop
      el.draggable = true;
      el.addEventListener('dragstart', handleDragStart);
      el.addEventListener('dragenter', handleDragEnter);
      el.addEventListener('dragover', handleDragOver);
      el.addEventListener('dragleave', handleDragLeave);
      el.addEventListener('drop', handleDrop);
      el.addEventListener('dragend', handleDragEnd);

      let content = '';
      if (item.type === 'flight') {
        content = `
          <div class="itinerary-icon">✈️</div>
          <div class="itinerary-details">
            <h4>Flight: ${item.details}</h4>
            <p>Date: ${item.date}</p>
            <p>Cost: $${item.cost.toFixed(2)}</p>
          </div>
        `;
      } else if (item.type === 'hotel') {
        content = `
          <div class="itinerary-icon">🏨</div>
          <div class="itinerary-details">
            <h4>Hotel: ${item.details}</h4>
            <p>Date: ${item.date} (${item.nights} nights)</p>
            <p>Cost: $${item.cost.toFixed(2)} ($${item.costPerNight}/night)</p>
          </div>
        `;
      } else if (item.type === 'activity') {
        content = `
          <div class="itinerary-icon">🎫</div>
          <div class="itinerary-details">
            <h4>Activity: ${item.details}</h4>
            <p>Date: ${item.date}</p>
            <p>Cost: $${item.cost.toFixed(2)}</p>
          </div>
        `;
      }

      el.innerHTML = `
        ${content}
        <div class="itinerary-controls">
           <button class="btn-did" onclick="toggleDid(${item.id})" title="Mark as done">${item.completed ? 'Undo' : 'Did'}</button>
           <button class="btn-remove" onclick="removeItineraryItem(${item.id})" title="Remove item">❌</button>
        </div>
      `;

      itineraryList.appendChild(el);
    });
  }
}

updateDisplay();





































/*---------------------------------------Grille des destinations---------------------------------------done*/

function initDestinationsGrid() {
  console.log("Initializing Destinations Grid...");
  const grid = document.querySelector('.destinations-grid');

  if (!grid) {
    console.warn("Destinations grid container not found");
    return;
  }

  const continentFilter = document.getElementById('continentFilter');
  const budgetFilter = document.getElementById('budgetFilter');
  const isExplorePage = !!continentFilter; // If filters exist, we are on Explore page
  const resetBtn = document.getElementById('resetFilters');
  const noResults = document.getElementById('noResults');

  if (typeof destinations === 'undefined') {
    grid.innerHTML = '<p style="text-align:center; padding: 2rem;">Error: Destinations data not found. Please check data.js.</p>';
    console.error("Destinations data is undefined");
    return;
  }

  console.log("Destinations loaded:", destinations.length);

  function render(items) {
    console.log("Rendering items:", items.length);
    grid.innerHTML = items.map(dest => {
      // Safety check for minBudgetDay
      const budget = dest.minBudgetDay !== undefined ? `$${dest.minBudgetDay} / day` : 'N/A';

      return `
            <div class="destination-card">
                <div class="card-image"><img src="${dest.image}" alt="${dest.name}" onerror="this.onerror=null;this.src='https://via.placeholder.com/300x200?text=No+Image'"></div>
                <div class="card-info">
                    <div class="card-title">${dest.name}</div>
                    <div class="card-continent">${dest.continent}</div>
                    <div class="card-description">${dest.description}</div>
                    <div class="destination-footer">
                        <div class="card-price">From ${budget}</div>
                        ${isExplorePage ? `<button class="btn btn-primary" onclick="addToPlan(${dest.id})">Add to Plan</button>` : ''}
                    </div>
                </div>
            </div>
        `}).join('');

    if (noResults) {
      noResults.style.display = items.length === 0 ? 'block' : 'none';
    }
  }

  // Initial render
  if (!isExplorePage) {
    // Popular destinations - top 4 for home page
    render(destinations.slice(0, 4));
  } else {
    render(destinations); // Show all on explore page
  }

  // Filter Logic
  if (isExplorePage && continentFilter && budgetFilter) {
    function filterDestinations() {
      const continent = continentFilter.value;
      const budget = budgetFilter.value;

      console.log("Filtering:", { continent, budget });

      const filtered = destinations.filter(dest => {
        const matchContinent = continent === 'all' || dest.continent === continent;
        let matchBudget = false;

        const cost = dest.minBudgetDay || 0;

        if (budget === 'all') matchBudget = true;
        else if (budget === 'low') matchBudget = cost < 100;
        else if (budget === 'medium') matchBudget = cost >= 100 && cost <= 200;
        else if (budget === 'high') matchBudget = cost > 200;

        return matchContinent && matchBudget;
      });
      render(filtered);
    }

    continentFilter.addEventListener('change', filterDestinations);
    budgetFilter.addEventListener('change', filterDestinations);

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        continentFilter.value = 'all';
        budgetFilter.value = 'all';
        render(destinations);
      });
    }
  }
}

/*---------------------------------------Ajout d'une destination---------------------------------------done*/
window.addToPlan = function (id) {
  if (!auth.isLoggedIn()) {
    openLoginModal();
    return;
  }

  const dest = destinations.find(d => d.id === id);
  if (!dest) return;

  let currentPlan = storage.getPlan();

  if (currentPlan.destinations.some(d => d.id === id)) {
    alert(`${dest.name} is already in your plan!`);
    return;
  }

  currentPlan.destinations.push(dest);
  storage.savePlan(currentPlan);

  plan = currentPlan; // Update global plan var
  updateDisplay();

  alert(`${dest.name} has been added to your plan!`);
};
















/*---------------------------------------Suppression d'une destination---------------------------------------done*/
window.removeDestination = function (id) {
  let currentPlan = storage.getPlan();
  currentPlan.destinations = currentPlan.destinations.filter(d => d.id !== id);
  storage.savePlan(currentPlan);
  plan = currentPlan;
  updateDisplay();
};

window.removeItineraryItem = function (id) {
  let currentPlan = storage.getPlan();
  currentPlan.itinerary = currentPlan.itinerary.filter(i => i.id !== id);
  storage.savePlan(currentPlan);
  plan = currentPlan;
  updateDisplay();
}

// Toggle "Did" status
window.toggleDid = function (id) {
  let currentPlan = storage.getPlan();
  const item = currentPlan.itinerary.find(i => i.id === id);
  if (item) {
    item.completed = !item.completed;
    storage.savePlan(currentPlan);
    plan = currentPlan;
    updateDisplay();
  }
};
























/*---------------------------------------Réglage ajout de vol---------------------------------------done*/
const addFlightBtn = document.getElementById('addFlightBtn');
if (addFlightBtn) {
  addFlightBtn.addEventListener('click', () => {
    const details = document.getElementById('flightInput').value;
    const date = document.getElementById('flightDateInput').value;
    const cost = parseFloat(document.getElementById('flightCostInput').value) || 0;

    if (!details || !date) {
      alert("Please fill in flight details and date.");
      return;
    }

    const newItem = {
      id: Date.now(),
      type: 'flight',
      details,
      date,
      cost,
      completed: false
    };

    let currentPlan = storage.getPlan();
    currentPlan.itinerary.push(newItem);
    storage.savePlan(currentPlan);
    plan = currentPlan;
    updateDisplay();

    // Clear inputs
    document.getElementById('flightInput').value = '';
    document.getElementById('flightDateInput').value = '';
    document.getElementById('flightCostInput').value = '';
  });
}
/*---------------------------------------Réglage ajout d'hotel---------------------------------------done*/

const addHotelBtn = document.getElementById('addHotelBtn');
if (addHotelBtn) {
  addHotelBtn.addEventListener('click', () => {
    const details = document.getElementById('hotelInput').value;
    const date = document.getElementById('hotelDateInput').value;
    const costPerNight = parseFloat(document.getElementById('hotelCostInput').value) || 0;
    const nights = parseInt(document.getElementById('hotelNightsInput').value) || 1;
    const cost = costPerNight * nights;

    if (!details || !date) {
      alert("Please fill in hotel details and date.");
      return;
    }

    const newItem = {
      id: Date.now(),
      type: 'hotel',
      details,
      date,
      cost,
      nights,
      costPerNight,
      completed: false
    };

    let currentPlan = storage.getPlan();
    currentPlan.itinerary.push(newItem);
    storage.savePlan(currentPlan);
    plan = currentPlan;
    updateDisplay();

    // Clear inputs
    document.getElementById('hotelInput').value = '';
    document.getElementById('hotelDateInput').value = '';
    document.getElementById('hotelCostInput').value = '';
    document.getElementById('hotelNightsInput').value = '1';
  });
}

/*---------------------------------------Réglage ajout d'activités---------------------------------------done*/
const addActivityBtn = document.getElementById('addActivityBtn');
if (addActivityBtn) {
  addActivityBtn.addEventListener('click', () => {
    const details = document.getElementById('activityInput').value;
    const date = document.getElementById('activityDateInput').value;
    const cost = parseFloat(document.getElementById('activityCostInput').value) || 0;

    if (!details || !date) {
      alert("Please fill in activity details and date.");
      return;
    }

    const newItem = {
      id: Date.now(),
      type: 'activity',
      details,
      date,
      cost,
      completed: false
    };

    let currentPlan = storage.getPlan();
    currentPlan.itinerary.push(newItem);
    storage.savePlan(currentPlan);
    plan = currentPlan;
    updateDisplay();

    // Clear inputs
    document.getElementById('activityInput').value = '';
    document.getElementById('activityDateInput').value = '';
    document.getElementById('activityCostInput').value = '';
  });
}


// Clear Plan Button Logic
const clearPlanBtn = document.getElementById('clearPlanBtn');
if (clearPlanBtn) {
  clearPlanBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to clear your entire plan? This will remove all destinations and itinerary items.")) {
      let currentPlan = storage.getPlan(); // Get fresh copy
      currentPlan.destinations = [];
      currentPlan.itinerary = [];
      // Keeping wallet intact based on typical user expectation, or reset if needed.

      storage.savePlan(currentPlan);
      plan = currentPlan; // Update global state
      updateDisplay();
      // alert("Your plan has been cleared."); // Optional feedback
    }
  });
}

/*---------------------------------------Réglage de budge---------------------------------------done*/
const setBudgetBtn = document.getElementById('setBudgetBtn');
if (setBudgetBtn) {
  setBudgetBtn.addEventListener('click', () => {
    const budgetInput = document.getElementById('budgetInput');
    const budget = parseFloat(budgetInput.value);

    if (isNaN(budget) || budget < 0) {
      alert("Please enter a valid budget amount.");
      return;
    }

    let currentPlan = storage.getPlan();
    currentPlan.wallet = budget;
    storage.savePlan(currentPlan);
    plan = currentPlan;
    updateDisplay();

    // Clear input
    budgetInput.value = '';
    alert(`Budget set to $${budget}`);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initDestinationsGrid();
  // Also re-run updateDisplay to ensure elements are found
  updateDisplay();
});
