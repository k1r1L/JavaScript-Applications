"use strict";
let chirpsService = (() => {
    function loadFollowersChirps(subs) {
        let endpoint = `chirps?query={"author":{"$in": [${subs}]}}&sort={"_kmd.ect": -1}`;

        return requester.get('appdata', endpoint, 'kinvey');
    }

    function loadAllChirpsByUsername(username) {
        let endpoint = `chirps?query={"author":"${username}"}&sort={"_kmd.ect": -1}`;
        
        return requester.get('appdata', endpoint, 'kinvey');
    }

    function createChirp(text, author) {
        let chirpData = {
            text,
            author
        };

        return requester.post('appdata', 'chirps', 'kinvey', chirpData);
    }

    function deleteChirp(chirpId) {
        return requester.remove('appdata', `chirps/${chirpId}`, 'kinvey');
    }


    return {
        loadFollowersChirps,
        loadAllChirpsByUsername,
        createChirp,
        deleteChirp
    }
})();