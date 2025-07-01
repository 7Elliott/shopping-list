// script.js - dynamic shopping lists
let shoppingList = null
const auth = new Auth()
let lists = []
let currentIndex = 0
let pagesContainer = null
let popupTargetPage = null

function redirectToLogin() {
    window.location.pathname = `/${SITE_SUBPATH}/login.html`
}

async function redirectIfNotLoggedIn() {
    const loggedIn = await auth.loggedIn()
    if (!loggedIn) redirectToLogin()
}

// return the list ID associated with a page. List IDs are UUID strings so we
// don't parse them as integers
function getListId(page) {
    return page.dataset.listId
}

function getCurrentPage() {
    return pagesContainer.children[currentIndex]
}

function setupPopupHandlers() {
    const popupMask = document.querySelector('.popup-mask')
    popupMask.addEventListener('click', () => {
        showPopup(false)
    })
    document.querySelector('.popup .action-buttons > .no').addEventListener('click', doNothingHandler)
    document.querySelector('.popup .action-buttons > .yes').addEventListener('click', confirmedDeleteHandler)
}

function doNothingHandler(e) {
    e.preventDefault()
    showPopup(false)
}

function confirmedDeleteHandler(e) {
    e.preventDefault()
    if (popupTargetPage) {
        deleteAll(popupTargetPage)
    }
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

function askDeleteAll(page) {
    popupTargetPage = page
    showPopup(true)
}

function formatRelativeDate(date) {
    const now = new Date()
    const oneDay = 24 * 60 * 60 * 1000
    const diffDays = Math.floor((now - date) / oneDay)
    if (diffDays <= 0) return 'Today'
    if (diffDays === 1) return '1 day ago'
    if (diffDays <= 7) return `${diffDays} days ago`
    return 'long long ago'
}

function makeItemElement(id, name, created_at, userName) {
    const li = document.createElement('li')
    const timestamp = formatRelativeDate(Date.parse(created_at))
    li.onclick = () => toggleSelect(li)
    li.innerHTML = `<span style='flex-grow:1'> ${name} </span>
                    <div style='display: flex; flex-direction: column; gap: 5px; align-items: flex-end; margin-right: 15px;'>
                        <small style='color: gray; font-size: 16px;'>${timestamp}</small>
                        <small style='color: gray; font-size: 12px; font-style: italic;'>Added by ${userName}</small>
                    </div>
                    <button class="deleteButton"><img src='delete.svg' /></button>`
    li.querySelector('.deleteButton').addEventListener('click', () => onDeleteButtonPressed(li))
    li.dataset.id = id
    return li
}

function toggleSelect(elem) {
    elem.classList.toggle('selected')
    updateButtonsVisibility(getCurrentPage())
}

function onItemChangesCompleted(page) {
    updateItemCount(page)
    updateButtonsVisibility(page)
}

function updateItemCount(page) {
    const count = page.querySelectorAll('ul li').length
    page.querySelector('.item-count').textContent = `Items: ${count}`
}

function updateButtonsVisibility(page) {
    const deleteSelectedBtn = page.querySelector('.delete-selected')
    const deleteAllBtn = page.querySelector('.delete-all')
    const selectedCount = page.querySelectorAll('ul .selected').length
    const totalItems = page.querySelectorAll('ul li').length
    if (selectedCount > 0) {
        deleteSelectedBtn.style.display = 'flex'
        deleteSelectedBtn.querySelector('span').textContent = `(${selectedCount})`
    } else {
        deleteSelectedBtn.style.display = 'none'
    }
    deleteAllBtn.style.display = totalItems > 0 ? 'block' : 'none'
}

async function loadItems(page) {
    shoppingList.setListId(getListId(page))
    const savedItems = await shoppingList.fetch()
    const list = page.querySelector('ul')
    list.innerHTML = ''
    savedItems.sort(({ created_at: a }, { created_at: b }) => b > a).forEach(({ id, name, created_at, user_name }) => {
        const li = makeItemElement(id, name, created_at, user_name)
        list.appendChild(li)
    })
    page.dataset.loaded = 'true'
    onItemChangesCompleted(page)
}

function addItem(page) {
    const input = page.querySelector('.item-input')
    const itemText = input.value.trim()
    if (itemText === '') return
    let userName = localStorage.getItem('userName')
    if (!userName) {
        redirectToLogin()
        return
    }
    shoppingList.setListId(getListId(page))
    shoppingList.addItem(itemText, userName).then(({ data: [{ id, name, created_at }], error }) => {
        if (error) {
            alert('Could not insert item. Please try again?')
        } else {
            const li = makeItemElement(id, name, created_at, userName)
            page.querySelector('ul').prepend(li)
            onItemChangesCompleted(page)
            input.value = ''
        }
    })
}

function deleteItem(li, page) {
    shoppingList.setListId(getListId(page))
    shoppingList.deleteItem(li.dataset.id).then(({ error }) => {
        if (error) {
            alert('failed to delete item')
            return
        }
        updateUIOnItemDelete(li, page)
    })
}

function onDeleteButtonPressed(li) {
    const page = li.closest('.page')
    deleteItem(li, page)
}

function deleteSelected(page) {
    page.querySelectorAll('ul .selected').forEach(selectedItem => {
        deleteItem(selectedItem, page)
    })
}

function deleteAll(page) {
    page.querySelectorAll('ul li').forEach(li => deleteItem(li, page))
}

function updateUIOnItemDelete(item, page) {
    item.classList.add('slide-out')
    setTimeout(() => {
        item.remove()
        onItemChangesCompleted(page)
    }, 300)
}

function createPageElement(list, index) {
    const template = document.getElementById('listPageTemplate')
    const section = template.content.firstElementChild.cloneNode(true)
    if (index === 0) {
        section.classList.add('page-shopping')
    } else {
        section.classList.add('page-tasks')
    }
    section.dataset.index = index
    section.dataset.listId = list.id
    section.querySelector('h1').textContent = list.name

    const input = section.querySelector('.item-input')
    const addBtn = section.querySelector('.add-item')
    addBtn.addEventListener('click', () => addItem(section))
    input.addEventListener('keypress', e => {
        if (e.key === 'Enter') addItem(section)
    })
    section.querySelector('.delete-selected').addEventListener('click', () => deleteSelected(section))
    section.querySelector('.delete-all').addEventListener('click', () => askDeleteAll(section))

    return section
}

function setCurrentList(index) {
    currentIndex = index
    const page = pagesContainer.children[index]
    if (!page) return
    if (!page.dataset.loaded) {
        loadItems(page)
    } else {
        updateButtonsVisibility(page)
    }
}

function handleScroll() {
    const index = Math.round(pagesContainer.scrollLeft / window.innerWidth)
    if (index !== currentIndex) {
        setCurrentList(index)
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await redirectIfNotLoggedIn()
    shoppingList = new ShoppingList(auth.getClient())
    pagesContainer = document.getElementById('pagesContainer')
    setupPopupHandlers()
    const { data, error } = await shoppingList.fetchLists()
    if (error) {
        alert('Failed to load lists')
        return
    }
    lists = data || []
    pagesContainer.style.width = `${lists.length * 100}vw`
    lists.forEach((list, idx) => {
        const page = createPageElement(list, idx)
        pagesContainer.appendChild(page)
    })
    setCurrentList(0)
    pagesContainer.addEventListener('scroll', handleScroll)
})
