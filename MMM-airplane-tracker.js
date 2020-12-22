Module.register("MMM-airplane-tracker", {
    defaults: {},

    getStyles: function () {
        "use strict";
        return ["font-awesome.css"];
    },

    getScripts: function () {
        return [
            this.file('constants.js'),
        ]
    },

    start: function () {
        "use-strict";
        this.message = "Ładuję...";
        this.dataFetched = false;
        this.flights = new Set();
        this.sendSocketNotification(INIT, this.config);
    },

    updateFlights: function (newFlights) {
        newFlights.forEach(flight => {
            flight.details = null;
            this.flights.add(JSON.stringify(flight))
        })
    },

    socketNotificationReceived: function (notification, data) {
        "use strict";

        switch (notification) {
            case FETCH_SUCCESS:
                this.message = null
                this.dataFetched = true;
                this.updateFlights(data);
                this.updateDom();
                break;
            case 'NEW_FETCH':
                this.flights = new Set();
                break;
            case FETCH_ERROR:
                this.message = 'Problem z pobraniem lotów...'
                this.flights = new Set();
                this.dataFetched = false;
                this.updateDom();
                break;
        }
    },

    renderTable: function (data) {
        var table = document.createElement("table");
        let headRow = document.createElement("tr");
        let arrivals = document.createElement("td");
        arrivals.innerHTML = '<i class="fas fa-plane-arrival"></i>';
        let departures = document.createElement("td");
        departures.innerHTML = '<i class="fas fa-plane-departure"></i>';
        let flightInfo = document.createElement("td");
        flightInfo.innerHTML = '<i class="fas fa-city"></i>';
        flightInfo.style = 'text-align:center;'
        headRow.appendChild(arrivals);
        headRow.appendChild(departures);
        headRow.appendChild(flightInfo);

        table.appendChild(headRow);

        for (var index in data.slice(0, this.config.maxItems)) {
            let row = document.createElement("tr");
            let flightCity = document.createElement("td");
            flightCity.innerHTML = data[index].flight_city;
            flightCity.style = 'text-align:center'
            let arrival = document.createElement("td");
            let departure = document.createElement("td");
            if (data[index].direction === 'arrival') {
                arrival.innerHTML = data[index].time + '&nbsp;&nbsp;';
            }
            else {
                departure.innerHTML = data[index].time + '&nbsp;&nbsp;';
            }
            row.appendChild(arrival);
            row.appendChild(departure);
            row.appendChild(flightCity);

            table.appendChild(row)
        }

        return table;
    },

    sortFlightsByTime: function (flight1, flight2) {
        if (flight1.time < flight2.time) {
            return -1;
        }
        else if (flight2.time < flight1.time) {
            return 1;
        }
        else {
            return 0;
        }
    },

    getDom: function () {
        var wrapper = document.createElement("div");

        if (!this.dataFetched) {
            wrapper.innerHTML = this.message;
            return wrapper;
        }
        else {
            var sortedFlights = Array.from(this.flights)
                .map(flight => JSON.parse(flight))
            //.sort(this.sortFlightsByTime)
            var table_arrivals = this.renderTable(sortedFlights)
            wrapper.appendChild(table_arrivals);

            return wrapper;
        }
    }
});