const auth = new Auth()
let db = null
const listsMap = {}
let currentDeleteList = null

function redirectToLogin() {
    window.location.pathname = `${SITE_SUBPATH}/login.html`
}

async function redirectIfNotLoggedIn() {
    const loggedIn = await auth.loggedIn()
    if (!loggedIn) redirectToLogin()
}

function formatListTitle(name) {
    return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

document.addEventListener('DOMContentLoaded', async () => {
    await redirectIfNotLoggedIn()
    db = new ItemsDB(auth.getClient())
    const lists = await db.getLists()
    const pages = document.getElementById('listsContainer')
    pages.style.width = `${lists.length * 100}vw`

    for (const list of lists) {
        createListSection(pages, list)
        await loadItems(list.id)
    }
    setupPopupHandlers()
})

function createListSection(container, list) {
    const section = document.createElement('section')
    const cls = list.name === 'daily_task' ? 'page-tasks' : 'page-shopping'
    section.className = `page ${cls}`
    section.dataset.listId = list.id
    section.innerHTML = `<div class="container">
            <h1>${formatListTitle(list.name)}</h1>
            <p class="item-count">Items: 0</p>
            <div class="input-section">
                <input type="text" class="item-input" placeholder="Add an item...">
                <button class="add-btn"><img src='add.svg' /></button>
            </div>
            <ul id="${list.id}" class="item-list"></ul>
            <button class="delete-selected"><img src='trash.svg' /><span class="selected-count"></span></button>
            <button class="delete-all"><img src='clear.svg' /></button>
        </div>`
    container.appendChild(section)

    const listObj = {
        id: list.id,
        name: list.name,
        listEl: section.querySelector('ul'),
        input: section.querySelector('.item-input'),
        countEl: section.querySelector('.item-count'),
        deleteSelectedBtn: section.querySelector('.delete-selected'),
        deleteAllBtn: section.querySelector('.delete-all')
    }

    listsMap[list.id] = listObj

    listObj.input.addEventListener('keypress', e => { if (e.key === 'Enter') addItem(list.id) })
    section.querySelector('.add-btn').addEventListener('click', () => addItem(list.id))
    listObj.deleteSelectedBtn.addEventListener('click', () => deleteSelected(list.id))
    listObj.deleteAllBtn.addEventListener('click', () => askDeleteAll(list.id))
}

function formatRelativeDate(date) {
    const now = new Date()
    const oneDay = 24 * 60 * 60 * 1000
    const diffDays = Math.floor((now - date) / oneDay)
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    return 'long long ago'
}

function toggleSelect(elem) {
    elem.classList.toggle('selected')
    const listId = elem.dataset.listId
    updateButtonsVisibility(listId)
}

function onItemChangesCompleted(listId) {
    updateItemCount(listId)
    updateButtonsVisibility(listId)
}

function updateUIOnItemDelete(item) {
    const listId = item.dataset.listId
    item.classList.add('slide-out')
    setTimeout(() => {
        item.remove()
        onItemChangesCompleted(listId)
    }, 300)
}

function onDeleteButtonPressed(li) {
    deleteItem(li)
}

function deleteItem(li) {
    db.deleteItem(li.dataset.id).then(() => {
        updateUIOnItemDelete(li)
    }).catch(() => alert('failed to delete item'))
}

function deleteSelected(listId) {
    listsMap[listId].listEl.querySelectorAll('.selected').forEach(deleteItem)
}

function setupPopupHandlers() {
    const popupMask = document.querySelector('.popup-mask')
    popupMask.addEventListener('click', () => { showPopup(false) })
    document.querySelector('.popup .action-buttons > .no').addEventListener('click', doNothingHandler)
    document.querySelector('.popup .action-buttons > .yes').addEventListener('click', confirmedDeleteHandler)
}

function doNothingHandler(e) {
    e.preventDefault()
    showPopup(false)
}

function confirmedDeleteHandler(e) {
    e.preventDefault()
    deleteAll(currentDeleteList)
    showPopup(false)
}

function showPopup(show) {
    const popup = document.querySelector('.popup')
    const popupMask = document.querySelector('.popup-mask')
    if (show) {
        popup.classList.add('show')
        popupMask.classList.add('show')
    } else {
        popup.classList.remove('show')
        popupMask.classList.remove('show')
    }
}

function askDeleteAll(listId) {
    currentDeleteList = listId
    showPopup(true)
}

function deleteAll(listId) {
    listsMap[listId].listEl.querySelectorAll('li').forEach(deleteItem)
}

function makeItemElement(id, name, created_at, userName, listId) {
    const li = document.createElement('li')
    const timestamp = formatRelativeDate(new Date(created_at))
    li.onclick = () => toggleSelect(li)
    li.innerHTML = `<span style='flex-grow:1'> ${name} </span>
                    <div style='display: flex; flex-direction: column; gap: 5px; align-items: flex-end; margin-right: 15px;'>
                        <small style='color: gray; font-size: 16px;'>${timestamp}</small>
                        <small style='color: gray; font-size: 12px; font-style: italic;'>Added by ${userName}</small>
                    </div>
                    <button class="deleteButton"><img src='delete.svg' /></button>`
    li.setAttribute('data-id', id)
    li.setAttribute('data-list-id', listId)
    li.querySelector('.deleteButton').addEventListener('click', e => { e.stopPropagation(); onDeleteButtonPressed(li) })
    return li
}

async function loadItems(listId) {
    const savedItems = await db.fetchItems(listId)
    const listObj = listsMap[listId]
    savedItems
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .forEach(({ id, name, created_at, user_name }) => {
            const li = makeItemElement(id, name, created_at, user_name, listId)
            listObj.listEl.appendChild(li)
        })
    onItemChangesCompleted(listId)
}

function updateItemCount(listId) {
    const listObj = listsMap[listId]
    const count = listObj.listEl.querySelectorAll('li').length
    listObj.countEl.textContent = `Items: ${count}`
}

function updateButtonsVisibility(listId) {
    const listObj = listsMap[listId]
    const selectedCount = listObj.listEl.querySelectorAll('.selected').length
    const totalItems = listObj.listEl.querySelectorAll('li').length
    if (selectedCount > 0) {
        listObj.deleteSelectedBtn.style.display = 'flex'
        listObj.deleteSelectedBtn.querySelector('.selected-count').textContent = `(${selectedCount})`
    } else {
        listObj.deleteSelectedBtn.style.display = 'none'
    }
    listObj.deleteAllBtn.style.display = totalItems > 0 ? 'block' : 'none'
}

function addItem(listId) {
    const listObj = listsMap[listId]
    const input = listObj.input
    const itemText = input.value.trim()
    if (itemText === '') return
    let userName = localStorage.getItem('userName')
    if (!userName) {
        redirectToLogin()
        return
    }
    db.addItem(listId, itemText, userName).then(item => {
        const li = makeItemElement(item.id, item.name, item.created_at, userName, listId)
        listObj.listEl.prepend(li)
        onItemChangesCompleted(listId)
        input.value = ''
    }).catch(() => alert('Could not insert item. Please try again?'))
}
