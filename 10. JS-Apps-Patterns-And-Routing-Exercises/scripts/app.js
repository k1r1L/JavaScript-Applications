$(() => {
    const app = Sammy('#main', function () {
        this.use('Handlebars', 'hbs');

        this.get('index.html', displayHome);
        this.get('#/home', displayHome);

        this.get('#/about', function () {
            this.loggedIn = sessionStorage.getItem('authtoken') !== null;
            this.username = sessionStorage.getItem('username');
            this.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs'
            }).then(function () {
                this.partial('./templates/about/about.hbs');
            });
        });

        // LOGIN LOGIC
        this.get('#/login', function () {
            this.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                loginForm: './templates/login/loginForm.hbs'
            }).then(function () {
                this.partial('./templates/login/loginPage.hbs');
            });
        });

        this.post('#/login', function (ctx) {
            let username = this.params.username;
            let password = this.params.password;

            authenticator.login(username, password)
                .then(function (userInfo) {
                    authenticator.saveSession(userInfo);
                    authenticator.showInfo('Successfully logged in!');
                    displayHome(ctx);
                })
                .catch(authenticator.handleError)
        });

        // REGISTER LOGIC
        this.get('#/register', function () {
            this.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                registerForm: './templates/register/registerForm.hbs'
            }).then(function () {
                this.partial('./templates/register/registerPage.hbs');
            });
        });

        this.post('#/register', function (ctx) {
            let username = this.params.username;
            let password = this.params.password;
            let repeatPassword = this.params.repeatPassword;
            
            if (password !== repeatPassword) {
                authenticator.showError('PASSWORDS MUST MATCH!');
            } else {
                authenticator.register(username, password, repeatPassword)
                    .then(function (userInfo) {
                        authenticator.saveSession(userInfo);
                        authenticator.showInfo('Successfully registered!');
                        displayHome(ctx);
                    })
                    .catch(authenticator.handleError)
            }
        });

        this.get('#/logout', function (ctx) {
            authenticator.logout()
                .then(function () {
                    sessionStorage.clear();
                    authenticator.showInfo('Logged out!');
                    displayHome(ctx);
                })
                .catch(authenticator.handleError);
        });

        // CATALOG LOGIC
        this.get('#/catalog', displayCatalog);

        // CREATE TEAM
        this.get('#/create', function () {
            this.loggedIn = sessionStorage.getItem('authtoken') !== null;
            this.username = sessionStorage.getItem('username');
            this.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                createForm: './templates/create/createForm.hbs'
            }).then(function () {
                this.partial('./templates/create/createPage.hbs');
            });
        });

        this.post('#/create', function (ctx) {
            let teamName = ctx.params.name;
            let teamComment = ctx.params.comment;

            teamsService.createTeam(teamName, teamComment)
                .then(function (data) {
                    teamsService.joinTeam(data._id)
                        .then((newData) => {
                            authenticator.saveSession(newData);
                            authenticator.showInfo('TEAM HAS BEEN CREATED!');
                            displayCatalog(ctx);
                        });
                });
        });


        // TEAM DETAILS
        this.get('#/catalog/:id', function (ctx) {
            let teamId = ctx.params.id.substr(1);
            teamsService.loadTeamDetails(teamId)
                .then(function (teamInfo) {
                    ctx.loggedIn = sessionStorage.getItem('authtoken') !== null;
                    ctx.username = sessionStorage.getItem('username');
                    ctx.name = teamInfo.name;
                    ctx.comment = teamInfo.comment;
                    ctx.members = teamInfo.members;
                    ctx.teamId = teamInfo._id;
                    ctx.isOnTeam = teamInfo._id === sessionStorage.getItem('teamId');
                    ctx.isAuthor = teamInfo._acl.creator === sessionStorage.getItem('userId');
                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        teamMember: './templates/catalog/teamMember.hbs',
                        teamControls: './templates/catalog/teamControls.hbs'
                    }).then(function () {
                        this.partial('./templates/catalog/details.hbs');
                    })
                });

        });

        // LEAVE TEAM
        this.get('#/leave', function (ctx) {
            teamsService.leaveTeam()
                .then(function (response) {
                    authenticator.saveSession(response);
                    authenticator.showInfo('TEAM HAS BEEN LEFT!');
                    displayCatalog(ctx);
                });
        });

        // JOIN TEAM
        this.get('#/join/:id', function (ctx) {
            let teamId = this.params.id.substr(1);
            teamsService.joinTeam(teamId)
                .then((data) => {
                    authenticator.saveSession(data);
                    authenticator.showInfo('TEAM HAS BEEN JOINED!');
                    displayCatalog(ctx);
                });
        });

        // EDIT TEAM
        this.get('#/edit/:id', function (ctx) {
            ctx.loggedIn = sessionStorage.getItem('authtoken') !== null;
            ctx.username = sessionStorage.getItem('username');
            ctx.teamId = this.params.id.substr(1);
            teamsService.loadTeamDetails(ctx.teamId)
                .then((teamInfo) => {
                    ctx.name = teamInfo.name;
                    ctx.comment = teamInfo.comment;
                    this.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        editForm: './templates/edit/editForm.hbs'
                    }).then(function () {
                        this.partial('./templates/edit/editPage.hbs');
                    })
                })
        });

        this.post('#/edit/:id', function (ctx) {
            let teamId = ctx.params.id.substr(1);
            let teamName = ctx.params.name;
            let teamComment = ctx.params.comment;

            teamsService.edit(teamId, teamName, teamComment)
                .then(function () {
                    authenticator.showInfo(`TEAM ${teamName} EDITED!`);
                    displayCatalog(ctx);
                })
        });

        function displayHome(ctx) {
            ctx.loggedIn = sessionStorage.getItem('authtoken') !== null;
            ctx.username = sessionStorage.getItem('username');
            ctx.hasTeam = sessionStorage.getItem('teamId') !== "undefined"
                || sessionStorage.getItem('teamId') !== null;
            ctx.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs'
            }).then(function () {
                this.partial('./templates/home/home.hbs');
            });
        }

        function displayCatalog(ctx) {
            teamsService.loadTeams()
                .then(function (data) {
                    ctx.loggedIn = sessionStorage.getItem('authtoken') !== null;
                    ctx.username = sessionStorage.getItem('username');
                    ctx.hasTeam = sessionStorage.getItem('teamId') !== null;
                    ctx.hasNoTeam = sessionStorage.getItem('teamId') === null
                        || sessionStorage.getItem('teamId') === "undefined";
                    ctx.teams = data;
                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        team: './templates/catalog/team.hbs'
                    }).then(function () {
                        this.partial('./templates/catalog/teamCatalog.hbs');
                    });
                });
        }
    });

    app.run();
});