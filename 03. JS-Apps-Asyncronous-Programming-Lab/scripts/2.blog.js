function attachEvents() {
    const kinveyAppId = 'kid_ByQVWW9UZ';
    const serviceUrl = 'https://baas.kinvey.com/appdata/' + kinveyAppId;
    const kinveyUsername = 'peter';
    const kinveyPassword = 'p';
    const base64auth = btoa(kinveyUsername + ':' + kinveyPassword);
    const authHeaders = {
        'Authorization': 'Basic ' + base64auth
    };
    $('#btnLoadPosts').click(loadPosts);
    $('#btnViewPost').click(viewPost);


    // ajax request
    function request(endpoint) {
        return $.ajax({
            method: 'GET',
            url: serviceUrl + endpoint,
            headers: authHeaders
        })
    }

    // Load all of the posts in a select with options
    function loadPosts() {
        request('/posts/')
            .then(displayPosts)
            .catch(handleError)
    }
    
    // View a selected post and it's comments
    function viewPost() {
        let selectedPostId = $('#posts').val();
        if(!selectedPostId){
            return; // If there is no selected option we shouldn't do anything
        }

        let loadPostPromise = request('/posts/' + selectedPostId);
        let loadPostCommentsPromise = request('/comments/' + `?query={"post_id":"${selectedPostId}"}`);

        // The execution is syncronous (the promises are executed from first to last)
        Promise.all([loadPostPromise, loadPostCommentsPromise])
            .then(displayPostAndComments)
            .catch(handleError);
    }
    
    function displayPosts(postsArr) {
        let select = $('#posts');
        select.empty();
        for(let postObj of postsArr) {
            let option = $('<option>')
                .attr('value', postObj['_id'])
                .text(postObj['title']);
            select.append(option);
        }
    }

    function displayPostAndComments(data) {
        let [postData, commentsData] = data;
        $('#post-title').text(postData['title']);
        $('#post-body').text(postData['body']);
        let commentsList = $('#post-comments');
        commentsList.empty();
        for(let comment of commentsData) {
            commentsList.append($('<li>')
                .text(comment['text']))
        }
    }

    // If the AJAX call fails an error pops up at the top of the body
    // and after a view seconds it fades out
    function handleError(err) {
        let errorDiv = $("<div>").text("Error: " +
            err.status + ' (' + err.statusText + ')');
        $(document.body).prepend(errorDiv);
        setTimeout(function() {
            $(errorDiv).fadeOut(function() {
                $(errorDiv).remove();
            });
        }, 3000);
    }
}