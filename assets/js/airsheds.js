mapboxgl.accessToken = 'pk.eyJ1IjoicmFhbmFuLWciLCJhIjoiY2pyMWF5YzM4MDBseTQzcXEyZ3gxN2xvOSJ9.Jm_gHZ3zcJh2xygKeOdr5w';

var map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/raanan-g/ckl9ntogg145x17pt2xem0m2y',
	center: [79.915048, 21.362872],
	zoom: 4.3
});
console.log(map)

function zoomToMap(url) {

	var layers = map.getStyle().layers;
	// Find the index of the first symbol layer in the map style
	var firstSymbolId;
	for (var i = 0; i < layers.length; i++) {
		if (layers[i].type === 'symbol') {
			firstSymbolId = layers[i].id;
			break;
		}
	}	

	json = d3.json(url).then(function(data){ 

		//console.log(data) 

		if (gridShowing == true) {
			var airshedLayer = map.getLayer('airshed_layer');
			if (typeof airshedLayer !== 'undefined'){
				map.removeLayer('airshed_layer');
			}
			if (typeof map.getSource('airshed_source') !== 'undefined') {
				map.removeSource('airshed_source');	
			}
		}

		var bbox = turf.extent(data);

		map.fitBounds(bbox);

		map.addSource("airshed_source", {
			type: "geojson",
			data: data,
		});

		map.addLayer({
			"id": "airshed_layer",
			"type":"line",
			"source":"airshed_source",
			"paint": {
				"line-color":"#fcba03",
				"line-width":0.5,
				"line-opacity":0.25
				}
			},
			firstSymbolId
		);

	});
	gridShowing = true;
}
var format0 = d3.format(",.0f");
function counter(x, title, size) {
return "<div class=\"col-md-"+size+"\">\
			<center><div class=\"counter-number\">\
			   <h1 style=\"color:#18aa13; margin:0px; padding-top:5px\"><strong>"+x+"</strong></h1>\
			</div>\
		   <small style=\"position:inline-block\">"+title+"</small></center>\
		</div>";
}
map.addControl(
	new MapboxGeocoder({
	accessToken: mapboxgl.accessToken,
	mapboxgl: mapboxgl
}));
map.addControl(new mapboxgl.NavigationControl()); 

map.on('load', function() {
map.on('click', 'ncap-airsheds-info-2-4r7w53', function(e) {

	//console.log(e.features)
	var popupdata = "";
	var i = 0;

	var airshed = e.features[i].properties["Airshed"];
	var state = e.features[i].properties["State"];

	var airshedsize = counter(e.features[i].properties["Airshed size"], "Airshed Size", 2);
	var totalpop = counter(String(e.features[i].properties["Total population"]) + " M", "Total population", 2);
	var urbanpopshare = counter(e.features[i].properties["Urban pop%"], "Urban population", 2);
	var urbanareashare = counter(e.features[i].properties["Urban area%"], "Urban area", 2);
	var maxpopdensity = counter(format0(e.features[i].properties["max.pop.density"]), 
								"Max. pop. density (persons/km<sup>2</sup>)", 2);
	var avgpopdensity = counter(format0(e.features[i].properties["urb.pop.density"]), 
								"Avg. urban pop. density (persons/km<sup>2</sup>)", 2);

	popupdata = popupdata +"<p><h5 style='color:#00853e; padding-top:0px; margin-bottom:0px; display:inline-block'>"+airshed+", "+state+"</h5>";
	popupdata = popupdata +`<div class='container' style='height:100%'>
					<div class='row'>` + totalpop + urbanpopshare + urbanareashare + avgpopdensity +  maxpopdensity +  airshedsize + `
					</div>
					</div>`;
	

	var url_path = "https://raw.githubusercontent.com/geominr/urbanemissions/main/geojson/" + e.features[0].properties["Google Earth KML file"];

	url_path = url_path.replace(".kml",".geojson")

	console.log(url_path);
	zoomToMap(url_path);


	var coordinates = e.features[0].geometry.coordinates.slice();

	var pm = counter(String(e.features[0].properties["PM-Monitors"]), 
								"Particulate Matter", 6);
	var so2 = counter(String(e.features[0].properties["SO2-Monitors"]), 
								"Sulfur Dioxide", 6);
	var no2 = counter(String(e.features[0].properties["NO2-Monitors"]), 
								"Nitrogen Dioxide", 6);
	var co = counter(String(e.features[0].properties["CO & Others Monitors"]), 
								"Carbon Monoxide", 6);

	popup_data = `<div class='row'>` + pm + so2 + no2 + co + `
					</div><center><h6>Recommended Monitoring Stations</h6></center>`;
	
	   
	// Ensure that if the map is zoomed out such that multiple
	// copies of the feature are visible, the popup appears
	// over the copy being pointed to.
	while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
	coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
	}

	// Populate the popup and set its coordinates
	// based on the feature found.
	popup.setLngLat(coordinates).setHTML(popup_data).addTo(map);
	document.getElementById('features').innerHTML = popupdata;

});
// Create a popup, but don't add it to the map yet.
var popup = new mapboxgl.Popup({
	offset: 10,
	closeButton: true,
	closeOnClick: false
});
// Change the cursor to a pointer when the mouse is over the places layer.
// Change the cursor to a pointer when the mouse is over the places layer.
map.on('mouseenter', 'ncap-airsheds-info-2-4r7w53', function(e) {
	map.getCanvas().style.cursor = 'pointer';
	
	
});

// Change it back to a pointer when it leaves.
map.on('mouseleave', 'ncap-airsheds-info-2-4r7w53', function() {
	map.getCanvas().style.cursor = '';
});    

});