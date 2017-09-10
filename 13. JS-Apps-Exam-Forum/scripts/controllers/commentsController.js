let commentsController = (() => {
    function createComment(ctx) {
        let postId = location.hash.substr(location.hash.indexOf(':') + 1);
        let content = ctx.params.content;
        let author = sessionStorage.getItem('username');

        commentsService.createComment(author, content, postId)
            .then(() => {
                notify.showInfo('Comment created.');
                ctx.redirect(`#/details/:${postId}`);
            }).catch(notify.handleError);
    }

    function deleteComment(ctx) {
        let commentId = ctx.params.id.substr(1);

        commentsService.deleteComment(commentId)
            .then(() => {
                notify.showInfo('Comment deleted.');
                window.history.go(-1); // Go back to previous page
            }).catch(notify.handleError);
    }

    return {
        createComment,
        deleteComment
    }
})()