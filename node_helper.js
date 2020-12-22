var NodeHelper = require("node_helper");
const fetchFlights = require('./airport_timetable_fetcher.js');
const { FETCH_ERROR, FETCH_SUCCESS, INIT } = require("./constants.js");

module.exports = NodeHelper.create({

    start: function function_name() {
        "use-strict"
        this.isInitialized = false;
    },

    socketNotificationReceived: function (notification, payload) {
        "use strict";
        var self = this;

        if (notification === INIT) {
            this.config = payload;
        }

        console.log(self.config.refreshInterval)
        if (!this.isInitialized) {
            self.getFlights();

            setInterval(function () {
                self.getFlights();
            }, self.config.refreshInterval * 1000);
        }

        this.isInitialized = true;
    },

    addDirection: function (flights, direction) {
        return flights.map(flight => {
            flight['direction'] = direction
            return flight;
        })
    },

    getFlights: function () {
        var self = this;
        const sendNotificationSuccess = (dataType) => (data) => {
            var data = self.addDirection(data, dataType);
            self.sendSocketNotification(FETCH_SUCCESS, data)
        }

        const sendNotificationError = () => {
            self.sendSocketNotification(FETCH_ERROR, null)
        }

        var queryParam = 'max=' + self.config.maxItemsToFetch;
        var generateUrl = (direction) => `${self.config.airportTimetableApiUrl}/${direction}?${queryParam}`

        self.sendSocketNotification('NEW_FETCH', null);
        fetchFlights(sendNotificationSuccess('arrival'), sendNotificationError)(generateUrl("arrivals"))
        fetchFlights(sendNotificationSuccess('departure'), sendNotificationError)(generateUrl("departures"))
    }
});