(function () {
    const baseUrl = 'https://baas.kinvey.com/appdata/kid_BJXTsSi-e/students/';
    const kinveyUsername = 'guest';
    const kinveyPassword = 'guest';
    const base64auth = btoa(kinveyUsername + ':' + kinveyPassword);
    const authHeaders = {
        'Authorization': 'Basic ' + base64auth,
        'Content-type': 'application/json'
    };
    
    $('#btnCreate').click(function (ev) {
        ev.preventDefault();
        let form = $(this).parent();
        let studentId = +form.find('#studentId').val();
        let firstName = form.find('#firstName').val();
        let lastName = form.find('#lastName').val();
        let facultyNumber = form.find('#facultyNumber').val();
        let grade = +form.find('#grade').val();

        let createStudentData = {
            ID: studentId,
            FirstName: firstName,
            LastName: lastName,
            FacultyNumber: facultyNumber,
            Grade: grade
        };

        request('POST', '', createStudentData)
            .then(listAllStudents)
            .catch(handleError);
    });

    function request(method, endpoint, data) {
        return $.ajax({
            method: method,
            url: baseUrl + endpoint,
            headers: authHeaders,
            data: JSON.stringify(data)
        });
    }

    function listAllStudents() {
        request('GET', '')
            .then(displayStudents)
            .catch(handleError);
    }

    function displayStudents(studentsData) {
        let orderedStudents = studentsData
            .sort((a, b) => a['ID'] - b['ID']);
        let table = $('#results');
        for(let student of orderedStudents) {
            let tableRow = $('<tr>');
            tableRow.append($('<th>').text(student['ID']));
            tableRow.append($('<th>').text(student['FirstName']));
            tableRow.append($('<th>').text(student['LastName']));
            tableRow.append($('<th>').text(student['FacultyNumber']));
            tableRow.append($('<th>').text(student['Grade']));
            table.append(tableRow);
        }
    }

    function handleError() {
        $('#results').append($('<tr>').text('ERROR'))
    }

    listAllStudents();
})()