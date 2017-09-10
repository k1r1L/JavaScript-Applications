function getInfo() {
    let stopId = $('#stopId').val();
    let list = $('#buses');
    list.empty();
    let url = `https://judgetests.firebaseio.com/businfo/${stopId}.json`;
    let request = {
        url: url,
        success:  displayStopInfo,
        error: () => $('#stopName').text('Error')
    };

    $.ajax(request);

    function displayStopInfo(busStopInfo) {
        let busName = busStopInfo['name'];
        let buses = busStopInfo['buses'];
        $('#stopName').text(busName);
        for(let busId in buses) {
            let listItem = $('<li>')
                .text(`Bus ${busId} arrives in ${buses[busId]} minutes`);
            list.append(listItem);
        }
    }
}