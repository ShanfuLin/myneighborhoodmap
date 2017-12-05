/**
Code is separated into 3 main components, in accordance with the
Model-View-ViewModel. The locations are stored in the Model components
of the code and the code in the ViewModel mediates between the view (index.html)
and the data in the Model.
*/

var funLocations = [
  {name: "Changi Airport", coordinates: {lat: 1.3644, lng: 103.9915}},
  {name: "Chinese Garden", coordinates: {lat: 1.3390, lng: 103.7298}},
  {name: "East Coast Park", coordinates: {lat: 1.3008, lng: 103.9122}},
  {name: "Jurong Bird Park", coordinates: {lat: 1.3187, lng: 103.7064}},
  {name: "MacRitchie Reservoir", coordinates: {lat: 1.3448, lng: 103.8224}},
  {name: "Marina Bay Sands", coordinates: {lat: 1.2839, lng: 103.8609}},
  {name: "Punggol Park", coordinates: {lat: 1.3770, lng: 103.8985}},
  {name: "Sentosa Island", coordinates: {lat: 1.2494, lng: 103.8303}},
  {name: "Sungei Buloh Wetland Reserve", coordinates: {lat: 1.4467, lng: 103.7301}}
];

var map;
var markers = [];
var testlocations = [];

var ViewModel = function(){

  var self = this;

  filterBoxValue = ko.observable("");
  markers = ko.observableArray(markers);

  // This function calls the function to update the markers in accordance to
  // what the user had typed in the search box
  this.update = function () {
    updateMarkers();
  };

  // Event handler to handle the response after a request is sent to Google API
  this.initMap = function() {
      // Constructor creates a new map - only center and zoom are required.
      map = new google.maps.Map(document.getElementById('map'),{
        center: {lat: 1.3521, lng: 103.8198},
        zoom:12
      });
      var largeInfowindow = new google.maps.InfoWindow();
      displayAllMarkers();
    };

    // This function ensures that the correct markers are displayed only to the
    // user after a search criteria is entered.
    function updateMarkers(){
      var defaultIcon = makeMarkerIcon('0091ff');
      var highlightedIcon = makeMarkerIcon('FFFF24');
      var largeInfowindow = new google.maps.InfoWindow();
      hideMarkers(markers);
      var value = filterBoxValue().toLowerCase();
      markers().splice(0, markers().length);
      console.log(markers());
      for (var i = 0; i < funLocations.length; i++) {
        if (funLocations[i].name.toLowerCase().search(value) !== parseInt("-1")) {
          var position = funLocations[i].coordinates;
          var title = funLocations[i].name;
          var marker = new google.maps.Marker({
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i,
            icon: defaultIcon
          });
          markers.push(marker);
           // This creates the infowindow which information pertaining to the said
           // location were displayed.
          marker.addListener('click', function(){
            populateInfoWindow(this, largeInfowindow);
          });
          // This creates the event listener whereby when the icon is clicked,
          // the icon will turn to yellow.
          marker.addListener('click', function() {
            this.setIcon(highlightedIcon);
          });
          // This creates the event listener whereby when the mouse moves out of
          // the icon, it will turn back to its original colour.
          marker.addListener('mouseout', function() {
            this.setIcon(defaultIcon);
          });
          showListings();
        };
      };
    };

    // This function displays all the markers of the model locations.
    function displayAllMarkers(){
      var defaultIcon = makeMarkerIcon('0091ff');
      var highlightedIcon = makeMarkerIcon('FFFF24');
      var largeInfowindow = new google.maps.InfoWindow();
      for (var i = 0; i < funLocations.length; i ++ ){
        var position = funLocations[i].coordinates;
        var title = funLocations[i].name;
        var marker = new google.maps.Marker({
          position: position,
          title: title,
          animation: google.maps.Animation.DROP,
          id: i,
          icon: defaultIcon
        });
        markers.push(marker);
         // This creates the infowindow which information pertaining to the said
         // location were displayed.
        marker.addListener('click', function(){
          populateInfoWindow(this, largeInfowindow);
        });
        marker.addListener('click', function() {
          this.setIcon(highlightedIcon);
        });
        marker.addListener('mouseout', function() {
          this.setIcon(defaultIcon);
        });
      };
      showListings();
    };

    function showListings() {
      var bounds = new google.maps.LatLngBounds();
      console.log(markers());
      console.log("running");
       // Extend the boundaries of the map for each marker and display the marker
      for (var i = 0; i < markers().length; i++) {
        markers()[i].setMap(map);
        bounds.extend(markers()[i].position);
      };
      markersIndicator = true;
      map.fitBounds(bounds);
      var zoom = map.getZoom();
      map.setZoom(12);
    };
    //This function allows all markers to be removed before the updated ones
    // are
    function hideMarkers(markers) {
      for (var i = 0; i < markers().length; i++) {
        markers()[i].setMap(null);
        markersIndicator = false;
      };
    };

    function makeMarkerIcon(markerColor) {
      var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21,34));
      return markerImage;
    };

    function populateInfoWindow(marker, infowindow) {
      // Check to make sure the infowindow is not already opened on this marker.
      if (infowindow.marker != marker) {
        // Clear the infowindow content to give the streetview time to load.
        infowindow.setContent('');
        infowindow.marker = marker;
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function() {
          infowindow.marker = null;
        });
        var streetViewService = new google.maps.StreetViewService();
        var radius = 30;
        // In case the status is OK, which means the pano was found, compute the
        // position of the streetview image, then calculate the heading, then get a
        // panorama from that and set the options
        function getStreetView(data, status) {
          if (status == google.maps.StreetViewStatus.OK) {
            var nearStreetViewLocation = data.location.latLng;
            var heading = google.maps.geometry.spherical.computeHeading(
              nearStreetViewLocation, marker.position);
              infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
              var panoramaOptions = {
                position: nearStreetViewLocation,
                pov: {
                  heading: heading,
                  pitch: 30
                }
              }
            var panorama = new google.maps.StreetViewPanorama(
              document.getElementById('pano'), panoramaOptions);
          } else {
            infowindow.setContent('<div>' + marker.title + '</div>' +
              '<div>No Street View Found</div>');
          };
        };
        // Use streetview service to get the closest streetview image within
        // 50 meters of the markers position
        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        // Open the infowindow on the correct marker.
        infowindow.open(map, marker);
      };
    };
};

// In the event that the code fails to execute properly, a pop out window
// will be displayed and the user will be notified.
window.onerror = function (msg, url, lineNo, columnNo, error) {
    var string = msg.toLowerCase();
    var substring = "script error";
    if (string.indexOf(substring) > -1){
        alert('Script Error: See Browser Console for Detail');
    } else {
        var message = [
            'Message: ' + msg,
            'URL: ' + url,
            'Line: ' + lineNo,
            'Column: ' + columnNo,
            'Error object: ' + JSON.stringify(error)
        ].join(' - ');

        alert(message);
    };

    return false;
};

var viewModel = new ViewModel();
ko.applyBindings(viewModel);
