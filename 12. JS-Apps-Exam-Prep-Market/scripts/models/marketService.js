let marketService = (() => {

    function getProducts() {
        return requester.get('appdata', 'products', 'kinvey');
    }

    function getUser() {
        let endPoint = sessionStorage.getItem('id');
        return requester.get('user', endPoint, 'kinvey');
    }

    function updateUser(userInfo) {
        let endPoint = sessionStorage.getItem('id');
        return requester.update('user', endPoint, 'kinvey', userInfo)
    }


    function getProduct(productId) {
        return requester.get('appdata', 'products/' + productId, 'kinvey');
    }

    return {
        getProducts,
        getUser,
        updateUser,
        getProduct,
    }
})();