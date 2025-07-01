let dailyTaskList = null

document.addEventListener("DOMContentLoaded", async () => {
    await redirectIfNotLoggedIn()
    dailyTaskList = new DailyTaskList(auth.getClient())
    await dailyTaskList.init()
    loadTasks()
    document.getElementById("taskInput").addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            addTask()
        }
    })
    setupTaskPopupHandlers()
})

function addTask() {
    const input = document.getElementById("taskInput")
    const itemText = input.value.trim()
    if (itemText === "") return

    let userName = localStorage.getItem("userName")
    if (!userName) {
        redirectToLogin()
    }

    const list = document.getElementById("taskList")
    dailyTaskList.addItem(itemText, userName).then(({ data: [{ id, name, created_at }], error }) => {
        if (error) {
            alert("Could not insert task. Please try again?")
        } else {
            const li = makeTaskElement(id, name, created_at, userName)
            list.prepend(li)
            onTaskChangesCompleted()
            input.value = ""
        }
    })
}

function onTaskChangesCompleted() {
    updateTaskItemCount()
    updateTaskButtonsVisibility()
}

function updateTaskUIOnItemDelete(item) {
    item.classList.add("slide-out")
    setTimeout(() => {
        item.remove()
        onTaskChangesCompleted()
    }, 300)
}

function onTaskDeleteButtonPressed(button) {
    const li = button.parentElement
    deleteTask(li)
}

function deleteTask(li) {
    dailyTaskList.deleteItem(li.dataset.id).then(({ error }) => {
        if (error) {
            alert("failed to delete task")
            return
        }
        updateTaskUIOnItemDelete(li)
    })
}

function deleteTaskSelected() {
    document.querySelectorAll("#taskList .selected").forEach(selectedItem => {
        deleteTask(selectedItem)
    })
}

function setupTaskPopupHandlers() {
    const popupMask = document.querySelector(".task-popup-mask")
    popupMask.addEventListener('click', () => {
        showTaskPopup(false)
    })
    document.querySelector('.task-popup .action-buttons > .no').addEventListener('click', taskDoNothingHandler)
    document.querySelector('.task-popup .action-buttons > .yes').addEventListener('click', taskConfirmedDeleteHandler)
}

function taskDoNothingHandler(e) {
    e.preventDefault()
    showTaskPopup(false)
}

function taskConfirmedDeleteHandler(e) {
    e.preventDefault()
    deleteTaskAll()
    showTaskPopup(false)
}

function showTaskPopup(show) {
    const popup = document.querySelector(".task-popup")
    const popupMask = document.querySelector(".task-popup-mask")
    if (show) {
        popup.classList.add('show')
        popupMask.classList.add('show')
    } else {
        popup.classList.remove('show')
        popupMask.classList.remove('show')
    }
}

function askDeleteTaskAll() {
    showTaskPopup(true)
}

function deleteTaskAll() {
    document.querySelectorAll("#taskList li").forEach(li => {
        deleteTask(li)
    })
}

function makeTaskElement(id, name, created_at, userName) {
    const li = document.createElement("li")
    const timestamp = formatRelativeDate(Date.parse(created_at))

    li.onclick = () => toggleSelect(li)

    li.innerHTML = `<span style='flex-grow:1'> ${name} </span>
                    <div style='display: flex; flex-direction: column; gap: 5px; align-items: flex-end; margin-right: 15px;'>
                        <small style='color: gray; font-size: 16px;'>${timestamp}</small>
                        <small style='color: gray; font-size: 12px; font-style: italic;'>Added by ${userName}</small>
                    </div>
                    <button class="deleteButton" onclick='onTaskDeleteButtonPressed(this)'><img src='delete.svg' /></button>`
    li.setAttribute('data-id', id)
    return li
}

async function loadTasks() {
    const savedItems = await dailyTaskList.fetch()
    const list = document.getElementById("taskList")

    savedItems.sort(({ created_at: a }, { created_at: b }) => b > a).forEach(({ id, name, created_at, user_name }) => {
        const li = makeTaskElement(id, name, created_at, user_name)
        list.appendChild(li)
    })
    onTaskChangesCompleted()
}

function updateTaskItemCount() {
    const count = document.querySelectorAll("#taskList li").length
    document.getElementById("taskItemCount").textContent = `Items: ${count}`
}

function updateTaskButtonsVisibility() {
    const deleteSelectedBtn = document.getElementById("deleteTaskSelected")
    const deleteAllBtn = document.getElementById("deleteTaskAll")
    const selectedCount = document.querySelectorAll("#taskList .selected").length
    const totalItems = document.querySelectorAll("#taskList li").length

    if (selectedCount > 0) {
        deleteSelectedBtn.style.display = "flex"
        deleteSelectedBtn.querySelector('#deleteTaskSelectedCount').textContent = `(${selectedCount})`
    } else {
        deleteSelectedBtn.style.display = "none"
    }

    deleteAllBtn.style.display = totalItems > 0 ? "block" : "none"
}
