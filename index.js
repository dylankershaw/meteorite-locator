// FORM CAN'T TAKE DECIMAL COORDINATES
// SHOW MY LOCATION SHOULD AUTO-POPULATE FORM
// METEORITES SHOULD POPULATE AS MAP MARKERS
// SET A MAX WIDTH FOR LOADING BAR

const token = 'config.nasaAPIToken' // PUT IN SECRETS.YML AND .GITIGNORE IT

// on location form submit, triggers meteoriteLister() and prevents page from reloading
$('#locationForm').submit(function () {
    divEraser();
    move();
    meteoriteLister();
    return false;
});

// progress bar animation
function move() {
    var elem = document.getElementById("bar"); 
    var width = 1;
    var id = setInterval(frame, 10);
    function frame() {
        if (width >= 100) {
            clearInterval(id);
        } else {
            width++; 
            elem.style.width = width + '%'; 
        }
    }
}

// gets and displays user's location
function geoFindMe() {
    var output = document.getElementById("out");
  
    if (!navigator.geolocation){
      output.innerHTML = "<p>Geolocation is not supported by your browser</p>";
      return;
    }
  
    function success(position) {
      var latitude  = position.coords.latitude;
      var longitude = position.coords.longitude;
  
      output.innerHTML = '<p>Latitude is ' + latitude.toPrecision(5) + '&deg <br>Longitude is ' + longitude.toPrecision(5) + '&deg</p>';
  
      var img = new Image();
      img.src = "https://maps.googleapis.com/maps/api/staticmap?center=" + latitude + "," + longitude + "&zoom=13&size=300x300&sensor=false";
  
      output.appendChild(img);
    }
  
    function error() {
      output.innerHTML = "Unable to retrieve your location";
    }
  
    output.innerHTML = "<p>Locating…</p>";
  
    navigator.geolocation.getCurrentPosition(success, error);
  }

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
    var p = 0.017453292519943295; // Math.PI / 180 // DON'T USE VAR HERE
    var c = Math.cos; // DON'T USE VAR HERE
    var a = 0.5 - c((lat2 - lat1) * p)/2 + c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))/2; // DON'T USE VAR HERE
    return 7917.509282 * Math.asin(Math.sqrt(a)); // returns distance in miles
    console.log("distanceCalculator is done")    
}

// displays all nearby meteorites on the page
function meteoriteDisplayer(nearbyMeteorites) {
    console.log("meteoriteDisplayer is starting");
    const listDiv = document.getElementById("nearbyMeteoritesList");    
    divCreator(listDiv, nearbyMeteorites);
    console.log("meteoriteDisplayer is done");
}

function divEraser() {
    const listDiv = document.getElementById("nearbyMeteoritesList");
    listDiv.innerHTML = "";
}

function divCreator(listDiv, nearbyMeteorites) {
    console.log(listDiv.innerHTML);
    nearbyMeteorites.forEach(function(meteorite) {
        const newMeteorite = document.createElement('div');
        newMeteorite.innerHTML += `\n<b>${meteorite.name}</b>`;
        newMeteorite.innerHTML += `\n<li>Mass: ${meteorite.mass}</li>`;
        newMeteorite.innerHTML += `\n<li>Year: ${meteorite.year.slice(0, 4)}</li>`;
        newMeteorite.innerHTML += `\n<li>Location: ${meteorite.reclat}, ${meteorite.reclong}</li>`; // use google map reverse geocoder
        listDiv.appendChild(newMeteorite);
    })
}