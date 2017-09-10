"use strict";
let chirpsController = (() => {

    function getMainFeed(ctx) {
        let subsArr = JSON.parse(sessionStorage.getItem('subscriptions')).map(e => `"${e}"`);
        let username = sessionStorage.getItem('username');

        Promise.all([chirpsService.loadAllChirpsByUsername(username), usersService.loadUserFollowers(username)])
            .then(([chirpsArr, followersArr]) => {
                let chirpsCount = chirpsArr.length;
                let following = JSON.parse(sessionStorage.getItem('subscriptions')).length;
                let followers = followersArr.length;

                chirpsService.loadFollowersChirps(subsArr)
                    .then((followersChirps) => {
                        followersChirps.forEach(c => {
                            c.time = calcTime(c._kmd.ect);
                        });

                        // I need an AutoMapper for this :/
                        ctx.username = username;
                        ctx.chirpsCount = chirpsCount;
                        ctx.following = following;
                        ctx.followers = followers;
                        ctx.chirps = followersChirps;

                        this.loadPartials({
                            header: 'templates/common/header.hbs',
                            footer: 'templates/common/footer.hbs',
                            navbar: 'templates/common/navbar.hbs',
                            createChirpForm: 'templates/common/createChirpForm.hbs',
                            userStats: 'templates/common/userStats.hbs',
                            chirp: 'templates/common/chirp.hbs',
                            chirpList: 'templates/common/chirpList.hbs'
                        }).then(function () {
                            this.partial('templates/home/feed.hbs');
                        })
                    }).catch(notify.handleError)

            }).catch(notify.handleError)
    }

    function createChirp(ctx) {
        let text = ctx.params.text;
        let author = sessionStorage.getItem('username');

        if(text === ''){
            notify.showError('Chirp text cannot be empty!');
            return;
        }

        if(text.length > 150){
            notify.showError('Chirp text cannot be longer than 150 characters!');
            return;
        }

        chirpsService.createChirp(text, author)
            .then(() => {
                notify.showInfo('Chirp published.');
                ctx.redirect('#/profile');
            }).catch(notify.handleError);
    }

    function deleteChirp(ctx) {
        let chirpId = ctx.params.id.substr(1);

        chirpsService.deleteChirp(chirpId)
            .then(() => {
                notify.showInfo('Chirp deleted.');
                ctx.redirect('#/profile');
            }).catch(notify.handleError);
    }

    return {
        getMainFeed,
        createChirp,
        deleteChirp
    }
})();