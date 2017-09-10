function attachEvents() {
    const baseUrl = `https://judgetests.firebaseio.com/`;
    $('#submit').click(getForecast);

    // AJAX GET request to firebase (returns the promise)
    function request(endpoint) {
        return $.ajax({
            method: 'GET',
            url: baseUrl + endpoint,
        })
    }

    // Gets the forecast for the wanted location (or error)
    function getForecast() {
        request('locations.json')
            .then(displayForecast)
            .catch(handleError);

        function displayForecast(allLocations) {
            let location = $('#location').val();
            let locationCode = allLocations
                .filter(l => l['name'] === location)
                .map(l => l['code'])[0];
            if (!locationCode) {
                handleError(); // If the code does not exist (handle error)
            }

            let weatherSymbols = {
                'Sunny': '&#x2600;',
                'Partly sunny': '&#x26C5;',
                'Overcast': '&#x2601;',
                'Rain': '&#x2614;'
            };
            let currentConditionP = request(`forecast/today/${locationCode}.json`);
            let threeDaysConditionP = request(`forecast/upcoming/${locationCode}.json `);

            // Synchronize the promises (firstly load the current condition and after that the upcoming conditions)
            Promise.all([currentConditionP, threeDaysConditionP])
                .then(displayCondition)
                .catch(handleError);

            function displayCondition([currentCondition, upcomingCondition]) {
                $('#forecast').css('display', 'block'); // Unlock div
                appendDataToCurrent();
                appendDataToUpcoming();

                function appendDataToCurrent() {
                    let current = $('#current');
                    current.empty();
                    let condition = currentCondition['forecast']['condition'];
                    let name = currentCondition['name'];
                    let low = currentCondition['forecast']['low'];
                    let high = currentCondition['forecast']['high'];
                    current
                        .append($('<div class="label">Current conditions</div>'))
                        .append($('<span>')
                            .addClass('condition symbol')
                            .html(weatherSymbols[condition]))
                        .append($('<span>')
                            .addClass('condition')
                            .append($('<span>')
                                .addClass('forecast-data')
                                .text(name))
                            .append($('<span>')
                                .addClass('forecast-data')
                                .html(`${low}&#176;/${high}&#176;`))
                            .append($('<span>')
                                .addClass('forecast-data')
                                .text(condition)));
                }

                function appendDataToUpcoming() {
                    let upcoming = $('#upcoming');
                    upcoming.empty();
                    upcoming.append($('<div class="label">Three-day forecast</div>'));
                    for(let forecast of upcomingCondition['forecast']) {
                        let condition = forecast['condition'];
                        let low = forecast['low'];
                        let high = forecast['high'];
                        upcoming.append($('<span>')
                            .addClass('upcoming')
                            .append($('<span>')
                                .addClass('symbol')
                                .html(weatherSymbols[condition]))
                            .append($('<span>')
                                .addClass('forecast-data')
                                .html(`${low}&#176;/${high}&#176;`))
                            .append($('<span>')
                                .addClass('forecast-data')
                                .text(condition)))
                    }
                }
            }
        }
    }

    // Display error in forecast section
    function handleError() {
        $('#forecast')
            .css('display', 'block') // Unlock div
            .text('Error');
    }
}