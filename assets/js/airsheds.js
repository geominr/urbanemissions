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


map.addControl(
	new MapboxGeocoder({
	accessToken: mapboxgl.accessToken,
	mapboxgl: mapboxgl
}));
map.addControl(new mapboxgl.NavigationControl()); 

map.on('load', function() {

var format0 = d3.format(",.0f");
function counter(x, title, size) {
return "<div class=\"col-md-"+size+"\">\
			<center><div class=\"counter-number\">\
			   <h4 style=\"color:#18aa13; margin:0px; padding-top:5px\"><strong>"+x+"</strong></h4>\
			</div>\
		   <small style=\"position:inline-block\">"+title+"</small></center>\
		</div>";
}

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

	var pm = "<strong style='color:#ee982f'>" + String(e.features[i].properties["PM-Monitors"]) + "</strong> <small>Particulate matter</small>";
	var so2 = "<strong style='color:#ee982f'>" + String(e.features[i].properties["SO2-Monitors"])+ "</strong> <small>Sulfur dioxide</small>";
	var no2 = "<strong style='color:#ee982f'>" + String(e.features[i].properties["NO2-Monitors"])+ "</strong> <small>Nitrogen dioxide</small>";
	var co = "<strong style='color:#ee982f'>" + String(e.features[i].properties["CO & Others Monitors"])+ "</strong> <small>Carbon Monoxide</small>";

	popupdata = popupdata +"<p><h5 style='color:#00853e; padding-top:0px; margin-bottom:0px; display:inline-block'>"+airshed+", "+state+"</h5>";
	popupdata = popupdata +"&nbsp;&nbsp;&nbsp;<h6 style='color:#00853e; padding-top:0px; margin-bottom:0px; display:inline-block'>  - &nbsp;&nbsp;&nbsp; Minimum air monitors needed: " + pm + " " + so2 + " " + no2 + " " + co + "</h6></p>"

	popupdata = popupdata +`<div class='container' style='height:100%'>
					<div class='row'>` + totalpop + urbanpopshare + urbanareashare + avgpopdensity +  maxpopdensity +  airshedsize + `
					</div>
					</div>`;
	

	var url_path = "https://raw.githubusercontent.com/geominr/urbanemissions/main/geojson/" + e.features[0].properties["Google Earth KML file"];

	url_path = url_path.replace(".kml",".geojson")

	console.log(url_path);
	zoomToMap(url_path);


	var coordinates = e.features[0].geometry.coordinates.slice();


	// Ensure that if the map is zoomed out such that multiple
	// copies of the feature are visible, the popup appears
	// over the copy being pointed to.
	while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
		coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
	}

	//new mapboxgl.Popup({anchor:'right'}).setLngLat(coordinates).setHTML(popupdata).addTo(map);

	document.getElementById('features').innerHTML = popupdata;

});

// Change the cursor to a pointer when the mouse is over the places layer.
map.on('mouseenter', 'ncap-airsheds-info-2-4r7w53', function() {
	map.getCanvas().style.cursor = 'pointer';
});

// Change it back to a pointer when it leaves.
map.on('mouseleave', 'ncap-airsheds-info-2-4r7w53', function() {
	map.getCanvas().style.cursor = '';
});    

});