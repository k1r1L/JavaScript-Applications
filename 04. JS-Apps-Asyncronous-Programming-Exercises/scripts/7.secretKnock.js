(function () {
    let message = 'Knock Knock.';
    const baseUrl = 'https://baas.kinvey.com/appdata/kid_BJXTsSi-e';
    const kinveyUsername = 'guest';
    const kinveyPassword = 'guest';
    const base64auth = btoa(kinveyUsername + ":" +kinveyPassword);
    const authHeader = {
        'Authorization': 'Basic ' + base64auth,
        'Content-type': 'application/json'
    };
    login();

    function login() {
        let credentials = {
            username: kinveyUsername,
            password: kinveyPassword
        };

        $.ajax({
            method: 'POST',
            url: baseUrl + '/login',
            headers: authHeader,
            data: JSON.stringify(credentials)
        });
    }

    $('#btnLoad').click(function () {
        $.ajax({
            method: 'GET',
            url: baseUrl + `/knock?query=${message}`,
            headers: authHeader
        }).then(displayNewMessage)
    });

    function displayNewMessage(data) {
        message = data['message'];
        let answer = data['answer'];
        $('#messages')
            .append($('<li>')
                .text(`MESSAGE: ${message} ANSWER: ${answer}`))
    }
})()