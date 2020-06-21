let UNIT = 'us';
let TIME_RANGE= 'hourly';

document.addEventListener('DOMContentLoaded', (event) => {
    _addingToggleClickListener();
    _detailsSectionScrollableByMouse();
    _addingSegmentClickListener();
});

_getForecastData().then(_render);

/**
 * adding toggle functionality and handling on temp toggle
 * @private
 */
function _addingToggleClickListener () {
    const buttons = document.querySelectorAll('#units-section div.toggle button');
    buttons.forEach((btn, index) => {
        btn.onclick = () => {
            const otherBtnIndex = index ? 0 : 1;
            btn.classList.add("selected");
            buttons[otherBtnIndex].classList.remove("selected");
            UNIT = btn.innerText === 'C' ? 'si' : 'us';
            _getForecastData(UNIT).then(_render);
        }
    });
}

/**
 * make details Section Scrollable with mouse whale
 * @private
 */
function _detailsSectionScrollableByMouse() {
    const target = document.querySelector('.details-section')

    target.addEventListener('wheel', event => {
        const toLeft  = event.deltaY < 0 && target.scrollLeft > 0
        const toRight = event.deltaY > 0 && target.scrollLeft < target.scrollWidth - target.clientWidth

        if (toLeft || toRight) {
            event.preventDefault()
            target.scrollLeft += event.deltaY
        }
    });
}

/**
 * adding toggle functionality and handling on details section
 * @private
 */
function _addingSegmentClickListener () {
    const tabs = document.querySelectorAll('.forecast div.segment .tab');
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            const otherBtnIndex = index ? 0 : 1;
            tab.classList.add("selected");
            tabs[otherBtnIndex].classList.remove("selected");
            TIME_RANGE = tab.innerText.toLowerCase();
            _getForecastData().then(_renderDetailsSection);
        });
    });
}

/**
 * Calling API from Server class to get the forecast data
 * @param unit {'us' | 'si' } : the units system we want to use
 * @return {Promise<ReadableStream<Uint8Array>>}: resolves with forecast data
 * @private
 */
async function _getForecastData (unit = UNIT) {
    console.log('#DEBUG unit => ', unit)
    return  await Service.getForecastData(unit);
}

/**
 * Renders everything
 * @param forecastData: forecast data array that comes from API
 * @private
 */
function _render (forecastData) {
    _renderMainSection(forecastData);
    _renderDetailsSection(forecastData);
}

/**
 * Render the details section of forecast
 * @param forecastData: forecast data array that comes from API
 * @param timeRange {'hourly' | 'daily' }: the segment value.
 * @private
 */
function _renderDetailsSection(forecastData, timeRange = TIME_RANGE) {
    _addDetailsSection ();
    const detailsSection = document.querySelector('.forecast .details-section');
    console.log(timeRange);
    const dataArray = forecastData[timeRange]['data'];
    let timeFormat = timeRange === "hourly"? 'HH:mm': 'ddd D';

    dataArray.forEach((item, i) => {
        let itemElement;
        if (timeRange === 'hourly') itemElement = i ?  _makeItem(item, timeFormat) : _makeItem(item, '[Now]');
        else  itemElement = i ?  _makeItem(item, timeFormat) : _makeItem(item, '[Today]');
        detailsSection.appendChild(itemElement);
    });

    document.querySelector('.spinner-container').remove()

    /**
     * Build the details item
     * @param itemData: the data that comes form API that related to this item
     * @param timeFormat {String}: the format of the time of this item
     * @return {HTMLDivElement}: DOM node
     * @private
     */
    function _makeItem (itemData, timeFormat) {
        const item = document.createElement('div');
        item.className = 'forecast-item';
        if (TIME_RANGE === 'daily') item.className = 'forecast-item daily';
        const timeItem = document.createElement('div');
        timeItem.className = 'time';
        timeItem.innerText = moment(itemData['time'] * 1000).format(timeFormat);

        const iconItem = document.createElement('img');
        iconItem.src = itemData['icon'].startsWith('clear')? 'assets/images/clear.svg':'assets/images/cloudy.svg';

        const degreeItem = document.createElement('div');
        degreeItem.className = 'today-degree';
        if (!itemData['temperature']) {
            degreeItem.innerHTML = `${itemData['temperatureMax'].toFixed(0)}&#730/${itemData['temperatureMin'].toFixed(0)}&#730`;
        }
        else degreeItem.innerHTML = `${itemData['temperature'].toFixed(0)}&#730`;

        item.append(timeItem, iconItem, degreeItem);

        return item;
    }

    /**
     * removes the old details section if exist and add a new one with new items
     * @private
     */
    function _addDetailsSection() {
        const section = document.querySelector('.forecast .details-section');
        const newSection = document.createElement('div');
        newSection.className = 'details-section';
        if (section) section.remove();
        document.querySelector('.forecast').append(newSection);
        _detailsSectionScrollableByMouse();
    }
}

/**
 * render the main section that contains the data about location and the current weather
 * @param forecastData: forecast data that comes form the API of darksky
 * @private
 */
function _renderMainSection (forecastData) {
    const currentData = forecastData['currently']
    const todayDate = moment(currentData['time'] * 1000).format('dddd DD, YYYY');
    document.getElementById('city-name').innerText = 'New Cairo';
    document.getElementById('today-date').innerText = todayDate;

    const currentStatusElem = document.getElementById('current-description')
    currentStatusElem.innerText = currentData['summary'];

    const leftCol =  document.querySelector('.main-data .left-col')
    const currentIcon = document.createElement('img');
    currentIcon.src = currentData['icon'].startsWith('clear')? 'assets/images/clear.svg':'assets/images/cloudy.svg';
    currentIcon.alt = 'Current weather';

    const imgs = leftCol.getElementsByTagName('img');
    if (imgs.length) leftCol.removeChild(imgs[0]);
    leftCol.insertBefore( currentIcon , currentStatusElem);

    const todayData = forecastData['daily']['data'][0];
    document.getElementById('today-degree').innerHTML = currentData['temperature'].toFixed(0)+'&#730';
    document.getElementById('from-to').innerHTML
        = `${todayData['temperatureMax'].toFixed(0)}&#730 / ${todayData['temperatureMin'].toFixed(0)}&#730`;
    document.getElementById('long-description').innerText = todayData['summary'];
}
