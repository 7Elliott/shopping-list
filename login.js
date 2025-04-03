const auth = new Auth()

async function handleLoginSubmit(e) {
    e.preventDefault()
    const formData = new FormData(e.target)
    const username = formData.get('username')
    const password = formData.get('password')
    console.log(username, password)
    const { error } = await auth.signIn(username, password)
    if (error) {
        alert('Failed to login. Check your username / password, or try again.')
        return
    }
    localStorage.setItem("userName", username);
    window.location.pathname = '/shopping-list'
    return
}

document.addEventListener("DOMContentLoaded", async () => {
    document.getElementById("loginForm").addEventListener("submit", handleLoginSubmit);
});
