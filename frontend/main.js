const SatelliteGuessGame = (function() {
    let actualLocation = null;
    let userGuess = null;
    let satelliteMap;
    let guessMap;
    let resultMap;
    let citiesGeoJSON = null;
    let currentCityName = '';

    function init() {
        fetch('cities.geojson')
            .then(response => response.json())
            .then(data => {
                citiesGeoJSON = data;
                loadRandomImage();
                initGuessMap();
                document.getElementById('submit-guess').onclick = confirmGuess;
                document.getElementById('play-again').onclick = restartGame;
            })
            .catch(error => {
                console.error('Error loading GeoJSON:', error);
            });
    }

    function loadRandomImage() {
        if (!citiesGeoJSON) {
            console.error('GeoJSON data not loaded.');
            return;
        }

        const features = citiesGeoJSON.features;
        const randomIndex = Math.floor(Math.random() * features.length);
        const cityFeature = features[randomIndex];
        currentCityName = cityFeature.properties.NAME;
        const polygon = cityFeature.geometry;
        let randomPoint = null;
        let isInside = false;

        while (!isInside) {
            randomPoint = turf.randomPoint(1, { bbox: turf.bbox(polygon) }).features[0];
            isInside = turf.booleanPointInPolygon(randomPoint, polygon);
        }

        actualLocation = [randomPoint.geometry.coordinates[1], randomPoint.geometry.coordinates[0]];

        satelliteMap = L.map('satellite-map', {
            center: actualLocation,
            zoom: 16,
            zoomControl: false,
            attributionControl: true,
            dragging: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false,
            keyboard: false,
            tap: false,
            touchZoom: false,
        });

        satelliteMap.attributionControl.setPosition('bottomleft');

        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19,
            attribution: 'Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
        }).addTo(satelliteMap);
    }

    function initGuessMap() {
        guessMap = L.map('guess-map', {
            center: [0, 0],
            zoom: 2,
            worldCopyJump: true
        });

        L.tileLayer('http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
            attribution: '&copy; Esri, HERE, Garmin, (c) OpenStreetMap contributors, and the GIS user community',
        }).addTo(guessMap);

        let marker;

        guessMap.on('click', function(e) {
            if (marker) {
                guessMap.removeLayer(marker);
            }
            userGuess = [e.latlng.lat, e.latlng.lng];
            marker = L.marker(userGuess).addTo(guessMap);
            document.getElementById('submit-guess').disabled = false;
        });
    }

    function confirmGuess() {
        const distance = getDistanceFromLatLonInKm(
            actualLocation[0],
            actualLocation[1],
            userGuess[0],
            userGuess[1]
        );

        document.getElementById('distance').innerText =
            `You were ${distance.toFixed(2)} km away from ${currentCityName}.`;

        showResultMap();
    }

    function showResultMap() {
        document.getElementById('result-container').classList.remove('hidden');

        if (resultMap) {
            resultMap.remove();
        }

        resultMap = L.map('result-map');

        L.tileLayer('http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
            attribution: '&copy; Esri, HERE, Garmin, (c) OpenStreetMap contributors, and the GIS user community',
        }).addTo(resultMap);

        L.polyline([actualLocation, userGuess], { color: 'red' }).addTo(resultMap);
        
        const bounds = L.latLngBounds([actualLocation, userGuess]);
        resultMap.fitBounds(bounds, { padding: [50, 50] });
        
        L.marker(actualLocation).addTo(resultMap).bindPopup('Actual Location').openPopup();
        L.marker(userGuess).addTo(resultMap).bindPopup('Your Guess');
    }

    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        const deg2rad = deg => deg * (Math.PI / 180);

        const R = 6371;
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) *
                Math.cos(deg2rad(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    function restartGame() {
        actualLocation = null;
        userGuess = null;
        currentCityName = '';
        document.getElementById('result-container').classList.add('hidden');
        document.getElementById('submit-guess').disabled = true;

        guessMap.eachLayer(function(layer) {
            if (layer instanceof L.Marker) {
                guessMap.removeLayer(layer);
            }
        });

        satelliteMap.remove();
        document.getElementById('satellite-map').innerHTML = '';
        loadRandomImage();
    }

    return {
        init: init
    };
})();

window.onload = SatelliteGuessGame.init;
