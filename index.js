const token = 'trfmCuhUcSX1kaOTEpkunPo0z'

$('#locationForm').submit(function () {
    meteoriteLister();
    return false;
});

function meteoriteLister() {
    console.log("meteoriteLister is starting")        
    const userLocation = locationReturner();
    const nearbyMeteorites = getMeteorites(userLocation);
    console.log("meteoriteLister is done")            
}

function locationReturner() {
    // returns the inputted coordinates as an object w/ long and lat
    console.log("locationReturner is starting")    
    longitude = document.getElementById("longitude").value;
    latitude = document.getElementById("latitude").value;
    return {
        "longitude": longitude,
        "latitude": latitude
    };
    console.log("locationReturner is done")        
}

function getMeteorites(userLocation) {
    // gets all meteorites from the api
    console.log("getMeteorites is starting")
    $.ajax({
        url: "https://data.nasa.gov/resource/y77d-th95.json",
        type: "GET",
        data: {
          "$limit" : 35000, // figure out how to search by location rather than returning every single meteorite
          // "$limit" : 5000,
          "$$app_token" : `${token}`,
        }
    }).done(function(data) {
        return meteoriteFinder(data, userLocation);
        console.log("getMeteorites is done");
    });
}

function meteoriteFinder(data, userLocation) {
    // iterates through the return of getMeteorites() and list any that are within 100 miles
    console.log("meteoriteFinder is starting")
    const nearbyMeteorites = data.filter(function(meteorite) {
        // refactor this
        let meteoriteLongitude;
        let meteoriteLatitude;
        if (meteorite.geolocation !== undefined) { // prevents meteorites w/o geolocation from breaking filter
            meteoriteLongitude = meteorite.geolocation.coordinates[0];
            meteoriteLatitude = meteorite.geolocation.coordinates[1];
        } else {
            meteoriteLongitude = 0; // should find a better solution than setting long and lat to 0; maybe use reclong?
            meteoriteLatitude = 0; // should find a better solution than setting long and lat to 0; maybe use reclat?
        }
        var userLongitude = Number(userLocation.longitude); // don't use var here!
        var userLatitude = Number(userLocation.latitude); // don't use var here!
        return distanceCalculator(meteoriteLatitude, meteoriteLongitude, userLatitude, userLongitude) <= 100;
    })
    meteoriteDisplayer(nearbyMeteorites);
    console.log("meteoriteFinder is done");    
}

function distanceCalculator(lat1, lon1, lat2, lon2) {
    console.log("distanceCalculator is starting")
    var p = 0.017453292519943295; // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p)/2 + c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))/2;
    return 7917.509282 * Math.asin(Math.sqrt(a)); // returns distance in miles
    console.log("distanceCalculator is done")    
}

function meteoriteDisplayer(nearbyMeteorites) {
    console.log("meteoriteDisplayer is starting");
    const listDiv = document.getElementById("nearbyMeteoritesList");    
    // need to clear listDiv before appending new meteorites
    nearbyMeteorites.forEach(function(meteorite) {
        const newMeteorite = document.createElement('div');
        newMeteorite.innerHTML += `\n<b>${meteorite.name}</b>`;
        newMeteorite.innerHTML += `\n<li>Mass: ${meteorite.mass}</li>`;
        newMeteorite.innerHTML += `\n<li>Location: ${meteorite.reclong}, ${meteorite.reclat}</li>`;
        listDiv.appendChild(newMeteorite);
    })
    console.log("meteoriteDisplayer is done");
}