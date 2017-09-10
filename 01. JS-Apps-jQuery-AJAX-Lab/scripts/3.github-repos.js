function loadRepos() {
    let list = $('#repos');
    list.empty();
    let username = $('#username').val();
    let request = {
        url: `https://api.github.com/users/${username}/repos`,
        success: displayRepos,
        error: displayError
    };

    $.ajax(request);

    function displayRepos(repos) {
        for(let repo of repos) {
            console.log(repo);
            let listItem = $(`<li><a href="${repo['html_url']}"target="_blank">${repo['full_name']}</a></li>`);
            list.append(listItem);
        }
    }

    function displayError() {
        list.append($("<li>Error</li>"));
    }
}