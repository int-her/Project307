/*global tau, toastPopup, rest */
function ROUTE() {
	this.destination = {
		name: "",
		x: 0.0,
		y: 0.0
	};
	this.route = [];
	this.activeRouteIndex = 0;
	this.currentPathIndex = 0;
	this.activeInfo = null;
}
ROUTE.prototype = new Object();

/**@brief
 * This supports Route functions.
 * @type ROUTE
 */

Window.prototype.route = new ROUTE();

ROUTE.prototype.failToUpdate = function(error) {
	var text;
	
	switch (error.code) {
	case error.PERMISSION_DENIED:
		text = "GPS 권한을 허용해주세요.";
		break;
	case error.POSITION_UNAVAILABLE:
		text = "연결된 디바이스의 GPS를 켜주세요.";
		break;
	case error.TIMEOUT:
		text = "GPS 요청 시간이 초과되었습니다.";
		break;
	case error.UNKNOWN_ERROR:
		text = "알 수없는 오류가 발생했습니다.";
		break;
	}
	document.getElementById('stepDistance').innerHTML = text;
	document.getElementById('stepTime').innerHTML = "";	
};

ROUTE.prototype.updateDistance = function(position) {	
	var distKm = getDistanceFromLatLonInKm(this.destination.y, this.destination.x, position.coords.latitude, position.coords.longitude),
		distM = parseInt(distKm * 1000);
	
	document.getElementById('stepDistance').innerHTML = distM + "m";
	document.getElementById('stepTime').innerHTML = "약 " + parseInt(distM / 50) + "분"; //분속 50m	
	
	if (distM < 10) {
		toastPopup.openCheckPopup("목적지 안내를 완료하였습니다.", true, 5);
	}
};

ROUTE.prototype.rideOnBus = function(index) {
	var id,
		endArsId,
		endInfo,
		path,
		sect,
		name,
		dest;

	path = this.route[index].paths[this.currentPathIndex];
	endArsId = bus.getStationIdByName(path.end_name, path.end_x, path.end_y);
	endInfo = bus.getBusInformation(endArsId, path.number)[0];
	id = bus.getVehicleId(this.activeInfo.routeId, this.activeInfo.sect);
	sect = bus.getCurrentSection(id);
	name = bus.getStationNameBySection(this.activeInfo.routeId, sect + 1);
	dest = bus.getStationNameBySection(this.activeInfo.routeId, endInfo.sect);
	
	document.getElementById('stationDistance').innerHTML = (endInfo.sect - (sect + 1)) + "정거장 전";
	document.getElementById('currentStation').innerHTML = name;
	document.getElementById('destinationStation').innerHTML = dest;
	
	return (endInfo.sect - (sect + 1));
};

ROUTE.prototype.startToNavigateBus = function(index) {
	var startArsId,
		endArsId,
		path = this.route[index].paths[this.currentPathIndex],
		temp;
	
	startArsId = bus.getStationIdByName(path.start_name, path.start_x, path.start_y);
	temp = bus.getBusInformation(startArsId, path.number);
	if (temp.length === 2) {
		var temp2;
		endArsId = bus.getStationIdByName(path.end_name, path.end_x, path.end_y);
		temp2 = bus.getBusInformation(endArsId, path.number);
		if (temp2.length === 2) {
			if (temp[0].time < temp[1].time) {
				this.activeInfo = temp[0];
			} else {
				this.activeInfo = temp[1];
			}
		} else {
			if (temp2[0].adirection === temp[0].adirection) {
				this.activeInfo = temp[0];
			} else if (temp2[0].adirection === temp[1].adirection) {
				this.activeInfo = temp[1];
			}
		}
	}
	else {
		this.activeInfo = temp[0];
	}
	if (this.activeInfo.time === -2) {
		toastPopup.openPopup("운행이 종료된 버스입니다.", true);
	} else {
		document.getElementById('routeBusStation').innerHTML = path.start_name + "(" + startArsId + ")";
		document.getElementById('routeBusNumber').innerHTML = path.number;
		if (this.activeInfo.time === -1) {
			document.getElementById('routeBusInformation').innerHTML = "차고지 대기";
		} else if (this.activeInfo.time < 60) {
			document.getElementById('routeBusInformation').innerHTML = "곧 도착";
		} else {
			document.getElementById('routeBusInformation').innerHTML = parseInt(this.activeInfo.time / 60) + "분 " + (this.activeInfo.time % 60) + "초";
		}
		tau.changePage("#navigateRouteByBus");
	}
};

ROUTE.prototype.navigateRoute = function(index) {
	var path = this.route[index].paths[this.currentPathIndex];
	
	this.activeRouteIndex = index;
	if (path.type === "BUS") {
		this.startToNavigateBus(index);
	}
}

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

/**
 * 목적지까지의 버스, 지하철을 이용한 경로를 찾는다.
 * @param position
 */
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
						path;
					path = [];
					for (var i = 0; i < items.length; ++i) {
						paths = items[i].getElementsByTagName("pathList");
						for (var j = 0; j < paths.length; ++j) {
							if (paths[j].getElementsByTagName("railLinkList").length === 0) {
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
							} else {
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
						}
						route.route[route.route.length] = {
								dist: items[i].getElementsByTagName("distance")[0].childNodes[0].nodeValue,
								time: parseInt(items[i].getElementsByTagName("time")[0].childNodes[0].nodeValue) + (paths.length - 1) * 5,
								paths: path.slice(0)
						};
					}
				}
			}, function(data, xhr) {
				toastPopup.openPopup("API를 불러오는데 실패하였습니다.", true);
			}, true);
};

/**
 * 목적지까지의 지하철만 이용한 경로를 찾는다.
 * @param position
 */
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
					path;

					path = [];
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
								time: parseInt(items[i].getElementsByTagName("time")[0].childNodes[0].nodeValue) + (paths.length - 1) * 5,
								paths: path.slice(0)
						};
					}
				}
				
			}, function(data, xhr) {
				toastPopup.openPopup("API를 불러오는데 실패하였습니다.", true);
			}, true);
};

/**
 * 목적지까지의 버스만을 이용한 경로를 찾는다.
 * @param position
 */
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
						path;
					
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
								time: parseInt(items[i].getElementsByTagName("time")[0].childNodes[0].nodeValue) + (paths.length - 1) * 5,
								paths: path.slice(0)
						};
					}
				}
				
			}, function(data, xhr) {
				toastPopup.openPopup("API를 불러오는데 실패하였습니다.", true);
			}, true);
};

/**
 * 현재 위치부터 목적지까지 대중교통을 이용하여 갈 수 있는 모든 경로를 찾아서 보여준다.
 */
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

/**
 * Daum api를 통하여 목적지의 WGS84 좌표를 불러오고 목적지를 설정한다.
 * @param event
 */
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

/**
 * 목적지를 불러와 보여준다. (현재는 더미 리스트)
 */
ROUTE.prototype.showDestination = function() {
	tau.changePage("#routeDestination");
};
