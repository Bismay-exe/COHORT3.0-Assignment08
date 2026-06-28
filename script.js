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

document.addEventListener('DOMContentLoaded', function() {
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

goToRegister.addEventListener('click', function(e) {
    e.preventDefault()
    loginScreen.style.display = 'none'
    registerScreen.style.display = 'flex'
})

goToLogin.addEventListener('click', function(e) {
    e.preventDefault()
    registerScreen.style.display = 'none'
    loginScreen.style.display = 'flex'
})

registerForm.addEventListener('submit', function(e) {
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

loginForm.addEventListener('submit', function(e) {
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
    loadChart()

    let settingsName = document.getElementById('settings-name')
    let settingsCurrency = document.getElementById('settings-currency')
    let darkToggle = document.getElementById('dark-toggle')

    if (settingsName) settingsName.value = userName
    if (settingsCurrency) settingsCurrency.value = currency
    if (darkToggle) darkToggle.checked = darkMode
}

logoutBtn.addEventListener('click', function() {
    sessionStorage.removeItem('loggedIn')
    mainContainer.style.display = 'none'
    loginScreen.style.display = 'flex'
})


navItems.forEach(function(item) {
    item.addEventListener('click', function(e) {
        e.preventDefault()

        navItems.forEach(function(n) {
            n.classList.remove('active')
        })
        item.classList.add('active')

        let linkText = item.querySelector('a').textContent.trim().toLowerCase()

        sections.forEach(function(s) {
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
    sidebarBtn.addEventListener('click', function() {
        sidebar.classList.toggle('open')
    })
}

addTransactionBtn.addEventListener('click', function() {
    addScreen.style.display = 'flex'
})

closeBtn.addEventListener('click', function() {
    addScreen.style.display = 'none'
    document.querySelector('#transactionForm').reset()
})

addScreen.addEventListener('click', function(e) {
    if (e.target === addScreen) {
        addScreen.style.display = 'none'
        document.querySelector('#transactionForm').reset()
    }
})

transactionForm.addEventListener('submit', function(e) {
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

    let newTx = {
        id: Date.now(),
        type: type,
        date: date,
        amount: amount,
        category: category,
        description: description
    }

    transactions.unshift(newTx)
    localStorage.setItem('fintrack_transactions', JSON.stringify(transactions))

    renderStats()
    renderTable()
    loadChart()

    addScreen.style.display = 'none'
    document.querySelector('#transactionForm').reset()

    showToast('Transaction added!', 'success')
})

function deleteTransaction(id) {
    transactions = transactions.filter(function(t) {
        return t.id !== id
    })
    localStorage.setItem('fintrack_transactions', JSON.stringify(transactions))
    renderStats()
    renderTable()
    loadChart()
    showToast('Transaction deleted.', 'error')
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
            cards[0].querySelector('h1').style.color = 'var(--green)'
        } else {
            cards[0].querySelector('h1').style.color = 'var(--red)'
        }
    }
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
                    <button class="delete-tx-btn" onclick="deleteTransaction(${t.id})">
                        <i class="ri-delete-bin-6-line"></i>
                    </button>
                </td>
            </tr>
        `
    }

    tableBody.innerHTML = html
}

searchInput.addEventListener('input', function() {
    renderTable()
})

typeFilter.addEventListener('change', function() {
    renderTable()
})

themeBtn.addEventListener('click', function() {
    darkMode = !darkMode
    applyTheme()
    if (chart) drawChart()
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
    if (chart) drawChart()
    showToast('Currency updated!', 'success')
}

function toggleDarkMode() {
    let darkToggle = document.getElementById('dark-toggle')
    darkMode = darkToggle.checked
    applyTheme()
    if (chart) drawChart()
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
    if (chart) drawChart()
    showToast('All data reset.', 'error')
}

function updateName() {
    let nameEl = document.querySelector('.profile .name')
    if (nameEl) nameEl.textContent = userName
}

function loadChart() {
    if (typeof Chart === 'undefined') {
        let script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
        script.onload = drawChart
        document.head.appendChild(script)
    } else {
        drawChart()
    }
}

function drawChart() {
    let canvas = document.getElementById('chartCanvas')
    if (!canvas) return

    let months = []
    let incomeData = []
    let expenseData = []

    for (let i = 5; i >= 0; i--) {
        let d = new Date()
        d.setMonth(d.getMonth() - i)
        let label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
        let ym = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
        months.push(label)

        let inc = 0
        let exp = 0
        for (let j = 0; j < transactions.length; j++) {
            let t = transactions[j]
            if (t.date.startsWith(ym)) {
                if (t.type === 'income') inc += t.amount
                else exp += t.amount
            }
        }
        incomeData.push(inc)
        expenseData.push(exp)
    }

    let isDark = document.documentElement.getAttribute('data-theme') === 'dark'
    let gridColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'
    let textColor = isDark ? '#a0a0a0' : '#888'

    if (chart) chart.destroy()

    chart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    backgroundColor: 'rgba(16,185,129,0.85)',
                    borderRadius: 8,
                    borderSkipped: false
                },
                {
                    label: 'Expense',
                    data: expenseData,
                    backgroundColor: 'rgba(225,29,72,0.85)',
                    borderRadius: 8,
                    borderSkipped: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
                        font: { family: 'Inter', size: 13 },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: isDark ? '#1e1e2e' : '#fff',
                    titleColor: isDark ? '#e0e0e0' : '#111',
                    bodyColor: isDark ? '#aaa' : '#555',
                    borderColor: isDark ? '#333' : '#e5e5e5',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 10,
                    callbacks: {
                        label: function(ctx) {
                            let sym = currencySymbols[currency] || '₹'
                            return ' ' + ctx.dataset.label + ': ' + sym + ctx.parsed.y.toFixed(2)
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: gridColor },
                    ticks: { color: textColor, font: { family: 'Inter', size: 12 } }
                },
                y: {
                    grid: { color: gridColor },
                    ticks: {
                        color: textColor,
                        font: { family: 'Inter', size: 12 },
                        callback: function(v) {
                            let sym = currencySymbols[currency] || '₹'
                            if (v >= 1000) return sym + (v / 1000).toFixed(0) + 'k'
                            return sym + v
                        }
                    }
                }
            }
        }
    })
}

function showToast(msg, type) {
    clearTimeout(toastTimer)
    toast.textContent = msg
    toast.className = 'toast show ' + type
    toastTimer = setTimeout(function() {
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
