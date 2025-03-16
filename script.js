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
    
    li.innerHTML = `<input type='checkbox' class='itemCheckbox' style='flex-grow:0'> <span style='flex-grow:1'> ${itemText} </span> <button onclick='deleteItem(this)'>x</button>`;
    list.appendChild(li);
    saveItems();

    input.value = "";
}

function deleteItem(button) {
    button.parentElement.remove();
    saveItems();
}

function deleteSelected() {
    document.querySelectorAll(".itemCheckbox:checked").forEach(checkbox => {
        checkbox.parentElement.remove();
    });
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
    savedItems.forEach(itemHTML => {
        const li = document.createElement("li");
        li.innerHTML = itemHTML;
        list.appendChild(li);
    });
}
