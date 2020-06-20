
class Service {

    /**
     * Makes a fetch request to get forecast data based on location.
     * @param unit {'us' | 'si'}: unit stander
     * @return {Promise<ReadableStream<Uint8Array>>}
     */
    static getForecastData (unit= "us") {
        return new Promise((async (resolve, reject) => {
            try {
                const cord = await this._getLocation();
                console.log('#DEBUG cord ', cord);

                // using external proxy because darksky blocks origins for security reasons
                // for more info check https://darksky.net/dev/docs/faq#cross-origin
                const CORS_API_HOST = 'cors-anywhere.herokuapp.com';
                const CORS_API_URL = 'https://' + CORS_API_HOST + '/';

                const URL = CORS_API_URL + this._getDarkSkyAPIURL(cord.lat, cord.long, unit);
                console.log('#DEBUG url => ', URL);
                const xhr = new XMLHttpRequest();

                xhr.open('GET', URL, true);
                xhr.send();
                xhr.onload = () => {
                    if (xhr.status === 200) {
                        const data = JSON.parse(xhr.responseText);
                        return resolve(data);
                    }
                }
                xhr.onerror = reject;
            }catch (e) {
                reject(e);
            }
        }));
    }
    /**
     * build the final dark sky API URL using location information.
     * @param lat {Number}: latitude coordination
     * @param long {Number}: longitude coordination
     * @param unit {'us' | 'si'}: unit stander
     * @return {string}: final URL
     * @private
     */
    static _getDarkSkyAPIURL (lat, long, unit= "us") {
        const API_KEY = 'a177f8481c31fa96c3f95ad4f4f84610';

        return `https://api.darksky.net/forecast/${API_KEY}/${lat},${long}?exclude=alerts,flags,minutely&units=${unit}`;
    }

    /**
     * this function gets the location of the user
     * @return {Promise<{long: Number, lat: Number}>}:
     * that resolves with coordination log and lat if the user gives the permission
     */
    static _getLocation () {
        return new Promise(((resolve, reject) => {
            navigator.geolocation.getCurrentPosition((pos) => {
               const cord = {long: pos.coords.longitude, lat: pos.coords.latitude};
               resolve(cord)
            }, reject, {enableHighAccuracy: true});
        }))
    }
}
