"use strict";
$(() => {
    let app = new Sammy('#main', function () {
        this.use('Handlebars', 'hbs');

        // Default page
        this.get('index.html', homeController.welcome);

        // Login
        this.get('#/login', usersController.getLogin);
        this.post('#/login', usersController.postLogin);

        // Register
        this.get('#/register', usersController.getRegister);
        this.post('#/register', usersController.postRegister);

        // Logout
        this.get('#/logout', usersController.logout);

        // Main Feed
        this.get('#/feed', chirpsController.getMainFeed);

        // Chirps CRUD
        this.post('#/createChirp', chirpsController.createChirp);
        this.get('#/deleteChirp/:id', chirpsController.deleteChirp);

        // User Feed
        this.get('#/profile', usersController.getUserFeed);
        this.get('#/feed/:username', usersController.getUserFeed);

        // Discover
        this.get('#/discover', usersController.getDiscover);

        // Follow/Unfollow
        this.get('#/follow/:username', usersController.followUser);
        this.get('#/unfollow/:username', usersController.unfollowUser);
    });

    app.run();
});

function calcTime(dateIsoFormat) {
    let diff = new Date - (new Date(dateIsoFormat));
    diff = Math.floor(diff / 60000);
    if (diff < 1) return 'less than a minute';
    if (diff < 60) return diff + ' minute' + pluralize(diff);
    diff = Math.floor(diff / 60);
    if (diff < 24) return diff + ' hour' + pluralize(diff);
    diff = Math.floor(diff / 24);
    if (diff < 30) return diff + ' day' + pluralize(diff);
    diff = Math.floor(diff / 30);
    if (diff < 12) return diff + ' month' + pluralize(diff);
    diff = Math.floor(diff / 12);
    return diff + ' year' + pluralize(diff);
    function pluralize(value) {
        if (value !== 1) return 's';
        else return '';
    }
}