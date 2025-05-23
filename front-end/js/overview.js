document.addEventListener("DOMContentLoaded", function () {
    if (!localStorage.getItem("jwt")) {
        window.location.href = "index.html";
        return;
    }

    const categories = ["Food", "Housing", "Hobbies", "Other"];
    const categoryApiNames = {
        Food: "food",
        Housing: "housing",
        Hobbies: "hobbies",
        Other: "other"
    };

    const tbody = document.querySelector("#categorySummaryTable tbody");
    if (tbody) {
        tbody.innerHTML = categories.map(cat =>
            `<tr><td>${cat}</td><td class="spent-cell"></td></tr>`
        ).join("");
    }

    async function fetchSpentPerCategory() {
        const token = localStorage.getItem("jwt");
        if (!token) return;

        for (const category of categories) {
            const apiCategory = categoryApiNames[category];
            try {
                const res = await fetch(
                    `${API_BASE}/httpTriggerGetSpendings?category=${apiCategory}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                if (!res.ok) throw new Error("API error");
                const data = await res.json();

                const rows = document.querySelectorAll("#categorySummaryTable tbody tr");
                rows.forEach(row => {
                    if (row.children[0].textContent.trim().toLowerCase() === category.toLowerCase()) {
                        row.children[1].textContent = (typeof data.total === "number") ? data.total.toFixed(2) : "0.00";
                    }
                });
            } catch (err) {
                const rows = document.querySelectorAll("#categorySummaryTable tbody tr");
                rows.forEach(row => {
                    if (row.children[0].textContent.trim().toLowerCase() === category.toLowerCase()) {
                        row.children[1].textContent = "0.00";
                    }
                });
            }
        }
    }

    fetchSpentPerCategory();
});