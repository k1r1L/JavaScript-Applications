let postsController = (() => {

    function getAllPosts(ctx) {
        ctx.isAuth = authenticator.isAuth();
        ctx.username = sessionStorage.getItem('username');

        postsService.loadAllPosts()
            .then((posts) => {
                let rank = 1;
                posts.forEach(p => {
                    p.isAuthor = p.author === sessionStorage.getItem('username');
                    p.rank = rank++;
                    p.time = calcTime(p._kmd.ect);
                });
                ctx.posts = posts;

                ctx.loadPartials({
                    header: './templates/common/header.hbs',
                    footer: './templates/common/footer.hbs',
                    menu: './templates/common/menu.hbs',
                    post: './templates/catalog/post.hbs',
                }).then(function () {
                    this.partial('./templates/catalog/catalog.hbs');
                })
            }).catch(notify.handleError);
    }

    function getCreatePost(ctx) {
        ctx.isAuth = authenticator.isAuth();
        ctx.username = sessionStorage.getItem('username');

        ctx.loadPartials({
            header: './templates/common/header.hbs',
            footer: './templates/common/footer.hbs',
            menu: './templates/common/menu.hbs',
            createPostForm: './templates/forms/createPostForm.hbs'
        }).then(function () {
            this.partial('./templates/create/createPage.hbs');
        })
    }

    function postCreatePost(ctx) {
        let author = sessionStorage.getItem('username');
        let url = ctx.params.url;
        let title = ctx.params.title;
        let image = ctx.params.image;
        let description = ctx.params.description;

        let isValid = validateCreatePost(url, title);
        if(isValid){
            postsService.createPost(author, title, description, url, image)
                .then(() => {
                    notify.showInfo('Post created.');
                    ctx.redirect('#/catalog');
                }).catch(notify.handleError);
        }
    }

    function getEditPost(ctx) {
        let postId = ctx.params.id.substr(1);
        ctx.isAuth = authenticator.isAuth();
        ctx.username = sessionStorage.getItem('username');

        postsService.loadPostById(postId)
            .then((postInfo) => {
                ctx._id = postInfo._id;
                ctx.url = postInfo.url;
                ctx.title = postInfo.title;
                ctx.imageUrl = postInfo.imageUrl;
                ctx.description = postInfo.description;
                ctx.loadPartials({
                    header: './templates/common/header.hbs',
                    footer: './templates/common/footer.hbs',
                    menu: './templates/common/menu.hbs',
                    editPostForm: './templates/forms/editPostForm.hbs'
                }).then(function () {
                    this.partial('./templates/edit/editPage.hbs');
                })
            }).catch(notify.handleError);
    }

    function postEditPost(ctx) {
        let postId = ctx.params.id.substr(1);
        let author = sessionStorage.getItem('username');
        let url = ctx.params.url;
        let title = ctx.params.title;
        let image = ctx.params.image;
        let description = ctx.params.description;
        let isValid = validateCreatePost(url, title);

        if(isValid){
            postsService.editPost(postId, author , title, description, url, image)
                .then(() => {
                    notify.showInfo(`Post ${title} updated.`);
                    ctx.redirect('#/catalog');
                }).catch(notify.handleError);
        }
    }

    function handleDeletePost(ctx) {
        let postId = ctx.params.id.substr(1);

        postsService.deletePost(postId)
            .then(() => {
                notify.showInfo('Post deleted.');
                ctx.redirect('#/catalog');
            }).catch(notify.handleError);
    }

    function getMyOwnPosts(ctx) {
        let username = sessionStorage.getItem('username');
        ctx.isAuth = authenticator.isAuth();
        ctx.username = sessionStorage.getItem('username');

        postsService.loadOwnPosts(username)
            .then((posts) => {
                let rank = 1;
                posts.forEach(p => {
                    p.isAuthor = p.author === sessionStorage.getItem('username');
                    p.rank = rank++;
                    p.time = calcTime(p._kmd.ect);
                });
                ctx.posts = posts;

                ctx.loadPartials({
                    header: './templates/common/header.hbs',
                    footer: './templates/common/footer.hbs',
                    menu: './templates/common/menu.hbs',
                    post: './templates/catalog/post.hbs',
                }).then(function () {
                    this.partial('./templates/catalog/catalog.hbs');
                })
            }).catch(notify.handleError);
    }

    function getPostDetails(ctx) {
        let postId = ctx.params.id.substr(1);
        ctx.isAuth = authenticator.isAuth();
        ctx.username = sessionStorage.getItem('username');

        let postInfoPromise = postsService.loadPostById(postId);
        let commentsPromise = commentsService.loadAllCommentsInPost(postId);

        Promise.all([postInfoPromise, commentsPromise])
            .then(([postInfo, comments]) => {
                ctx.imageUrl = postInfo.imageUrl;
                ctx.title = postInfo.title;
                ctx.description = postInfo.description;
                comments.forEach(c => {
                    c.isAuthor = c.author === sessionStorage.getItem('username');
                    c.postId = postInfo._id;
                });
                ctx.comments = comments;

                ctx.loadPartials({
                    header: './templates/common/header.hbs',
                    footer: './templates/common/footer.hbs',
                    menu: './templates/common/menu.hbs',
                    createCommentForm: './templates/forms/createCommentForm.hbs',
                    post: './templates/details/post.hbs',
                    comment: './templates/details/comment.hbs'
                }).then(function () {
                    this.partial('./templates/details/postDetails.hbs');
                })
            })
    }

    function validateCreatePost(url, title) {
        if(url === ""){
            notify.showError('Link url should not be empty!');
            return false;
        }

        if(title === ""){
            notify.showError('Post title should not be empty!');
            return false;
        }

        if(!url.startsWith('http')){
            notify.showError('Url should be a valid link!');
            return false;
        }

        return true;
    }

    // HELPER FUNCTION FOR TIME
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

    return {
        getAllPosts,
        getCreatePost,
        postCreatePost,
        getEditPost,
        postEditPost,
        handleDeletePost,
        getMyOwnPosts,
        getPostDetails
    }
})()