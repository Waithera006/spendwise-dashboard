// ELEMENTS
const form = document.querySelector("#expenseForm");
const nameInput = document.querySelector("#name");
const amountInput = document.querySelector("#amount");
const categoryInput = document.querySelector("#category");
const filter = document.querySelector("#filter");
const list = document.querySelector("#expenseList");
const totalDisplay = document.querySelector("#total");
const exportBtn = document.querySelector("#exportBtn");

// DATA & STATE
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let chart;
let editId = null;

// EVENT LISTENERS
form.addEventListener("submit", addExpense);
filter.addEventListener("change", displayExpenses);
exportBtn.addEventListener("click", exportToCSV);

// ADD / EDIT EXPENSE
function addExpense(e) {
    e.preventDefault();

    if (!nameInput.value || !amountInput.value || !categoryInput.value) {
        alert("Please fill all fields");
        return;
    }

    const expense = {
        id: Date.now(),
        name: nameInput.value,
        amount: Number(amountInput.value),
        category: categoryInput.value,
        date: new Date().toISOString()
    };

    if (editId) {
        expenses = expenses.map(exp =>
            exp.id === editId
                ? { ...exp, name: nameInput.value, amount: Number(amountInput.value), category: categoryInput.value }
                : exp
        );
        editId = null;
    } else {
        expenses.push(expense);
    }

    form.querySelector("button").textContent = "Add Expense";
    saveAndRender();
    form.reset();
}

// DELETE EXPENSE
function deleteExpense(id) {
    expenses = expenses.filter(exp => exp.id !== id);
    saveAndRender();
}

// EDIT EXPENSE
function editExpense(id) {
    const expense = expenses.find(exp => exp.id === id);
    nameInput.value = expense.name;
    amountInput.value = expense.amount;
    categoryInput.value = expense.category;
    editId = id;
    form.querySelector("button").textContent = "Update Expense";
}

// DISPLAY EXPENSES
function displayExpenses() {
    list.innerHTML = "";

    const selected = filter.value;
    const filteredExpenses = selected === "All"
        ? expenses
        : expenses.filter(exp => exp.category === selected);

    filteredExpenses.forEach(exp => {
        const li = document.createElement("li");
        li.innerHTML = `
            ${exp.name} (${exp.category}) - Ksh ${exp.amount}
            <div>
                <button onclick="editExpense(${exp.id})">Edit</button>
                <button class="delete" onclick="deleteExpense(${exp.id})">X</button>
            </div>
        `;
        list.appendChild(li);
    });
}

// MONTHLY AGGREGATION
function getMonthlyTotals() {
    const monthlyTotals = {};

    expenses.forEach(expense => {
        const date = new Date(expense.date);
        const month = date.toLocaleString("default", { month: "long", year: "numeric" });

        if (!monthlyTotals[month]) monthlyTotals[month] = 0;
        monthlyTotals[month] += expense.amount;
    });

    return monthlyTotals;
}

// TOTAL
function calculateTotal() {
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    totalDisplay.textContent = total;
}

// CHART
function updateChart() {
    const monthlyTotals = getMonthlyTotals();
    const labels = Object.keys(monthlyTotals);
    const data = Object.values(monthlyTotals);

    if (chart) chart.destroy();

   chart = new Chart(document.getElementById("expenseChart"), {
    type: "bar",
    data: {
        labels: labels,
        datasets: [{
            label: "Monthly Expenses (Ksh)",
            data: data,
            backgroundColor: labels.map(() => 'rgba(79,70,229,0.7)'),
            borderColor: labels.map(() => 'rgba(79,70,229,1)'),
            borderWidth: 1,
            borderRadius: 6
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                labels: { color: '#1f2937', font: { size: 14, weight: 500 } }
            },
            tooltip: {
                bodyColor: '#1f2937',
                titleColor: '#111827',
            }
        },
        scales: {
            y: { beginAtZero: true, ticks: { color: '#1f2937' } },
            x: { ticks: { color: '#1f2937' } }
        }
    }
});

}

// CSV EXPORT
function exportToCSV() {
    if (expenses.length === 0) {
        alert("No expenses to export");
        return;
    }

    let csvContent = "Expense Name,Amount,Category,Date\n";
    expenses.forEach(exp => {
        const date = new Date(exp.date).toLocaleDateString();
        csvContent += `${exp.name},${exp.amount},${exp.category},${date}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "SpendWise_Expenses.csv";
    a.click();
    URL.revokeObjectURL(url);
}

// SAVE TO LOCALSTORAGE AND RENDER
function saveAndRender() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
    displayExpenses();
    calculateTotal();
    updateChart();
}

// INITIAL RENDER
saveAndRender();
