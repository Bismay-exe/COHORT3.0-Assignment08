const loginScreen = document.querySelector('.login-screen')
const registerScreen = document.querySelector('.register-screen')
const mainContainer = document.querySelector('.main-container')
const addScreen = document.querySelector('#addTransactionScreen')
const tableBody = document.querySelector('#transactionTableBody')
const toast = document.querySelector('#toast')
const goToRegister = document.querySelector('#goToRegister')
const goToLogin = document.querySelector('#goToLogin')
const registerForm = document.querySelector('#registerForm')
const loginForm = document.querySelector('#loginForm')
const logoutBtn = document.querySelector('.logout-btn')
const navItems = document.querySelectorAll('.sidebar-nav .nav-item')
const sections = document.querySelectorAll('.main-section')
const sidebarBtn = document.querySelector('.sidebar-btn')
const addTransactionBtn = document.querySelector('#addTransactionBtn')
const closeBtn = document.querySelector('.close-btn')
const transactionForm = document.querySelector('#transactionForm')
const searchInput = document.querySelector('#searchInput')
const typeFilter = document.querySelector('#typeFilter')
const themeBtn = document.querySelector('#themeBtn')


let transactions = JSON.parse(localStorage.getItem('fintrack_transactions')) || []
let darkMode = JSON.parse(localStorage.getItem('fintrack_dark')) || false
let currency = localStorage.getItem('fintrack_currency') || 'INR'
let userName = localStorage.getItem('fintrack_name') || 'User Name'
let chart = null

let currencySymbols = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥'
}

let toastTimer

document.addEventListener('DOMContentLoaded', function () {
  let isLoggedIn = sessionStorage.getItem('loggedIn')

  if (isLoggedIn) {
    showApp()
  } else {
    loginScreen.style.display = 'flex'
    mainContainer.style.display = 'none'
    registerScreen.style.display = 'none'
  }

  applyTheme()

  let settingsName = document.getElementById('settings-name')
  let settingsCurrency = document.getElementById('settings-currency')
  let darkToggle = document.getElementById('dark-toggle')

  if (settingsName) settingsName.value = userName
  if (settingsCurrency) settingsCurrency.value = currency
  if (darkToggle) darkToggle.checked = darkMode
})

goToRegister.addEventListener('click', function (e) {
  e.preventDefault()
  loginScreen.style.display = 'none'
  registerScreen.style.display = 'flex'
})

goToLogin.addEventListener('click', function (e) {
  e.preventDefault()
  registerScreen.style.display = 'none'
  loginScreen.style.display = 'flex'
})

registerForm.addEventListener('submit', function (e) {
  e.preventDefault()

  let regUsername = document.getElementById('reg-username').value.trim()
  let regPassword = document.getElementById('reg-password').value.trim()

  if (regUsername === '' || regPassword === '') {
    showToast('Please fill all fields', 'error')
    return
  }

  localStorage.setItem('registered_username', regUsername)
  localStorage.setItem('registered_password', regPassword)

  document.getElementById('username').value = regUsername
  document.getElementById('password').value = regPassword

  registerScreen.style.display = 'none'
  loginScreen.style.display = 'flex'

  showToast('Account created! You can now login.', 'success')

  document.getElementById('registerForm').reset()
})

loginForm.addEventListener('submit', function (e) {
  e.preventDefault()

  let enteredUsername = document.getElementById('username').value.trim()
  let enteredPassword = document.getElementById('password').value.trim()

  let savedUsername = localStorage.getItem('registered_username')
  let savedPassword = localStorage.getItem('registered_password')

  if (!savedUsername) {
    showToast('No account found. Please register first.', 'error')
    return
  }

  if (enteredUsername !== savedUsername || enteredPassword !== savedPassword) {
    showToast('Wrong username or password.', 'error')
    return
  }

  sessionStorage.setItem('loggedIn', 'true')
  showApp()
})

function showApp() {
  loginScreen.style.display = 'none'
  registerScreen.style.display = 'none'
  mainContainer.style.display = 'flex'

  renderStats()
  renderTable()
  updateName()

  let settingsName = document.getElementById('settings-name')
  let settingsCurrency = document.getElementById('settings-currency')
  let darkToggle = document.getElementById('dark-toggle')

  if (settingsName) settingsName.value = userName
  if (settingsCurrency) settingsCurrency.value = currency
  if (darkToggle) darkToggle.checked = darkMode
}

logoutBtn.addEventListener('click', function () {
  sessionStorage.removeItem('loggedIn')
  mainContainer.style.display = 'none'
  loginScreen.style.display = 'flex'
})


navItems.forEach(function (item) {
  item.addEventListener('click', function (e) {
    e.preventDefault()

    navItems.forEach(function (n) {
      n.classList.remove('active')
    })
    item.classList.add('active')

    let linkText = item.querySelector('a').textContent.trim().toLowerCase()

    sections.forEach(function (s) {
      s.classList.remove('active')
      s.style.display = 'none'
    })

    let targetSection = document.getElementById(linkText)

    if (linkText === 'dashboard') {
      targetSection = document.getElementById('dashboard')
    }

    if (linkText === 'transactions') {
      targetSection = document.getElementById('dashboard')
    }

    if (targetSection) {
      targetSection.classList.add('active')
      targetSection.style.display = 'flex'
    }

    if (window.innerWidth <= 768) {
      document.querySelector('.sidebar').classList.remove('open')
    }
  })
})

const sidebar = document.querySelector('.sidebar')
if (sidebarBtn) {
  sidebarBtn.addEventListener('click', function () {
    sidebar.classList.toggle('open')
  })
}

addTransactionBtn.addEventListener('click', function () {
  document.querySelector('#transactionForm').reset()
  document.getElementById('txId').value = ''
  document.querySelector('.transaction-form-header h2').textContent = 'Add Transaction'
  addScreen.style.display = 'flex'
})

closeBtn.addEventListener('click', function () {
  addScreen.style.display = 'none'
  document.querySelector('#transactionForm').reset()
})

addScreen.addEventListener('click', function (e) {
  if (e.target === addScreen) {
    addScreen.style.display = 'none'
    document.querySelector('#transactionForm').reset()
  }
})

transactionForm.addEventListener('submit', function (e) {
  e.preventDefault()

  let type = document.getElementById('txType').value
  let date = document.getElementById('txDate').value
  let amount = parseFloat(document.getElementById('txAmount').value)
  let category = document.getElementById('txCategory').value
  let description = document.getElementById('txDescription').value.trim()

  if (!date || !amount || !category || !description) {
    showToast('Please fill all fields', 'error')
    return
  }

  let txId = document.getElementById('txId').value

  let item = {
    id: txId ? parseInt(txId) : Date.now(),
    type: type,
    date: date,
    amount: amount,
    category: category,
    description: description
  }

  if (txId) {
    for (let i = 0; i < transactions.length; i++) {
      if (transactions[i].id === parseInt(txId)) {
        transactions[i] = item
        break
      }
    }
  } else {
    transactions.unshift(item)
  }

  transactions.sort(function (a, b) {
    return new Date(b.date) - new Date(a.date)
  })

  localStorage.setItem('fintrack_transactions', JSON.stringify(transactions))

  renderStats()
  renderTable()


  addScreen.style.display = 'none'
  document.querySelector('#transactionForm').reset()

  showToast('Transaction added!', 'success')
})

function deleteTransaction(id) {
  transactions = transactions.filter(function (t) {
    return t.id !== id
  })
  localStorage.setItem('fintrack_transactions', JSON.stringify(transactions))
  renderStats()
  renderTable()
  showToast('Transaction deleted.', 'error')
}

function editTransaction(id) {
  let tx = null
  for (let i = 0; i < transactions.length; i++) {
    if (transactions[i].id === id) {
      tx = transactions[i]
      break
    }
  }

  if (!tx) return

  document.getElementById('txId').value = tx.id
  document.getElementById('txType').value = tx.type
  document.getElementById('txDate').value = tx.date
  document.getElementById('txAmount').value = tx.amount
  document.getElementById('txCategory').value = tx.category
  document.getElementById('txDescription').value = tx.description

  document.querySelector('.transaction-form-header h2').textContent = 'Edit Transaction'
  addScreen.style.display = 'flex'
}

function renderStats() {
  let sym = currencySymbols[currency] || '₹'
  let totalIncome = 0
  let totalExpense = 0

  for (let i = 0; i < transactions.length; i++) {
    if (transactions[i].type === 'income') {
      totalIncome += transactions[i].amount
    } else {
      totalExpense += transactions[i].amount
    }
  }

  let balance = totalIncome - totalExpense
  let cards = document.querySelectorAll('.cards .card')

  if (cards.length >= 4) {
    cards[0].querySelector('h1').textContent = sym + balance.toFixed(2)
    cards[1].querySelector('h1').textContent = sym + totalIncome.toFixed(2)
    cards[2].querySelector('h1').textContent = sym + totalExpense.toFixed(2)
    cards[3].querySelector('h1').textContent = transactions.length

    if (balance >= 0) {
      cards[0].querySelector('h1').style.color = 'var(--blue)'
    } else {
      cards[0].querySelector('h1').style.color = 'var(--red)'
    }
  }

  updateChart(totalIncome, totalExpense)
}

function renderTable() {
  let filterType = typeFilter.value
  let query = searchInput.value.toLowerCase()
  let sym = currencySymbols[currency] || '₹'
  let list = []

  for (let i = 0; i < transactions.length; i++) {
    let t = transactions[i]

    if (filterType !== 'all' && t.type !== filterType) continue

    if (query !== '') {
      let inDesc = t.description.toLowerCase().includes(query)
      let inCat = t.category.toLowerCase().includes(query)
      if (!inDesc && !inCat) continue
    }

    list.push(t)
  }

  if (list.length === 0) {
    tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    <div class="empty-icon">💸</div>
                    <p>No transactions found</p>
                    <span>Add your first transaction using the button above</span>
                </td>
            </tr>
        `
    return
  }

  let html = ''

  for (let i = 0; i < list.length; i++) {
    let t = list[i]
    let sign = t.type === 'income' ? '+' : '-'
    let icon = getCategoryIcon(t.category)
    let color = getCategoryColor(t.category)
    let dateText = formatDate(t.date)

    html += `
            <tr class="tx-row ${t.type}">
                <td class="tx-date">${dateText}</td>
                <td class="tx-desc">
                    <div class="tx-desc-inner">
                        <span class="tx-icon">${icon}</span>
                        <div>
                            <p class="tx-title">${t.description}</p>
                        </div>
                    </div>
                </td>
                <td><span class="badge badge-${color}">${t.category}</span></td>
                <td class="tx-amount ${t.type}">${sign}${sym}${t.amount.toFixed(2)}</td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        <button class="delete-tx-btn" onclick="editTransaction(${t.id})" style="color: var(--blue); border-color: var(--border-color);">
                            <i class="ri-pencil-line"></i>
                        </button>
                        <button class="delete-tx-btn" onclick="deleteTransaction(${t.id})">
                            <i class="ri-delete-bin-6-line"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `
  }

  tableBody.innerHTML = html
}

searchInput.addEventListener('input', function () {
  renderTable()
})

typeFilter.addEventListener('change', function () {
  renderTable()
})

themeBtn.addEventListener('click', function () {
  darkMode = !darkMode
  applyTheme()
  renderStats()
})

function applyTheme() {
  if (darkMode) {
    document.documentElement.setAttribute('data-theme', 'dark')
  } else {
    document.documentElement.setAttribute('data-theme', 'light')
  }

  localStorage.setItem('fintrack_dark', JSON.stringify(darkMode))

  let icon = themeBtn.querySelector('i')
  if (darkMode) {
    icon.className = 'ri-moon-fill'
  } else {
    icon.className = 'ri-sun-fill'
  }

  let darkToggle = document.getElementById('dark-toggle')
  if (darkToggle) darkToggle.checked = darkMode
}

function saveName() {
  let nameInput = document.getElementById('settings-name')
  let val = nameInput.value.trim()

  if (val === '') {
    showToast('Name cannot be empty', 'error')
    return
  }

  userName = val
  localStorage.setItem('fintrack_name', userName)
  updateName()
  showToast('Name saved!', 'success')
}

function saveCurrency() {
  let select = document.getElementById('settings-currency')
  currency = select.value
  localStorage.setItem('fintrack_currency', currency)
  renderStats()
  renderTable()
  showToast('Currency updated!', 'success')
}

function toggleDarkMode() {
  let darkToggle = document.getElementById('dark-toggle')
  darkMode = darkToggle.checked
  applyTheme()
  renderStats()
}

function resetAllData() {
  let confirmed = confirm('This will delete all your transactions and reset settings. Are you sure?')
  if (!confirmed) return

  transactions = []
  localStorage.setItem('fintrack_transactions', JSON.stringify(transactions))
  localStorage.removeItem('fintrack_currency')
  localStorage.removeItem('fintrack_name')
  localStorage.removeItem('fintrack_dark')

  currency = 'INR'
  userName = 'User Name'
  darkMode = false

  let settingsName = document.getElementById('settings-name')
  let settingsCurrency = document.getElementById('settings-currency')
  let darkToggle = document.getElementById('dark-toggle')

  if (settingsName) settingsName.value = userName
  if (settingsCurrency) settingsCurrency.value = currency
  if (darkToggle) darkToggle.checked = darkMode

  applyTheme()
  renderStats()
  renderTable()
  showToast('All data reset.', 'error')
}

function updateName() {
  let nameEl = document.querySelector('.profile .name')
  if (nameEl) nameEl.textContent = userName
}

function updateChart(income, expense) {
  let canvas = document.getElementById('chartCanvas')
  if (!canvas) return

  let ctx = canvas.getContext('2d')

  if (chart) {
    chart.destroy()
  }

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Income vs Expenses'],
      datasets: [
        {
          label: 'Income',
          data: [income],
          backgroundColor: '#10B981',
          borderRadius: 6
        },
        {
          label: 'Expenses',
          data: [expense],
          backgroundColor: '#E11D48',
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true }
      },
      plugins: {
        legend: { position: 'top' }
      }
    }
  })
}

function showToast(msg, type) {
  clearTimeout(toastTimer)
  toast.textContent = msg
  toast.className = 'toast show ' + type
  toastTimer = setTimeout(function () {
    toast.className = 'toast'
  }, 3000)
}

function formatDate(dateStr) {
  let d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getCategoryIcon(cat) {
  if (cat === 'Food & Dining') return '🍔'
  if (cat === 'Shopping') return '🛍️'
  if (cat === 'Recharge & Bills') return '📱'
  if (cat === 'Petrol & Auto') return '⛽'
  if (cat === 'Utilities') return '💡'
  if (cat === 'Salary') return '💼'
  if (cat === 'Entertainment') return '🎬'
  if (cat === 'Other') return '📦'
  return '💰'
}

function getCategoryColor(cat) {
  if (cat === 'Food & Dining') return 'orange'
  if (cat === 'Shopping') return 'purple'
  if (cat === 'Recharge & Bills') return 'blue'
  if (cat === 'Petrol & Auto') return 'yellow'
  if (cat === 'Utilities') return 'cyan'
  if (cat === 'Salary') return 'green'
  if (cat === 'Entertainment') return 'pink'
  if (cat === 'Other') return 'indigo'
  return 'violet'
}
