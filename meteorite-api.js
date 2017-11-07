const token = 'trfmCuhUcSX1kaOTEpkunPo0z'

// ADD LOADING BAR

// on location form submit, triggers meteoriteLister() and prevents page from reloading
$('#locationForm').submit(function () {
    meteoriteLister();
    return false;
});

// stores user location and gets all nearby meteorites
function meteoriteLister() {
    console.log("meteoriteLister is starting");     
    const userLocation = locationReturner();
    const nearbyMeteorites = getMeteorites(userLocation);
    console.log("meteoriteLister is done")            
}

// returns the inputted coordinates as an object w/ long and lat
function locationReturner() {
    // NEED TO NORMALIZE COORDINATES (e, w, +, -)
    console.log("locationReturner is starting")    
    longitude = document.getElementById("longitude").value;
    latitude = document.getElementById("latitude").value;
    return {
        "longitude": longitude,
        "latitude": latitude
    };
    console.log("locationReturner is done")        
}

// gets all meteorites from the api
function getMeteorites(userLocation) {
    console.log("getMeteorites is starting")
    $.ajax({
        url: "https://data.nasa.gov/resource/y77d-th95.json",
        type: "GET",
        data: {
          "$limit" : 35000,
          "$$app_token" : `${token}`,
        }
    }).done(function(data) {
        console.log("getMeteorites is done");        
        return meteoriteFinder(data, userLocation);
    });
}

// iterates through the return of getMeteorites() and passes any that are within 100 miles to meteoriteDisplayer()
function meteoriteFinder(data, userLocation) {
    console.log("meteoriteFinder is starting")
    // REFACTOR THIS
    const nearbyMeteorites = data.filter(function(meteorite) {
        let meteoriteLongitude;
        let meteoriteLatitude;
        // prevents meteorites w/o geolocation from breaking filter
        if (meteorite.geolocation !== undefined) {
            meteoriteLongitude = meteorite.geolocation.coordinates[0];
            meteoriteLatitude = meteorite.geolocation.coordinates[1];
        } else {
            // center of atlantic ocean (so no meteorites within 100 miles)
            meteoriteLongitude = 42;
            meteoriteLatitude = 32;
        }
        var userLongitude = Number(userLocation.longitude); // DON'T USE VAR HERE
        var userLatitude = Number(userLocation.latitude); // DON'T USE VAR HERE
        return distanceCalculator(meteoriteLatitude, meteoriteLongitude, userLatitude, userLongitude) <= 100;
    })
    console.log("meteoriteFinder is done");
    meteoriteDisplayer(nearbyMeteorites);    
}

// calculates the distance between two sets of coordinates
function distanceCalculator(lat1, lon1, lat2, lon2) {
    console.log("distanceCalculator is starting")
    var p = 0.017453292519943295; // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p)/2 + c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))/2;
    return 7917.509282 * Math.asin(Math.sqrt(a)); // returns distance in miles
    console.log("distanceCalculator is done")    
}

// displays all nearby meteorites on the page
function meteoriteDisplayer(nearbyMeteorites) {
    console.log("meteoriteDisplayer is starting");
    const listDiv = document.getElementById("nearbyMeteoritesList");    
    // need to clear listDiv before appending new meteorites
    divCreator(listDiv, nearbyMeteorites);
    console.log("meteoriteDisplayer is done");
}

function divCreator(listDiv, nearbyMeteorites) {
    nearbyMeteorites.forEach(function(meteorite) {
        const newMeteorite = document.createElement('div');
        newMeteorite.innerHTML += `\n<b>${meteorite.name}</b>`;
        newMeteorite.innerHTML += `\n<li>Mass: ${meteorite.mass}</li>`;
        newMeteorite.innerHTML += `\n<li>Location: ${meteorite.reclong}, ${meteorite.reclat}</li>`;
        listDiv.appendChild(newMeteorite);
    })
}