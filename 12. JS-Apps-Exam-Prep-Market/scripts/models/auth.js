let auth = (() => {

    // user/login
    function login(username, password) {
        let userData = {
            username,
            password
        };

        return requester.post('user', 'login', 'basic', userData);
    }

    // user/register
    function register(username, password, name) {
        let userData = {
            username,
            password,
            name
        };

        return requester.post('user', '', 'basic', userData);
    }

    // user/logout
    function logout() {
        let logoutData = {
            authtoken: sessionStorage.getItem('authtoken')
        };

        return requester.post('user', '_logout', 'kinvey', logoutData);
    }

    function saveSession(userInfo) {
        let id = userInfo['_id'];
        let username = userInfo['username'];
        let name = userInfo['name'];
        let authtoken = userInfo['_kmd']['authtoken'];

        sessionStorage.setItem('id', id);
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('name', name);
        sessionStorage.setItem('authtoken', authtoken);
    }

    function showInfo(message) {
        let infoBox = $('#infoBox');
        infoBox.text(message);
        infoBox.show();
        setTimeout(() => infoBox.fadeOut(), 3000);
    }

    function handleError(reason) {
        showError(reason.responseJSON.description);
    }

    function showError(message) {
        let errorBox = $('#errorBox');
        errorBox.text(message);
        errorBox.show();
        setTimeout(() => errorBox.fadeOut(), 3000);
    }

    return {
        login,
        register,
        logout,
        saveSession,
        showInfo,
        handleError
    }
})();