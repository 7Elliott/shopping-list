let shoppingList = null
const auth = new Auth()
// script.js
document.addEventListener("DOMContentLoaded", async () => {
    {
        let email = null, password = null
        while (true) {
            const loggedIn = await auth.loggedIn()
            if (loggedIn) {
                break
            }
            if (!email) {
                email = prompt("email: ")
            }
            if (!password) {
                password = prompt("password: ")
            }
            if (email && password) {
                const { data, error } = await auth.signIn(email, password)
                if (!error) {
                    break
                } else {
                    console.log('sign in error', error)
                    alert("failed to log in. Please try again.")
                }
            }
        }
    }
    shoppingList = new ShoppingList(auth.getClient())
    loadItems();
    document.getElementById("itemInput").addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            addItem();
        }
    });
});

function addItem() {
    const input = document.getElementById("itemInput");
    const itemText = input.value.trim();
    if (itemText === "") return;

    let userName = localStorage.getItem("userName");
    if (!userName) {
        userName = prompt("Enter your name:");
        if (!userName) return; // Exit if no name is provided
        localStorage.setItem("userName", userName);
    }

    // ✅ Format timestamp dynamically based on calendar day
    const now = new Date();
    const timestamp = formatRelativeDate(now);

    const list = document.getElementById("groceryList");
    const li = document.createElement("li");

    // ✅ Updated to move username under timestamp & style it small
    li.innerHTML = `<span style='flex-grow:1' onclick='toggleSelect(this)'> ${itemText} </span>
                    <div style='display: flex; flex-direction: column; gap: 5px; align-items: flex-end; margin-right: 15px;'>
                        <small style='color: gray; font-size: 12px;'>${timestamp}</small>
                        <small style='color: gray; font-size: 10px; font-style: italic;'>Added by ${userName}</small>
                    </div>
                    <button onclick='deleteItem(this)'>x</button>`;
    list.prepend(li); // Adds new item to the top of the list
    shoppingList.addItem(itemText, userName).catch(err => {
        console.log('failed to insert item', err)
    })
    saveItems();
    updateItemCount(); // ✅ Update counter after adding an item
    updateButtonsVisibility(); // ✅ Update button visibility

    input.value = "";
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
function toggleSelect(span) {
    span.parentElement.classList.toggle("selected");
    updateButtonsVisibility(); // ✅ Update button visibility when selecting items
}

function deleteItem(button) {
    console.log('button.parentElement.data-id', button.parentElement.dataset.id)
    const li = button.parentElement;
    li.classList.add("slide-out"); // ✅ Apply CSS class for transition
    setTimeout(() => {
        li.remove();
        saveItems();
        updateItemCount(); // ✅ Update counter after deleting an item
        updateButtonsVisibility(); // ✅ Update button visibility
    }, 300); // ✅ Matches CSS transition duration
}

// ✅ Updated function to delete selected items based on click selection instead of checkboxes
function deleteSelected() {
    document.querySelectorAll(".selected").forEach(selectedItem => {
        selectedItem.classList.add("slide-out"); // ✅ Apply CSS class for transition
        setTimeout(() => {
            selectedItem.remove();
            saveItems();
            updateItemCount(); // ✅ Update counter after deleting selected items
            updateButtonsVisibility(); // ✅ Update button visibility
        }, 300); // ✅ Matches CSS transition duration
    });
}

function deleteAll() {
    document.querySelectorAll("#groceryList li").forEach(li => {
        li.classList.add("slide-out"); // ✅ Apply CSS class for transition
    });
    setTimeout(() => {
        document.getElementById("groceryList").innerHTML = "";
        saveItems();
        updateItemCount(); // ✅ Update counter after deleting all items
        updateButtonsVisibility(); // ✅ Update button visibility
    }, 300); // ✅ Matches CSS transition duration
}

function saveItems() {
    const items = [];
    document.querySelectorAll("#groceryList li span").forEach(li => {
        items.push(li.innerText);
    });
    localStorage.setItem("groceryItems", JSON.stringify(items));
}

async function loadItems() {
    const savedItems = await shoppingList.fetch()
    const list = document.getElementById("groceryList");

    savedItems.sort(({ created_at: a }, { created_at: b }) => b > a).forEach(({ id, name }) => {
        const li = document.createElement("li");
        li.setAttribute('data-id', id)
        li.innerHTML = `<input type='checkbox' class='itemCheckbox'style='flex-grow:0'> <span style='margin-left: 4px; flex-grow:1'> ${name} </span> <button onclick='deleteItem(this)'>x</button>`;
        list.appendChild(li);
    });
    updateItemCount(); // ✅ Update counter after loading saved items
    updateButtonsVisibility(); // ✅ Update button visibility
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
    const selectedCount = document.querySelectorAll(".selected").length;
    const totalItems = document.querySelectorAll("#groceryList li").length;

    // Show or hide "Delete Selected" button
    if (selectedCount > 0) {
        deleteSelectedBtn.style.display = "block";
        deleteSelectedBtn.textContent = `Delete Selected (${selectedCount})`;
    } else {
        deleteSelectedBtn.style.display = "none";
    }

    // Show or hide "Delete All" button
    deleteAllBtn.style.display = totalItems > 0 ? "block" : "none";
}
