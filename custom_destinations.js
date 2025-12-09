/* Custom Destination Logic */
document.addEventListener('DOMContentLoaded', () => {
    const customDestBtn = document.getElementById('addCustomDestBtn');
    const customDestModal = document.getElementById('customDestModal');
    const closeCustomDestModal = document.getElementById('closeCustomDestModal');
    const customDestForm = document.getElementById('customDestForm');

    if (customDestBtn && customDestModal) {
        customDestBtn.addEventListener('click', () => {
            customDestModal.style.display = 'flex';
        });

        if (closeCustomDestModal) {
            closeCustomDestModal.addEventListener('click', () => {
                customDestModal.style.display = 'none';
            });
        }

        window.onclick = (event) => {
            if (event.target === customDestModal) {
                customDestModal.style.display = 'none';
            }
        };

        if (customDestForm) {
            customDestForm.addEventListener('submit', (e) => {
                e.preventDefault();

                if (!auth.isLoggedIn()) {
                    alert("Please sign in to add a custom destination.");
                    customDestModal.style.display = 'none';
                    openLoginModal();
                    return;
                }

                const name = document.getElementById('customDestName').value;
                const continent = document.getElementById('customDestContinent').value;
                const description = document.getElementById('customDestDesc').value;
                const budget = parseFloat(document.getElementById('customDestBudget').value) || 0;

                const newDest = {
                    id: Date.now(),
                    name: name,
                    continent: continent,
                    description: description,
                    minBudgetDay: budget,
                    image: 'https://via.placeholder.com/300x200?text=Custom+Trip' // Default placeholder
                };

                let currentPlan = storage.getPlan();
                currentPlan.destinations.push(newDest);
                storage.savePlan(currentPlan);
                plan = currentPlan; // Update global
                updateDisplay();

                alert('Custom destination added to your plan!');
                customDestModal.style.display = 'none';
                customDestForm.reset();
            });
        }
    }
});
