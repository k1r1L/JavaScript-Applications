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
    async function getForecast() {
        try {
            let allLocations = await request('locations.json');
            let location = $('#location').val();
            let locationCode = allLocations
                .filter(l => l['name'] === location)
                .map(l => l['code'])[0];
            if (!locationCode) {
                handleError(); // If the code does not exist (handle error)
            }

            let currentCondition = await request(`forecast/today/${locationCode}.json`);
            let upcomingCondition = await request(`forecast/upcoming/${locationCode}.json `);

            displayCondition(currentCondition, upcomingCondition);

        } catch (err) {
            handleError();
        }

        function displayCondition(currentCondition, upcomingCondition) {
            let weatherSymbols = {
                'Sunny': '&#x2600;',
                'Partly sunny': '&#x26C5;',
                'Overcast': '&#x2601;',
                'Rain': '&#x2614;'
            };

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
                for (let forecast of upcomingCondition['forecast']) {
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

    // Display error in forecast section
    function handleError() {
        $('#forecast')
            .css('display', 'block') // Unlock div
            .text('Error');
    }
}