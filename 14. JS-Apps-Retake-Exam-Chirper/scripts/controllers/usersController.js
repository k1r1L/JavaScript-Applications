"use strict";
let usersController = (() => {
    function getLogin() {
        this.loadPartials({
            header: 'templates/common/header.hbs',
            footer: 'templates/common/footer.hbs',
            loginForm: 'templates/login/loginForm.hbs'
        }).then(function () {
            this.partial('templates/login/loginPage.hbs');
        });
    }

    function postLogin(ctx) {
        let username = ctx.params.username;
        let password = ctx.params.password;

        auth.login(username, password)
            .then((userInfo) => {
                auth.saveSession(userInfo);
                notify.showInfo('Login successful.');
                ctx.redirect('#/feed');
            }).catch(notify.handleError);
    }

    function getRegister() {
        this.loadPartials({
            header: 'templates/common/header.hbs',
            footer: 'templates/common/footer.hbs',
            registerForm: 'templates/register/registerForm.hbs'
        }).then(function () {
            this.partial('templates/register/registerPage.hbs');
        });
    }

    function postRegister(ctx) {
        let username = ctx.params.username;
        let password = ctx.params.password;
        let repeatPass = ctx.params.repeatPass;

        if (username.length < 5) {
            notify.showError('Username should be more at least 5 characters long.');
            return;
        }

        if (password !== repeatPass) {
            notify.showError('Passwords must match!');
            return;
        }

        auth.register(username, password)
            .then((userInfo) => {
                auth.saveSession(userInfo);
                notify.showInfo('User registration successful.');
                ctx.redirect('#/feed');
            }).catch(notify.handleError);
    }

    function logout(ctx) {
        auth.logout()
            .then(() => {
                sessionStorage.clear();
                notify.showInfo('Logout successful.');
                ctx.redirect('#/login');
            }).catch(notify.handleError);
    }

    function getUserFeed(ctx) {
        let username = ctx.params.username;

        if(username){ // Other User Feed
            username = username.substr(1);
        } else { // My User Feed
            username = sessionStorage.getItem('username');
        }

        Promise.all([chirpsService.loadAllChirpsByUsername(username), usersService.loadUserFollowers(username), usersService.loadUserByUsername(username)])
            .then(([chirpsArr, followersArr, user]) => {
                let chirpsCount = chirpsArr.length;
                let following = user[0].subscriptions.length;
                let followers = followersArr.length;

                chirpsArr.forEach(c => {
                    c.time = calcTime(c._kmd.ect);
                    c.isAuthor = c.author === sessionStorage.getItem('username');
                });

                // I need an AutoMapper for this :/
                ctx.username = username;
                ctx.chirpsCount = chirpsCount;
                ctx.following = following;
                ctx.followers = followers;
                ctx.chirps = chirpsArr;
                ctx.isCurrentlyLogged = ctx.params.username === undefined;
                ctx.isFollowed = JSON.parse(sessionStorage.getItem('subscriptions')).includes(username)

                this.loadPartials({
                    header: 'templates/common/header.hbs',
                    footer: 'templates/common/footer.hbs',
                    navbar: 'templates/common/navbar.hbs',
                    createChirpForm: 'templates/common/createChirpForm.hbs',
                    userStats: 'templates/common/userStats.hbs',
                    chirp: 'templates/common/chirp.hbs',
                    chirpList: 'templates/common/chirpList.hbs'
                }).then(function () {
                    this.partial('templates/userFeed/feed.hbs');
                })
            }).catch(notify.handleError)
    }

    function getDiscover(ctx) {
        usersService.loadAllUsers()
            .then((users) => {
                users.forEach(user => {
                    user.followers = users.filter(u => u.subscriptions.includes(user.username)).length;
                });
                users = users.filter(u => u.username !== sessionStorage.getItem('username'));

                ctx.users = users.sort((a, b) => b.followers - a.followers); // sort by descending followers
                this.loadPartials({
                    header: 'templates/common/header.hbs',
                    footer: 'templates/common/footer.hbs',
                    navbar: 'templates/common/navbar.hbs',
                    userBox: 'templates/discover/userBox.hbs',
                    userList: 'templates/discover/userList.hbs'
                }).then(function () {
                    this.partial('templates/discover/discoverPage.hbs');
                });

             }).catch(notify.handleError)
    }

    function followUser(ctx) {
        let username = ctx.params.username.substr(1);
        let userId = sessionStorage.getItem('userId');
        let newSubArr = JSON.parse(sessionStorage.getItem('subscriptions')).splice(0); // Create a copy of arr
        newSubArr.push(username);

        usersService.modifyUser(userId, newSubArr)
            .then(() => {
                notify.showInfo(`Subscribed to ${username}`);
                sessionStorage.setItem('subscriptions', JSON.stringify(newSubArr));
                ctx.redirect(`#/feed/:${username}`);
            }).catch(notify.handleError);
    }

    function unfollowUser(ctx) {
        let username = ctx.params.username.substr(1);
        let userId = sessionStorage.getItem('userId');
        let newSubArr = JSON.parse(sessionStorage.getItem('subscriptions')).splice(0);
        let indexOfEl = newSubArr.indexOf(username);
        newSubArr.splice(indexOfEl, 1);

        usersService.modifyUser(userId, newSubArr)
            .then(() => {
                notify.showInfo(`Unsubscribed to ${username}`);
                sessionStorage.setItem('subscriptions', JSON.stringify(newSubArr));
                ctx.redirect(`#/feed/:${username}`);
            }).catch(notify.handleError);
    }

    return {
        getLogin,
        postLogin,
        getRegister,
        postRegister,
        logout,
        getUserFeed,
        getDiscover,
        followUser,
        unfollowUser
    }
})();