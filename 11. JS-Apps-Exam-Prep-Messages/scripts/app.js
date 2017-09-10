$(() => {

    // Attach event handlers
    (() => {
        $('header').find('a[data-target]').click(navigateTo);
        $('#formRegister').find('input[type="submit"]').click(register);
        $('#formLogin').find('input[type="submit"]').click(login);
        $('#formSendMessage').find('input[type="submit"]').click(sendMessage);
        $('#linkMenuLogout').click(logout);
        $('#linkUserHomeMyMessages').click(() => {
            showView('MyMessages');
            loadReceivedMessages();
        });
        $('#linkUserHomeSendMessage').click(() => {
            showView('SendMessage');
            displaySendMessageForm();
        });
        $('#linkUserHomeArchiveSent').click(() => {
            showView('ArchiveSent') ;
            loadArchiveMessages();
        });
        $('#linkMenuMyMessages').click(loadReceivedMessages);
        $('#linkMenuArchiveSent').click(loadArchiveMessages);
        $('#linkMenuSendMessage').click(displaySendMessageForm);
        $('.notification').click(function()  {
            $(this).hide();
        });
    })();


    if(sessionStorage.getItem('authtoken') === null){
        userLoggedOut();
    } else {
        userLoggedIn();
    }

    // REGISTER LOGIC
    function register(ev) {
        ev.preventDefault();
        let usernameField = $('#registerUsername');
        let passwordFiled = $('#registerPasswd');
        let nameField = $('#registerName');
        let username = usernameField.val();
        let password = passwordFiled.val();
        let name = nameField.val();

        authenticator.register(username, password, name)
            .then((userInfo) => {
                usernameField.val('');
                passwordFiled.val('');
                nameField.val('');
                saveSession(userInfo);
                showInfo(`User registration successful.`);
            }).catch(handleError);
    }

    // LOGIN LOGIC
    function login(ev) {
        ev.preventDefault();
        let usernameField = $('#loginUsername');
        let passwordField = $('#loginPasswd');
        let username = usernameField.val();
        let password = passwordField.val();

        authenticator.login(username, password)
            .then((userInfo) => {
                usernameField.val('');
                passwordField.val('');
                saveSession(userInfo);
                showInfo('Login successful.');
            }).catch(handleError);
    }

    // LOGOUT LOGIC
    function logout() {
        authenticator.logout()
            .then(() => {
                sessionStorage.clear();
                userLoggedOut();
                showInfo('Logout successful.');
            }).catch(handleError);
    }

    // LOAD MY MESSAGES LOGIC
    function loadReceivedMessages() {
        let username = sessionStorage.getItem('username');
        messagesService.loadReceived(username)
            .then(displayReceivedMessages)
            .catch(handleError);
    }

    function displayReceivedMessages(allMessages) {
        let messagesContainer = $('#myMessages');
        messagesContainer.empty();
        let messagesTable = $('<table>')
            .append($('<thead>').append($('<tr>')
                .append('<th>From</th>')
                .append('<th>Message</th>')
                .append('<th>Date Received</th>')));

        if(allMessages.length === 0){
            messagesContainer.append(messagesTable);
            return;
        }

        let messagesBody = $('<tbody>');
        for(let msg of allMessages) {
            let sender = formatSender(msg['sender_name'], msg['sender_username']);
            let messageText = msg['text'];
            let dateReceived = formatDate(msg['_kmd']['lmt']);
            messagesBody.append($('<tr>')
                .append($(`<td>`).text(sender))
                .append($(`<td>`).text(messageText))
                .append($(`<td>`).text(dateReceived)));
        }

        messagesTable.append(messagesBody);
        messagesContainer.append(messagesTable);
    }

    // LOAD ARCHIVE MESSAGES LOGIC
    function loadArchiveMessages () {
        let username = sessionStorage.getItem('username');
        messagesService.loadArchive(username)
            .then(displayArchiveMessages)
            .catch(handleError);
    }

    function displayArchiveMessages(allMessages) {
        let messagesContainer = $('#sentMessages');
        messagesContainer.empty();
        let messagesTable = $('<table>')
            .append($('<thead>').append($('<tr>')
                .append('<th>To</th>')
                .append('<th>Message</th>')
                .append('<th>Date Received</th>')
                .append('<th>Actions</th>')));

        if(allMessages.length === 0){
            messagesContainer.append(messagesTable);
            return;
        }

        let messagesBody = $('<tbody>');
        for(let msg of allMessages) {
            let receiver = msg['recipient_username'];
            let messageText = msg['text'];
            let dateReceived = formatDate(msg['_kmd']['lmt']);
            messagesBody.append($(`<tr>`)
                .append($(`<td>`).text(receiver))
                .append($(`<td>`).text(messageText))
                .append($(`<td>`).text(dateReceived))
                .append($('<td>')
                    .append($(`<button value="${msg._id}">Delete</button>`).click(deleteMessage))));
        }

        messagesTable.append(messagesBody);
        messagesContainer.append(messagesTable);
    }

    function deleteMessage() {
        let messageId = $(this).val();

        messagesService.deleteMessage(messageId)
            .then(() => {
                showInfo(`Message deleted.`);
                loadArchiveMessages();
            }).catch(handleError);
    }
    
    // SEND MESSAGE LOGIC
    function displaySendMessageForm() {
        messagesService.loadAllUsers()
            .then(displayAllUsers)
            .catch(handleError);
    }

    function displayAllUsers(allUsers) {
        let usersContainer = $('#msgRecipientUsername');
        usersContainer.empty();
        for(let user of allUsers) {
            let username = user['username'];
            let name = user['name'];
            let formattedName = formatSender(name, username);
            usersContainer.append($(`<option value="${username}">${formattedName}</option>`));
        }
    }

    function sendMessage(ev) {
        ev.preventDefault();
        let recipientUsername = $('#msgRecipientUsername').val();
        let msgText = $('#msgText').val();
        let senderName = sessionStorage.getItem('name') === "" ?
            null :
            sessionStorage.getItem('name');
        let senderUsername = sessionStorage.getItem('username');

        if(msgText === ""){
            showError('MESSAGE TEXT CANNOT BE EMPTY');
            return;
        }

        messagesService.sendMessage(senderUsername, senderName, recipientUsername, msgText)
            .then(() => {
                showInfo('Message sent.');
                showView('ArchiveSent');
                loadArchiveMessages();
            }).catch(handleError);
    }


    function navigateTo() {
        let target = $(this).attr('data-target');
        showView(target);
    }

    function showView(viewName) {
        $('main > section').hide();
        $('#view' + viewName).show();
    }


    function userLoggedOut() {
        $('.useronly').hide();
        $('.anonymous').show();
        $('#spanMenuLoggedInUser').text("");
        $('#viewUserHomeHeading').text("");
        showView('AppHome');
    }


    function userLoggedIn() {
        $('.useronly').show();
        $('.anonymous').hide();
        $('#spanMenuLoggedInUser').text(`Welcome, ${sessionStorage.getItem('username')}!`);
        $('#viewUserHomeHeading').text(`Welcome, ${sessionStorage.getItem('username')}!`);
        showView('UserHome');
    }


    function saveSession(userInfo) {
        let userAuth = userInfo._kmd.authtoken;
        sessionStorage.setItem('authtoken', userAuth);
        let userId = userInfo._id;
        sessionStorage.setItem('userId', userId);
        let username = userInfo.username;
        sessionStorage.setItem('username', username);
        let name = userInfo.name;
        sessionStorage.setItem('name', name);
        userLoggedIn();
    }

    function formatDate(dateISO8601) {
        let date = new Date(dateISO8601);
        if (Number.isNaN(date.getDate()))
            return '';
        return date.getDate() + '.' + padZeros(date.getMonth() + 1) +
            "." + date.getFullYear() + ' ' + date.getHours() + ':' +
            padZeros(date.getMinutes()) + ':' + padZeros(date.getSeconds());

        function padZeros(num) {
            return ('0' + num).slice(-2);
        }
    }

    function formatSender(name, username) {
        if (!name)
            return username;
        else
            return username + ' (' + name + ')';
    }


    // Handle notifications
    $(document).on({
        ajaxStart: () => $("#loadingBox").show(),
        ajaxStop: () => $('#loadingBox').fadeOut()
    });
});
