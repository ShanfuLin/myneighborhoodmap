
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
  {name: "Sentosa", coordinates: {lat: 1.2494, lng: 103.8303}},
  {name: "Sungei Buloh Wetland Reserve", coordinates: {lat: 1.4467, lng: 103.7301}}
];

var map;
var markers = [];
var testlocations = [];
var elem;
var switchindicator = false;
var infoWindowClone;
var xprevious = "";
var markerclicker = "";
var z = "";

var ViewModel = function(){

  var self = this;

  filterBoxValue = ko.observable("");
  markers = ko.observableArray(markers);
  // This function calls the function to update the markers in accordance to
  // what the user had typed in the search box
  this.update = function () {
    updateMarkers();
  };

  // This function calls the function to highlight the markers in accordance to
  // what the user had selected in the list
  this.highlightonmap = function (marker) {
    if (z != ""){
      z.close();
    }
    var defaultIcon = makeMarkerIcon('0091ff');
    var highlightedIcon = makeMarkerIcon('FFFF24');
    var largeInfowindow = new google.maps.InfoWindow();
      //if marker length = funlocation length
    if (infoWindowClone !== undefined) {
      if (infoWindowClone["marker"]["id"] !== marker["id"]){
        var number = xprevious;
        infoWindowClone.close();
        // problem is id number not equal to position in markers()
        if (idPositionChecker() !== -1 | undefined){
          markers()[idPositionChecker()].setIcon(defaultIcon);
        }
        infoWindowClone = largeInfowindow;
        marker.setIcon(highlightedIcon);
        populateInfoWindow(marker, infoWindowClone);
        switchindicator = true;
        xprevious = marker["id"];
      } else {
        if (switchindicator === true) {
          infoWindowClone.close();
          marker.setIcon(defaultIcon);
          switchindicator = false;
          xprevious = marker["id"];
        } else {
          infoWindowClone = largeInfowindow;
          marker.setIcon(highlightedIcon);
          populateInfoWindow(marker, infoWindowClone);
          switchindicator = true;
          xprevious = marker["id"];
        }
      };
    } if (infoWindowClone == undefined) {
        infoWindowClone = largeInfowindow;
        marker.setIcon(highlightedIcon);
        populateInfoWindow(marker, infoWindowClone);
        switchindicator = true;
        xprevious = marker["id"];
    } else {
      if (switchindicator === false) {
        infoWindowClone = largeInfowindow;
        marker.setIcon(highlightedIcon);
        populateInfoWindow(marker, infoWindowClone);
        switchindicator = true;
        xprevious = marker["id"];
      }
    }
  };

  // This function ensures that the marker (and infowindow) is always closed
  // automatically when the mouse moves out of the target in list
  this.mouseOutList = function(marker) {
    if (infoWindowClone != undefined) {
      var defaultIcon = makeMarkerIcon('0091ff');
      var highlightedIcon = makeMarkerIcon('FFFF24');
      infoWindowClone.close();
      marker.setIcon(defaultIcon);
    }
  }

  // Event handler to handle the response after a request is sent to Google API
  this.initMap = function() {
    map = new google.maps.Map(document.getElementById('map'),{
      center: {lat: 1.3521, lng: 103.8198},
      zoom:11
    });
    var largeInfowindow = new google.maps.InfoWindow();
    displayAllMarkers();
  };

    // This function ensures that the correct markers are displayed only to the
    // user after a search criteria is entered.
    function updateMarkers(){
      try {
        switchindicatorcontainer = [];
        var defaultIcon = makeMarkerIcon('0091ff');
        var highlightedIcon = makeMarkerIcon('FFFF24');
        var largeInfowindow = new google.maps.InfoWindow();
        hideMarkers(markers);
        var value = filterBoxValue().toLowerCase();
        markers().splice(0, markers().length);
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
              if (xprevious != ""){
                if (idPositionChecker() != -1){
                  markers()[idPositionChecker()].setIcon(defaultIcon);
                }
              }
              if (infoWindowClone != undefined) {
                infoWindowClone.close();
                infoWindowClone = undefined;
                switchindicator = false;
                populateInfoWindow(this, largeInfowindow);
                z = largeInfowindow;
              } else {
                populateInfoWindow(this, largeInfowindow);
                z = largeInfowindow;
              }
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
          };
        };
        showListings();
        switchindicator = false;
      } catch(err) {
        window.alert("An error has occured. Please inform the owner of this website.");
      };
    };

    // This function links the locations in the filter list to the markers on map.


    // This function displays all the markers of the model locations.
    function displayAllMarkers(){
      try {
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
            if (idPositionChecker() != -1){
              markers()[idPositionChecker()].setIcon(defaultIcon);
            }
            if (infoWindowClone != undefined) {
              infoWindowClone.close();
              infoWindowClone = undefined;
              switchindicator = false;
              populateInfoWindow(this, largeInfowindow);
              z = largeInfowindow;
            } else {
              populateInfoWindow(this, largeInfowindow);
              z = largeInfowindow;
            }
          });
          marker.addListener('click', function() {
            this.setIcon(highlightedIcon);
          });
          // This creates the event listener whereby when the mouse moves out of
          // the icon, it will turn back to its original colour.
          marker.addListener('mouseout', function() {
            this.setIcon(defaultIcon);
          });
        };
        showListings();
        switchindicator = false;
      } catch(err) {
        window.alert("An error has occured. Please inform the owner of this website.");
      };
    };

    // This function display all the markers (based on search criteria) on the map
    function showListings() {
      var bounds = new google.maps.LatLngBounds();
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

    //This function allows all markers to be removed from map
    function hideMarkers(markers) {
      for (var i = 0; i < markers().length; i++) {
        markers()[i].setMap(null);
        markersIndicator = false;
      };
    };

    //This function allows all markers to be removed from map
    function makeMarkerIcon(markerColor) {
      try {
        var markerImage = new google.maps.MarkerImage(
          'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
          '|40|_|%E2%80%A2',
          new google.maps.Size(21, 34),
          new google.maps.Point(0, 0),
          new google.maps.Point(10, 34),
          new google.maps.Size(21,34));
        return markerImage;
      } catch(err) {
        window.alert("An error has occured. Please inform the owner of this website.");
      }
    };

    function idPositionChecker(){
      for (var i = 0; i < markers().length; i++) {
        var x = markers()[i]["id"];
        if (xprevious === x) {
          var y = i;
          break;
        } else {
          y = -1;
        }
      } return y;
    }

    // This function populates the infowindow with the wikipedia link for
    // each location.
    function populateInfoWindow(marker, infowindow) {
    //  try {
        var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';
        $.ajax({
            url: wikiUrl,
            dataType: "jsonp",
            jsonp: "callback",
            success: function( response ) {
                var articleList = response[3];
                console.log(response[2]);
                if (infowindow.marker != marker) {
                  // Clear the infowindow content to give the streetview time to load.
                  infowindow.setContent('');
                  infowindow.marker = marker;
                  // Make sure the marker property is cleared if the infowindow is closed.
                  infowindow.addListener('closeclick', function() {
                    infowindow.marker = null;
                  });
                  infowindow.setContent('<div>' + marker.title + '</div><br><div><a href='+ articleList[0] + '>' + 'Click here to find out more' + '</a>' + '<br><br><span>' + response[2][0] + response[2][1] + '</span>' + '</div>');
                  infowindow.open(map, marker);
                };
            },
            error: function (jqXHR, error) {
                    var msg = '';
                    if (jqXHR.status === 0) {
                        msg = 'Not connect.\n Verify Network.';
                    } else if (jqXHR.status == 404) {
                        msg = 'Requested page not found. [404]';
                    } else if (jqXHR.status == 500) {
                        msg = 'Internal Server Error [500].';
                    } else if (exception === 'parsererror') {
                        msg = 'Requested JSON parse failed.';
                    } else if (exception === 'timeout') {
                        msg = 'Time out error.';
                    } else if (exception === 'abort') {
                        msg = 'Ajax request aborted.';
                    } else {
                        msg = 'Uncaught Error.\n' + jqXHR.responseText;
                    }
                    window.alert(msg);
                },
        });
    //  } catch(err) {
      //  window.alert("An error has occured. Please inform the owner of this website.");
    //  }
    };

    mapError = () => {
      window.alert("Google MAP API Loading Error!");
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
