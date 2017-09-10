"use strict";
let homeController = (() => {
    function welcome(ctx) {
        if(auth.isAuth()){
            ctx.redirect('#/feed');
        } else {
            this.loadPartials({
                header: 'templates/common/header.hbs',
                footer: 'templates/common/footer.hbs',
                loginForm: 'templates/login/loginForm.hbs'
            }).then(function () {
                this.partial('templates/login/loginPage.hbs');
            });
        }
    }

    return {
        welcome
    }
})();