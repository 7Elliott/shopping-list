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

    const list = document.getElementById("groceryList");
    const li = document.createElement("li");
    
// ✅ Updated to remove checkboxes and allow clicking the item box for selection
    li.innerHTML = `<span style='flex-grow:1' onclick='toggleSelect(this)'> ${itemText} </span> <button onclick='deleteItem(this)'>x</button>`;
    list.prepend(li); // Adds new item to the top of the list
    saveItems();

    input.value = "";
}

// ✅ New function to toggle selection when clicking an item
function toggleSelect(span) {
    span.parentElement.classList.toggle("selected");
}

function deleteItem(button) {
    button.parentElement.remove();
    saveItems();
}

// ✅ Updated function to delete selected items based on click selection instead of checkboxes
function deleteSelected() {
    document.querySelectorAll(".selected").forEach(selectedItem => {
        selectedItem.remove();
    });
    saveItems();
}

function deleteAll() {
    document.getElementById("groceryList").innerHTML = "";
    saveItems();
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
}
