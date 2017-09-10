function startApp() {

    const app = Sammy('#app', function () {

        this.use('Handlebars', 'hbs');

        $(document).on({
            ajaxStart: function () {
                $("#loadingBox").show();
            },
            ajaxStop: function () {
                $("#loadingBox").hide();
            }
        });

        // HOME
        this.get('market.html', displayHome);
        this.get('#/home', displayHome);

        function displayHome(context) {

            context.isAnonymous = sessionStorage.getItem('username') === null;
            context.username = sessionStorage.getItem('username');

            context.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                home: './templates/home/home.hbs'
            }).then(function () {
                this.partial('./templates/home/homePage.hbs');
            });
        }

        // LOGIN
        this.get('#/login', function (context) {

            context.isAnonymous = sessionStorage.getItem('username') === null;
            context.username = sessionStorage.getItem('username');

            context.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                loginForm: './templates/login/loginForm.hbs'
            }).then(function () {
                this.partial('./templates/login/loginPage.hbs')
            });
        });

        this.post('#/login', function (context) {

            let username = context.params.username;
            let password = context.params.password;

            auth.login(username, password)
                .then(function (userInfo) {
                    auth.saveSession(userInfo);
                    auth.showInfo('Login successful.');

                    displayHome(context);
                }).catch(auth.handleError);
        });

        // REGISTER
        this.get('#/register', function (context) {

            context.isAnonymous = sessionStorage.getItem('username') === null;
            context.username = sessionStorage.getItem('username');

            context.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                registerForm: './templates/register/registerForm.hbs'
            }).then(function () {
                this.partial('./templates/register/registerPage.hbs')
            });
        });

        this.post('#/register', function (context) {

            let username = context.params.username;
            let password = context.params.password;
            let name = context.params.name;

            auth.register(username, password, name)
                .then(function (userInfo) {
                    auth.saveSession(userInfo);
                    auth.showInfo('User registration successful.');

                    displayHome(context);
                }).catch(auth.handleError)
        });


        // LOGOUT
        this.get('#/logout', function (context) {
            "use strict";

            auth.logout()
                .then(function () {
                    sessionStorage.clear();
                    auth.showInfo('Logout successful.');

                    displayHome(context);
                }).catch(auth.handleError);
        });

        this.get('#/shop', function (context) {

            context.isAnonymous = sessionStorage.getItem('username') === null;
            context.username = sessionStorage.getItem('username');

            marketService.getProducts()
                .then(function (products) {

                    for (let p of products) {
                        p['price'] = Number(p['price']).toFixed(2);
                    }

                    context.products = products;

                    context.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        product: './templates/shop/shopProduct.hbs'
                    }).then(function () {
                        this.partial('./templates/shop/shopTable.hbs')
                            .then(function () {
                                let btn = $('button');
                                btn.click(function () {
                                    let productId = $(this).attr('data-id');
                                    purchaseProduct(productId);
                                });
                            });
                    })
                }).catch(auth.handleError);


            function purchaseProduct(productId) {

                marketService.getProduct(productId)
                    .then(function (product) {

                        marketService.getUser()
                            .then(function (userInfo) {
                                let cart;
                                if (userInfo['cart'] === undefined) {
                                    cart = {};
                                } else {
                                    cart = userInfo['cart'];
                                }

                                // HAS ALREADY PURCHASED THAT PRODUCT -> INCREASE QUANTITY
                                if (cart.hasOwnProperty(productId)) {
                                    cart[productId] = {
                                        quantity: Number(cart[productId]['quantity']) + 1,
                                        product: {
                                            name: product['name'],
                                            description: product['description'],
                                            price: product['price']
                                        }
                                    }
                                } else {
                                    cart[productId] = {
                                        quantity: 1,
                                        product: {
                                            name: product['name'],
                                            description: product['description'],
                                            price: product['price']
                                        }
                                    }
                                }

                                userInfo.cart = cart;
                                marketService.updateUser(userInfo)
                                    .then(function (userInfo) {
                                        auth.showInfo('Product has been purchased');
                                    });

                            });

                    }).catch(auth.handleError);
            }
        });

        this.get('#/cart', displayCart);

        function displayCart(context) {

            context.isAnonymous = sessionStorage.getItem('username') === null;
            context.username = sessionStorage.getItem('username');

            marketService.getUser()
                .then(function (userInfo) {
                    let cart = userInfo.cart;

                    let products = [];
                    let keys = Object.keys(cart);
                    for (let id of keys) {
                        let product = {
                            _id: id,
                            name: cart[id]['product']['name'],
                            description: cart[id]['product']['description'],
                            quantity: cart[id]['quantity'],
                            totalPrice: Number(cart[id]['quantity']) * Number(cart[id]['product']['price'])
                        };

                        products.push(product);
                    }

                    context.products = products;

                    context.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        product: './templates/cart/cartProduct.hbs'
                    }).then(function () {
                        this.partial('./templates/cart/cartTable.hbs')
                            .then(function () {
                                $('button').click(function () {
                                    let productId = $(this).attr('data-id');
                                    discardProduct(productId);
                                })
                            });
                    })

                }).catch(auth.handleError);

            function discardProduct(productId) {

                marketService.getUser()
                    .then(function (userData) {
                        let cart = userData.cart;

                        let quantity = Number(cart[productId]['quantity']) - 1;
                        if (quantity === 0) {
                            delete cart[productId];
                        } else {
                            cart[productId]['quantity'] = quantity;
                        }

                        userData['cart'] = cart;

                        marketService.updateUser(userData)
                            .then(function (userInfo) {
                                auth.showInfo('Product discard');
                                displayCart(context);
                            });
                    });
            }
        }
    });

    app.run();
}