let accountController = (() => {
    function postRegister(ctx) {
        let username = ctx.params.username;
        let password = ctx.params.password;
        let repeatPass = ctx.params.repeatPass;

        let isValid = validateRegisterFields(username, password, repeatPass);
        if(isValid){
            authenticator.register(username, password)
                .then((userInfo) => {
                    authenticator.saveSession(userInfo);
                    notify.showInfo('User registration successful.');
                    ctx.redirect('#/home');
                }).catch(notify.handleError);
        }
    }

    function postLogin(ctx) {
        let username = ctx.params.username;
        let password = ctx.params.password;

        authenticator.login(username, password)
            .then((userInfo) => {
                authenticator.saveSession(userInfo);
                notify.showInfo('Login successful.');
                ctx.redirect('#/home');
            }).catch(notify.handleError)
    }

    function logout(ctx) {
        authenticator.logout()
            .then(() => {
                sessionStorage.clear();
                notify.showInfo('Logout successful.');
                ctx.redirect('#/home');
            })
    }

    function validateRegisterFields(username, pass, repeatPass) {
        if (!/^[A-Za-z]{3,}$/g.test(username)) {
            notify.showError(`Username should be at least 3 characters long and contain only letters!`);
            return false;
        }

        if (pass !== repeatPass) {
            notify.showError('Passwords should match!');
            return false;
        }

        if (!/^[A-Za-z\d]{6,}$/.test(pass)) {
            notify.showError('Password should be at least 6 characters long and contain alphanumerical characters!');
            return false;
        }

        return true;
    }


    return {
        postLogin,
        postRegister,
        logout
    }
})()