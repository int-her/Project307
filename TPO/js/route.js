/*global tau, toastPopup, rest */
function /**
 * @author ysm11
 *
 */
/**
 * @author ysm11
 *
 */
ROUTE() {
	this.destination = {
		name: "",
		x: 0.0,
		y: 0.0
	};
	this.route = [];
}
ROUTE.prototype = new Object();

/**@brief
 * This supports Route functions.
 * @type ROUTE
 */

Window.prototype.route = new ROUTE();

/**
 * 경로를 표현해주는 page section 을 만든다.
 */
ROUTE.prototype._createRouteSections = function () {
	var table = document.getElementById('sections'),
		html = "";
	
	table.innerHTML = "";
	for (var i = 0; i < this.route.length; ++i) {
		if (i === 0) {
			html += "<section class='ui-section-active' style='text-align:center'>";
		} else {
			html += "<section style='text-align:center'>";
		}
		html += this.route[i].paths[0].number;
		for (var j = 1; j < this.route[i].paths.length; ++j) {
			html += " -> " + this.route[i].paths[j].number;
		}
		html += " -> " + this.route[i].paths[j - 1].end_name;
		html += "[" + this.route[i].time + "분]";
		html += "</section>";
	}
	table.innerHTML = html;
};

ROUTE.prototype.getBusSubwayRoutes = function (position) {
	rest.get('http://ws.bus.go.kr/api/rest/pathinfo/getPathInfoByBusNSub',
			null,
			{
		"ServiceKey" : "DELETED",
		"startX" : position.coords.longitude,
		"startY" : position.coords.latitude,
		"endX" : route.destination.x,
		"endY" : route.destination.y,
		"numOfRows" : "999",
		"pageNo" : "1"
			}, 
			function(data, xhr) {
				var msg = data.getElementsByTagName("headerCd")[0].childNodes[0].nodeValue;				
				if (msg === "0"){
					var items = data.getElementsByTagName("itemList"),
					paths,
					path = [];

					for (var i = 0; i < items.length; ++i) {
						paths = items[i].getElementsByTagName("pathList");
						for (var j = 0; j < paths.length; ++j) {
							path[j] = {
									type: "BUS/SUBWAY",
									number: paths[j].getElementsByTagName("routeNm")[0].childNodes[0].nodeValue,
									start_name: paths[j].getElementsByTagName("fname")[0].childNodes[0].nodeValue,
									start_x: paths[j].getElementsByTagName("fx")[0].childNodes[0].nodeValue,
									start_y: paths[j].getElementsByTagName("fy")[0].childNodes[0].nodeValue,
									end_name: paths[j].getElementsByTagName("tname")[0].childNodes[0].nodeValue,
									end_x: paths[j].getElementsByTagName("tx")[0].childNodes[0].nodeValue,
									end_y: paths[j].getElementsByTagName("ty")[0].childNodes[0].nodeValue
							};
						}
						route.route[route.route.length] = {
								dist: items[i].getElementsByTagName("distance")[0].childNodes[0].nodeValue,
								time: items[i].getElementsByTagName("time")[0].childNodes[0].nodeValue,
								paths: path.slice(0)
						};
					}
				}
			}, function(data, xhr) {
				toastPopup.openPopup("API를 불러오는데 실패하였습니다.", true);
			}, true);
};

ROUTE.prototype.getSubwayRoutes = function (position) {
	rest.get('http://ws.bus.go.kr/api/rest/pathinfo/getPathInfoBySubway',
			null,
			{
		"ServiceKey" : "DELETED",
		"startX" : position.coords.longitude,
		"startY" : position.coords.latitude,
		"endX" : route.destination.x,
		"endY" : route.destination.y,
		"numOfRows" : "999",
		"pageNo" : "1"
			}, 
			function(data, xhr) {
				var msg = data.getElementsByTagName("headerCd")[0].childNodes[0].nodeValue;				
				if (msg === "0"){
					var items = data.getElementsByTagName("itemList"),
					paths,
					path = [];

					alert("subway :" + items.length);
					for (var i = 0; i < items.length; ++i) {
						paths = items[i].getElementsByTagName("pathList");
						for (var j = 0; j < paths.length; ++j) {
							path[j] = {
									type: "SUBWAY",
									number: paths[j].getElementsByTagName("routeNm")[0].childNodes[0].nodeValue,
									start_name: paths[j].getElementsByTagName("fname")[0].childNodes[0].nodeValue,
									start_x: paths[j].getElementsByTagName("fx")[0].childNodes[0].nodeValue,
									start_y: paths[j].getElementsByTagName("fy")[0].childNodes[0].nodeValue,
									end_name: paths[j].getElementsByTagName("tname")[0].childNodes[0].nodeValue,
									end_x: paths[j].getElementsByTagName("tx")[0].childNodes[0].nodeValue,
									end_y: paths[j].getElementsByTagName("ty")[0].childNodes[0].nodeValue
							};
						}
						route.route[route.route.length] = {
								dist: items[i].getElementsByTagName("distance")[0].childNodes[0].nodeValue,
								time: items[i].getElementsByTagName("time")[0].childNodes[0].nodeValue,
								paths: path.slice(0)
						};
					}
				}
				
			}, function(data, xhr) {
				toastPopup.openPopup("API를 불러오는데 실패하였습니다.", true);
			}, true);
};

ROUTE.prototype.getBusRoutes = function (position) {
	rest.get('http://ws.bus.go.kr/api/rest/pathinfo/getPathInfoByBus',
			null,
			{
		"ServiceKey" : "DELETED",
		"startX" : position.coords.longitude,
		"startY" : position.coords.latitude,
		"endX" : route.destination.x,
		"endY" : route.destination.y,
		"numOfRows" : "999",
		"pageNo" : "1"
			}, 
			function(data, xhr) {
				var msg = data.getElementsByTagName("headerCd")[0].childNodes[0].nodeValue;
				if (msg === "0"){
					var items = data.getElementsByTagName("itemList"),
						paths,
						path = [];
					
					for (var i = 0; i < items.length; ++i) {
						paths = items[i].getElementsByTagName("pathList");	
						for (var j = 0; j < paths.length; ++j) {
							path[j] = {
									type: "BUS",
									number: paths[j].getElementsByTagName("routeNm")[0].childNodes[0].nodeValue,
									start_name: paths[j].getElementsByTagName("fname")[0].childNodes[0].nodeValue,
									start_x: paths[j].getElementsByTagName("fx")[0].childNodes[0].nodeValue,
									start_y: paths[j].getElementsByTagName("fy")[0].childNodes[0].nodeValue,
									end_name: paths[j].getElementsByTagName("tname")[0].childNodes[0].nodeValue,
									end_x: paths[j].getElementsByTagName("tx")[0].childNodes[0].nodeValue,
									end_y: paths[j].getElementsByTagName("ty")[0].childNodes[0].nodeValue
							};
						}
						route.route[route.route.length] = {
								dist: items[i].getElementsByTagName("distance")[0].childNodes[0].nodeValue,
								time: items[i].getElementsByTagName("time")[0].childNodes[0].nodeValue,
								paths: path.slice(0)
						};
					}
				}
				
			}, function(data, xhr) {
				toastPopup.openPopup("API를 불러오는데 실패하였습니다.", true);
			}, true);
};

ROUTE.prototype.findway = function () {
	if (this.destination.name === "") {
		toastPopup.openCheckPopup("목적지를 설정해주세요!", false);
		return;
	}
	
	this.route = [];
	loadGPS(function(position) {
		route.getBusRoutes(position);
		route.getSubwayRoutes(position);
		route.getBusSubwayRoutes(position);
		route.route.sort(function(a, b) {
			if (a.time === b.time) {
				return a.paths.length - b.paths.length;
			} else {
				return a.time - b.time;
			}
		});
		route._createRouteSections();
		tau.changePage('#showRoutes');
	});
};

ROUTE.prototype.setDestination = function(event) {
	var target = event.target;
	tau.changePage("#processing");
	rest.get('https://apis.daum.net/local/v1/search/keyword.xml',
			null,
			{
		"apikey" : "c1fa0046de47bc0458d252de7fdbf86d",
		"query" : target.id
			}, 
			function(data, xhr) {
				var parser = new DOMParser();
				data = parser.parseFromString(data, "text/xml");
				var count = data.getElementsByTagName("totalCount")[0].childNodes[0].nodeValue;
				if (count === "0") {
					// No result
					toastPopup.openCheckPopup("장소를 검색하지 못하였습니다.", true);
				} else {
					/*var cn = data.getElementsByTagName("itemList");
					var i;
					for(i=0; i<cn.length; i++) {
						if(cn[i].getElementsByTagName("distance")[0].childNodes[0].nodeValue < shortestDistance) {
							shortestDistance = cn[i].getElementsByTagName("distance")[0].childNodes[0].nodeValue;
							shortestPath = cn[i].cloneNode(true);
							getShortestPathSubway();
						}
					}*/
					var item = data.getElementsByTagName("item");
					route.destination.name = target.id;
					route.destination.x = parseFloat(item[0].getElementsByTagName("longitude")[0].childNodes[0].nodeValue);
					route.destination.y = parseFloat(item[0].getElementsByTagName('latitude')[0].childNodes[0].nodeValue);
					window.history.go(-2);
				}
			}, function(data, xhr) {
				toastPopup.openPopup("API를 불러오는데 실패하였습니다.", true);
			});
}

ROUTE.prototype.showDestination = function() {
	tau.changePage("#routeDestination");
};
