function setCookie(cname, cvalue, exseconds) {
    var d = new Date();
    d.setTime(d.getTime() + exseconds);
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(name) {
    const cookieString = document.cookie;
    if (!cookieString) {
        return null; // Cookie not found
    }

    console.log('cookie string: ', cookieString)
    const cookies = cookieString.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        // Does this cookie string begin with the name we want?
        if (cookie.startsWith(name + '=')) {
            return cookie.substring(name.length + 1);
        }
    }
    return null;
}