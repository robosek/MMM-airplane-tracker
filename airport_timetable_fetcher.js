const fetch = require("node-fetch");
const Log = require("../../js/logger.js");

const fetchFlights = (sendNotificationSuccess, sendNotificationError) => (endpointUrl) => fetch(endpointUrl)
    .then(
         (response) => {
            if (response.status !== 200) {
                Log.error('[AIRPLANE_TRACKER] Looks like there was a problem fetching flights. Status Code: ' +
                    response.status);
                sendNotificationError()
            }
            else{
                response.json().then((data) => {
                    Log.info('[AIRPLANE_TRACKER] Response is fetched correctly');
                    sendNotificationSuccess(data);
                });
            }
        }
    )
    .catch((err) => {
        Log.error('[AIRPLANE_TRACKER] Fetch Error :-S', err);
        sendNotificationError()
    });
    
module.exports = fetchFlights;