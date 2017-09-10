function loadCommits() {
    let username = $('#username').val();
    let repo = $('#repo').val();
    let list = $('#commits');
    list.empty();

    let getRequest = {
        method: 'GET',
        url: `https://api.github.com/repos/${username}/${repo}/commits`,
        success: displayCommits,
        error: handleError
    };

    // AJAX call...
    $.ajax(getRequest);

    // Displays all the commits in a repository
    function displayCommits(data) {
        for(let obj of data) {
            let commit = $('<li>')
                .text(`${obj['commit']['author']['name']}: ${obj['commit']['message']}`);
            list.append(commit);
        }
    }

    // Handles the AJAX error
    function handleError(reject) {
        let error = $('<li>')
            .text(`Error: ${reject['status']} (${reject['statusText']})`);

        list.append(error);
    }
}