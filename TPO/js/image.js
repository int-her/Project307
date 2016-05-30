/**
var zoom = (function(){
	zoom = {};

	var tmp;
	var map = document.getElementById('viewMap');
	var size = parseInt(map.style.zoom);

	var rotaryEventHandler = function(e) {
		if (e.detail.direction === 'CW') {
			tmp = size + 10 + '%';
			map.style.zoom = tmp;
		} else if (e.detail.direction === 'CCW') {
			if(size !== '0%') {
				tmp = size - 10 + '%';
				map.style.zoom = tmp;
			}
		}
	};
	zoom.rotaryEventHandler = rotaryEventHandler;
	
	return zoom;
}());
*/
