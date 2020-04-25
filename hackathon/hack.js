var raw_data = {};


var map;
var markers=[];
var circles = {year2006: [],
              year2011: [],
              year2016: [],
              year2021: []};

var currentData;
var slider = 50;
var low_color = 107;
var high_color = 1;
var low_threshold = 0;
var high_threshold = 1;
var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';

function get_color(value){
  //return low_color + (high_color - low_color) * value / (high_threshold - low_threshold);
  return Math.min(Math.max(low_color + (high_color - low_color) * value / (high_threshold - low_threshold), high_color), low_color)
}
function get_year(){
  var year = $('#yearSelector option:selected').val();
  switch(year){
    case "2006":
      currentData = circles.year2006;
      break;
    case "2011":
      currentData = circles.year2011;
      break;
    case "2016":
      currentData = circles.year2016;
      break;
    case "2021":
      currentData = circles.year2021;
      break;
  }
  return year;
}

function get_year_data(year){
  let data;
  switch(year){
    case "2006":
      data = raw_data.year_06;
      break;
    case "2011":
      data = raw_data.year_11;
      break;
    case "2016":
      data = raw_data.year_16;
      break;
    case "2021":
      data = raw_data.year_21;
      break;
  }
  return data;
}

function get_color_string(value){
  return "hsl(" + get_color(value)+ ", 99%, 50%)";
}
  

function createCircle(postCode){
  // Create a cricle object for this postCode.
    
  return new google.maps.Circle({
    strokeColor: get_color_string((postCode.population_utility + postCode.inequality_utility)/2),
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: get_color_string((postCode.population_utility + postCode.inequality_utility)/2),
    fillOpacity: 0.35,
    map: null,
    center: {lat: postCode.lat, lng: postCode.long},
    radius: Math.sqrt(postCode.population) * 100
  });
}
function setAllMap(circleObjects, map){
  circleObjects.forEach(function(circleObject){
    circleObject.setMap(map)
  });
}

function updateAllColor(circleObjects, sliderValue, year){
  let data = get_year_data(year);
  for (i = 0; i < circleObjects.length; i++){
    var color = get_color_string((sliderValue*data[i].inequality_utility + (100-sliderValue)*data[i].population_utility)/100);
    circleObjects[i].setOptions({
      fillColor: color,
      strokeColor: color,
      radius: Math.sqrt(data[i].population) * 100
    });
  }
  

}

function initMap() {
  // Create the map.
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 4,
    center: {lat: -25, lng: 133},
    mapTypeId: 'terrain'
  });
  $.ajax({url: "/top10_population.json", success: function(data){
    var list = document.getElementById("top-population");
    data.data.forEach(function(item){
        var innerElement = document.createElement("button");
        innerElement.classList = "list-group-item list-group-item-action";
        innerElement.setAttribute('type', "button");
        innerElement.setAttribute('data-lat', String(item.lat));
        innerElement.setAttribute('data-long', String(item.long));
        innerElement.innerHTML = "<strong>" + item.suburb + ", "+ item.state + '</strong>';
        list.appendChild(innerElement);
    });
    $("#top-10 .list-group-item-action").click(function(event){
      map.setCenter(new google.maps.LatLng($(event.currentTarget).data('lat'), $(event.currentTarget).data('long')));
    });
  }});

    $.ajax({url: "/top10_inequality.json", success: function(data){
      var list = document.getElementById("top-inequality");
      data.data.forEach(function(item){
          var innerElement = document.createElement("button");
          innerElement.classList = "list-group-item list-group-item-action";
          innerElement.setAttribute('data-lat', String(item.lat));
          innerElement.setAttribute('type', "button");
          innerElement.setAttribute('data-long', String(item.long));
          innerElement.innerHTML = "<strong>" + item.suburb + ", "+ item.state + '</strong>';
          list.appendChild(innerElement);
      });
      $("#top-10 .list-group-item-action").click(function(event){
        map.setCenter(new google.maps.LatLng($(event.currentTarget).data('lat'), $(event.currentTarget).data('long')));
        map.setZoom(10);
      });

  }});
  $.ajax({url: "/data.json",
  success: function(dataObject){
    raw_data = dataObject;
    dataObject.year_16.forEach(function(postCode){
    // Add the circle for this city to the map.
    var circle = createCircle(postCode);
    circle.setMap(map);
    circles.year2016.push(circle);
    });
    currentData = circles.year2016;
    dataObject.year_06.forEach(function(postCode){
      // Add the circle for this city to the map.
      var circle = createCircle(postCode);
      //circle.setMap(map);
      circles.year2006.push(circle);
    });
    dataObject.year_11.forEach(function(postCode){
      // Add the circle for this city to the map.
      var circle = createCircle(postCode);
      //circle.setMap(map);
      circles.year2011.push(circle);
    });
    dataObject.year_21.forEach(function(postCode){
      // Add the circle for this city to the map.
      var circle = createCircle(postCode);
      //circle.setMap(map);
      circles.year2021.push(circle);
    });
    dataObject.help_centers.forEach(function(helpCenter){
      new google.maps.Marker({
        position: {
          lat:helpCenter.lat,
          lng: helpCenter.long
        },
        map: map
        }
      );
    });
  }
});


  
}

$("#map-control-form").submit(function(event){
  event.preventDefault();
  setAllMap(currentData, null);
  slider = $("#slider").val()
  let year = get_year();
  updateAllColor(currentData, slider, year);
  setAllMap(currentData, map);
});

