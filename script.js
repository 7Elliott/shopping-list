// script.js
document.addEventListener("DOMContentLoaded", () => {
    loadItems();
    document.getElementById("itemInput").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            addItem();
        }
    });
});

function addItem() {
    const input = document.getElementById("itemInput");
    const itemText = input.value.trim();
    if (itemText === "") return;
  
    // ✅ Format timestamp dynamically based on calendar day
    const now = new Date();
    const timestamp = formatRelativeDate(now);
    
    const list = document.getElementById("groceryList");
    const li = document.createElement("li");
    
    // ✅ Updated to fix timestamp display & spacing
    li.innerHTML = `<span style='flex-grow:1' onclick='toggleSelect(this)'> ${itemText} </span>
                    <small style='color: gray; font-size: 12px; margin-right: 10px;'>${timestamp}</small>
                    <button onclick='deleteItem(this)'>x</button>`;
    list.prepend(li); // Adds new item to the top of the list
    saveItems();
    updateItemCount(); // ✅ Update counter after adding an item

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
}

function deleteItem(button) {
    button.parentElement.remove();
    saveItems();
    updateItemCount(); // ✅ Update counter after deleting an item
}

// ✅ Updated function to delete selected items based on click selection instead of checkboxes
function deleteSelected() {
    document.querySelectorAll(".selected").forEach(selectedItem => {
        selectedItem.remove();
    });
    saveItems();
    updateItemCount(); // ✅ Update counter after deleting selected items
}

function deleteAll() {
    document.getElementById("groceryList").innerHTML = "";
    saveItems();
  updateItemCount(); // ✅ Update counter after deleting all items
}

function saveItems() {
    const items = [];
    document.querySelectorAll("#groceryList li").forEach(li => {
        items.push(li.innerHTML);
    });
    localStorage.setItem("groceryItems", JSON.stringify(items));
}

function loadItems() {
    const savedItems = JSON.parse(localStorage.getItem("groceryItems")) || [];
    const list = document.getElementById("groceryList");
  
    savedItems.reverse().forEach(itemHTML => {
        const li = document.createElement("li");
        li.innerHTML = itemHTML;
        list.appendChild(li);
    });
  updateItemCount(); // ✅ Update counter after loading saved items
}

// ✅ New function to update the item count dynamically
function updateItemCount() {
    const count = document.querySelectorAll("#groceryList li").length;
    document.getElementById("itemCount").textContent = `Items: ${count}`;
}