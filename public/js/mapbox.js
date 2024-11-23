const locations = JSON.parse(document.getElementById('map').dataset.locations)

// using maptiler to display map
const mapTilerKey = document.getElementById('map-key')
maptilersdk.config.apiKey = mapTilerKey.value
const map = new maptilersdk.Map({
	container: 'map', // container's id or the HTML element to render the map
	style: maptilersdk.MapStyle.STREETS.LIGHT,
	scrollZoom: false
});

const bounds = new maptilersdk.LngLatBounds()

locations.forEach(location => {

	// creating marker div
	const markerDiv = document.createElement('div');
	markerDiv.className = 'marker';

	// creating and plotting the marker
	new maptilersdk.Marker({
		element: markerDiv,
		anchor: 'bottom'
	}).setLngLat(location.coordinates).addTo(map)

	// creating popup
	new maptilersdk.Popup({
		offset: 30
	}).setLngLat(location.coordinates)
	.setHTML(`<p>Day ${location.day}: ${location.description}</p>`)
	.addTo(map)

	// adding bounds for better map visualisattion
	bounds.extend(location.coordinates)
});
// setting map bounds once map it loaded
map.on('load', function() {
	map.fitBounds(bounds, {
		padding: {
			top: 200,
			bottom: 200,
			left: 100,
			right: 100
		}
	});
})
