$(() => {
    // Define routes
    const app = Sammy('#container', function () {
        this.use('Handlebars', 'hbs');

        // Home & Default routes
        this.get('index.html', homeController.getWelcomePage);
        this.get('#/home', homeController.getWelcomePage);
        this.get('#/about', homeController.getAboutPage);

        // Authentication
        this.post('#/register', accountController.postRegister);
        this.post('#/login', accountController.postLogin);
        this.get('#/logout', accountController.logout);

        // Catalog
        this.get('#/catalog', postsController.getAllPosts);

        // Create Post
        this.get('#/createPost', postsController.getCreatePost);
        this.post('#/createPost', postsController.postCreatePost);

        // Edit Post
        this.get('#/editPost/:id', postsController.getEditPost);
        this.post('#/editPost/:id', postsController.postEditPost);

        // Delete Post
        this.get('#/deletePost/:id', postsController.handleDeletePost);

        // My Own Posts
        this.get('#/profile', postsController.getMyOwnPosts);

        // Post Details
        this.get('#/details/:id', postsController.getPostDetails);

        // Comments
        this.post('#/createComment', commentsController.createComment);
        this.get('#/deleteComment/:id', commentsController.deleteComment);
    });

    app.run(); // run app

});