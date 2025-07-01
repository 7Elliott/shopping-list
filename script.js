let shoppingList = null
const auth = new Auth()

function redirectToLogin() {
    window.location.pathname = `/${SITE_SUBPATH}/login.html`
}

async function redirectIfNotLoggedIn() {
    const loggedIn = await auth.loggedIn()
    if (!loggedIn) redirectToLogin()
}

// script.js
document.addEventListener("DOMContentLoaded", async () => {
    await redirectIfNotLoggedIn()
    shoppingList = new ShoppingList(auth.getClient())
    loadItems();
    document.getElementById("itemInput").addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            addItem();
        }
    });
    setupPopupHandlers()
});

function addItem() {
    const input = document.getElementById("itemInput");
    const itemText = input.value.trim();
    if (itemText === "") return;

    let userName = localStorage.getItem("userName");
    if (!userName) {
        // login page also sets username. redirect back to login
        redirectToLogin();
    }

    const list = document.getElementById("groceryList");
    shoppingList.addItem(itemText, userName).then(({ data, error }) => {
        if (error || !data) {
            alert("Could not insert item. Please try again?");
        } else {
            const [{ id, name, created_at }] = data;
            const li = makeItemElement(id, name, created_at, userName);
            list.prepend(li); // Adds new item to the top of the list
            onItemChangesCompleted();
            input.value = "";
        }
    });
}

// ✅ New function to format timestamps as "today", "1 day ago", "2 days ago", "1 week ago"
function formatRelativeDate(date) {
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.floor((now - date) / oneDay);

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    return "long long ago";
}

// ✅ New function to toggle selection when clicking an item
function toggleSelect(elem) {
    elem.classList.toggle("selected");
    updateButtonsVisibility(); // ✅ Update button visibility when selecting items
}

function onItemChangesCompleted() {
    updateItemCount(); // ✅ Update counter after items have changed
    updateButtonsVisibility(); // ✅ Update button visibility
}

function updateUIOnItemDelete(item) {
    item.classList.add("slide-out"); // ✅ Apply CSS class for transition
    setTimeout(() => {
        item.remove()
        onItemChangesCompleted()
    }, 300)
}

function onDeleteButtonPressed(button) {
    const li = button.parentElement
    deleteItem(li)
}

function deleteItem(li) {
    shoppingList.deleteItem(li.dataset.id).then(({ error }) => {
        if (error) {
            alert("failed to delete item")
            return
        }
        updateUIOnItemDelete(li)
    })
}

// ✅ Updated function to delete selected items based on click selection instead of checkboxes
function deleteSelected() {
    document.querySelectorAll("#groceryList .selected").forEach(selectedItem => {
        deleteItem(selectedItem)
    });
}

function setupPopupHandlers() {
    const popupMask = document.querySelector(".popup-mask")
    popupMask.addEventListener('click', () => {
        showPopup(false)
    })
    document.querySelector('.popup .action-buttons > .no').addEventListener('click', doNothingHandler)
    document.querySelector('.popup .action-buttons > .yes').addEventListener('click', confirmedDeleteHandler)
    console.log('set up popup handlers')
}

function doNothingHandler(e) {
    e.preventDefault()
    showPopup(false)
}

function confirmedDeleteHandler(e) {
    e.preventDefault()
    deleteAll()
    showPopup(false)
}

function showPopup(show) {
    const popup = document.querySelector(".popup")
    const popupMask = document.querySelector(".popup-mask")
    if (show) {
        popup.classList.add('show')
        popupMask.classList.add('show')
    } else {
        popup.classList.remove('show')
        popupMask.classList.remove('show')
    }
}

function askDeleteAll() {
    showPopup(true)
}

function deleteAll() {
    document.querySelectorAll("#groceryList li").forEach(li => {
        deleteItem(li)
    });
}

function saveItems() {
    const items = [];
    document.querySelectorAll("#groceryList li span").forEach(li => {
        items.push(li.innerText);
    });
    localStorage.setItem("groceryItems", JSON.stringify(items));
}

function makeItemElement(id, name, created_at, userName) {
    const li = document.createElement("li");
    const timestamp = formatRelativeDate(Date.parse(created_at));

    li.onclick = () => toggleSelect(li)

    // ✅ Updated to move username under timestamp & style it small
    li.innerHTML = `<span style='flex-grow:1'> ${name} </span>
                    <div style='display: flex; flex-direction: column; gap: 5px; align-items: flex-end; margin-right: 15px;'>
                        <small style='color: gray; font-size: 16px;'>${timestamp}</small>
                        <small style='color: gray; font-size: 12px; font-style: italic;'>Added by ${userName}</small>
                    </div>
                    <button class="deleteButton" onclick='onDeleteButtonPressed(this)'><img src='delete.svg' /></button>`;
    li.setAttribute('data-id', id)
    return li
}

async function loadItems() {
    const savedItems = await shoppingList.fetch()
    const list = document.getElementById("groceryList");

    savedItems.sort(({ created_at: a }, { created_at: b }) => b > a).forEach(({ id, name, created_at, user_name }) => {
        const li = makeItemElement(id, name, created_at, user_name)
        list.appendChild(li);
    });
    onItemChangesCompleted()
}

// ✅ New function to update the item count dynamically
function updateItemCount() {
    const count = document.querySelectorAll("#groceryList li").length;
    document.getElementById("itemCount").textContent = `Items: ${count}`;
}

// ✅ New function to update button visibility
function updateButtonsVisibility() {
    const deleteSelectedBtn = document.getElementById("deleteSelected");
    const deleteAllBtn = document.getElementById("deleteAll");
    const selectedCount = document.querySelectorAll("#groceryList .selected").length;
    const totalItems = document.querySelectorAll("#groceryList li").length;

    // Show or hide "Delete Selected" button
    if (selectedCount > 0) {
        deleteSelectedBtn.style.display = "flex";
        deleteSelectedBtn.querySelector('#deleteSelectedCount').textContent = ` (${selectedCount})`
    } else {
        deleteSelectedBtn.style.display = "none";
    }

    // Show or hide "Delete All" button
    deleteAllBtn.style.display = totalItems > 0 ? "block" : "none";
}
