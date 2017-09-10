"use strict";
let usersService = (() => {
    function loadUserByUsername(username) {
        let endpoint = `?query={"username":"${username}"}`;

        return requester.get('user', endpoint, 'kinvey');
    }

    function loadUserFollowers(username) {
        let endpoint = `?query={"subscriptions":"${username}"}`;

        return requester.get('user', endpoint, 'kinvey');
    }
    
    function loadAllUsers() {
        return requester.get('user', '', 'kinvey');
    }

    function modifyUser(userId, newSubs) {
        let newUser = {
            subscriptions: newSubs
        };

        return requester.update('user', userId, 'kinvey', newUser)
    }

    return {
        loadUserByUsername,
        loadUserFollowers,
        loadAllUsers,
        modifyUser
    }
})();