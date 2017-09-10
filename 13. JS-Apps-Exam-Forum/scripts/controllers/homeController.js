let homeController = (() => {
    function getWelcomePage(ctx) {
        ctx.isAuth = authenticator.isAuth();
        if(!authenticator.isAuth()){
            // Load SignIn Page
            ctx.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                about: './templates/about/about.hbs',
                loginForm: './templates/forms/loginForm.hbs',
                registerForm: './templates/forms/registerForm.hbs'
            }).then(function()  {
                this.partial('./templates/home/welcome.hbs');
            })
        } else {
            // Load catalog
            ctx.redirect('#/catalog');
        }
    }

    function getAboutPage(ctx) {
        ctx.isAuth = authenticator.isAuth();
        ctx.username = sessionStorage.getItem('username');
        ctx.loadPartials({
            header: './templates/common/header.hbs',
            footer: './templates/common/footer.hbs',
            about: './templates/about/about.hbs',
            menu: './templates/common/menu.hbs'
        }).then(function () {
            this.partial('./templates/about/aboutPage.hbs');
        })
    }

    return {
        getWelcomePage,
        getAboutPage
    }
})()