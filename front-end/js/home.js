function authFetch(path, opts = {}) {
  const token = localStorage.getItem('jwt');
  if (!token) throw new Error('Not authenticated');
  opts.headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...(opts.headers || {})
  };
  return fetch(`${API_BASE}${path}`, opts);
}

let transactions = [];
let budget = 0;

async function loadData() {
  console.log('loadData start');
  const now   = new Date();
  const month = now.getMonth() + 1;
  const year  = now.getFullYear();

  console.log('fetching budget for', month, year);
  let bv;   
  try {
    const res = await authFetch(
      `/httpTriggerGetBudget?month=${month}&year=${year}`,
      { method: 'GET' }
    );
    console.log('budget response status:', res.status);

    const json = await res.json();
    console.log('budget payload:', json);

    if (typeof json.budget === 'number') {
      bv = json.budget;
    }
    else if (json.budget && typeof json.budget.amount === 'number') {
      bv = json.budget.amount;
    }
    else if (typeof json.amount === 'number') {
      bv = json.amount;
    }
    else {
      console.warn('Unrecognized budget shape, defaulting to 0');
      bv = 0;
    }
  } catch (err) {
    console.error('budget fetch failed:', err);
    bv = 0;
  }

  budget = bv;
  console.log('loaded budget =', budget);
  document.getElementById('budgetInput').value = budget;

  console.log('Fetching incomes...');
  const incRes = await authFetch('/httpTriggerGetIncome', { method: 'GET' });
  console.log('Incomes response status:', incRes.status);
  const incJson = await incRes.json();
  console.log('Incomes payload:', incJson);
  const incomes = Array.isArray(incJson)
    ? incJson
    : incJson.income || [];

  console.log('Fetching expenses...');
  const expRes = await authFetch('/httpTriggerGetSpendings', { method: 'GET' });
  console.log('Expenses response status:', expRes.status);
  const expJson = await expRes.json();
  console.log('Expenses payload:', expJson);
  const expenses = Array.isArray(expJson)
    ? expJson
    : expJson.spendings || [];

  transactions = [
    ...incomes.map(i => ({
      id:         i.id,
      amount:    i.amount,
      desc:      i.desc ?? i.title ?? '',
      category:  i.category,
      type:      'income',
      timestamp: i.timestamp
    })),
    ...expenses.map(e => ({
      id:         e.id,
      amount:    e.amount,
      desc:      e.desc ?? e.title ?? '',
      category:  e.category,
      type:      'expense',
      timestamp: e.timestamp
    }))
  ];

  renderTransactions();
  updateSummary();
}

function renderTransactions() {
  const tbody = document.getElementById('transactions');
  tbody.innerHTML = '';
  transactions.forEach((t, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${t.amount.toFixed(2)}</td>
      <td>${t.desc}</td>
      <td>${t.category}</td>
      <td class="${t.type}">${t.type}</td>      
      <td><button onclick="deleteTransaction(${idx})">Delete</button></td>
      <td><button onclick="editTransaction(${idx})">Edit</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function updateSummary() {
  const incomeTotal  = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expenseTotal = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  document.getElementById('totalIncome').textContent  = incomeTotal.toFixed(2);
  document.getElementById('totalExpenses').textContent = expenseTotal.toFixed(2);
  document.getElementById('budget').textContent        = budget.toFixed(2);
  document.getElementById('balance').textContent       = (budget + incomeTotal - expenseTotal).toFixed(2);
}

function wireUpBudget() {
  document.getElementById('setBudgetBtn').addEventListener('click', async () => {
    const val = parseFloat(document.getElementById('budgetInput').value);
    budget = isNaN(val) ? 0 : val;

    try {
      const postRes = await authFetch('/httpTriggerAddBudget', {
        method: 'POST',
        body: JSON.stringify({
          amount:      budget,
          description: 'Monthly budget'
        })
      });
      if (!postRes.ok) {
        const { error } = await postRes.json();
        return alert(error);
      }
    } catch (e) {
      console.error('Budget save failed:', e);
      return alert('Could not save budget: ' + e.message);
    }
    updateSummary();
  });
}

function wireUpForm() {
  document.getElementById('transactionForm').addEventListener('submit', async e => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('amount').value);
    const title  = document.getElementById('title').value.trim();
    const type   = document.getElementById('type').value;
    const category = document.getElementById('category').value;
    const endpoint = type === 'income'
      ? '/httpTriggerAddIncome'
      : '/httpTriggerAddSpending';

    if (!title || isNaN(amount)) {
      return alert('Please enter a title and valid amount.');
    }

    try {
      const res = await authFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          amount,
          category,
          title,
          ...(type === 'expense' && { type: 'expense' })
        })
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || res.statusText);
      }
    } catch (err) {
      console.error('Transaction save failed:', err);
      return alert('Could not save transaction: ' + err.message);
    }

    e.target.reset();
    await loadData();
  });
}

window.deleteTransaction = async idx => {
  const tx = transactions[idx];
  const endpoint = tx.type === 'income'
    ? '/httpTriggerDeleteIncome'
    : '/httpTriggerDeleteSpending';

  try {
    const res = await authFetch(
      `${endpoint}?id=${encodeURIComponent(tx.id)}`,
      { method: 'DELETE' }
    );
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({}));
      throw new Error(error || `Status ${res.status}`);
    }
  } catch (err) {
    console.error('Delete transaction failed:', err);
    return alert('Could not delete transaction: ' + err.message);
  }
  await loadData();
};
window.editTransaction = idx => console.log('Edit transaction', idx);

document.addEventListener('DOMContentLoaded', () => {
  wireUpBudget();
  wireUpForm();
  loadData().catch(err => {
    console.error('Initial load failed:', err);
    alert('Load failed');
  });
});
