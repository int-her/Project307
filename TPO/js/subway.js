function SUBWAY() {}
SUBWAY.prototype = new Object();

/**@brief
 * This supports Subway functions.
 * @type SUBWAY
 */
Window.prototype.subway = new SUBWAY();

SUBWAY.prototype.realtimeStationArrival = function(stationName) {
	var url = 'http://swopenAPI.seoul.go.kr/api/subway/sample/xml/realtimeStationArrival/0/5/' + stationName; 
	rest.get(url, null,	null,
			function(data, xhr) {
		var code = data.getElementsByTagName("code")[0].childNodes[0].nodeValue;
		if (code !== "INFO-000") {
			toastPopup.openPopup("Fail to load API. Error Code : " + code);
		} else if (code === "INFO-000") {
			var rt = document.getElementById('rtSubwayStation');
			rt.innerHTML = "";
			var list = data.getElementsByTagName("row");
			for (var i=0; i<list.length; ++i) {
				rt.innerHTML += "<li>" + list[i].getElementsByTagName("arvlMsg2")[0].childNodes[0].nodeValue + "</li>";
			}
			tau.changePage("#testAPI");
		}

	},
	function(data, xhr) {
		toastPopup.openPopup("API 로드에 실패했습니다.");
	});
}

function successCallback(position) {
	/**
	 *  서울시 좌표기반 근접 지하철역 정보(nearBy)
	 */
	var url = 'http://swopenapi.seoul.go.kr/api/subway/4we1Svife1ANzIwfRlMm4LIKHZI6BiBr2+8+TMz1QkiwBNUTmqJImecu2GHvh04mEAYTTgh60HoxSa+LdhW0+A==/xml/nearBy/0/9' + position.coords.longitude + position.coords.latitude; 
	rest.get(url, null, null, 
			function(data, xhr) {
		var code = data.getElementsByTagName("code")[0].childNodes[0].nodeValue;
		if (code !== "INFO-000") {
			toastPopup.openPopup("Fail to load API. Error Code : " + code, true);
		} else if (code === "INFO-000"){
			var lv = document.getElementById('lvSubwayStation');
			var x = data.getElementsByTagName("row");
			for (var i = 0; i < x.length; ++i) {
				if (i >= 20) {
					break;
				}
				lv.innerHTML += "<li class='li-has-multiline'><div class='ui-marquee ui-marquee-gradient' id=" + i + ">" + 
				x[i].getElementsByTagName("subwayNm")[0].childNodes[0].nodeValue + ' ' +
				x[i].getElementsByTagName("statnNm")[0].chileNodes[0].nodeValue +
				"</div><div class='ui-li-sub-text li-text-sub'>imageX : " + 
				x[i].getElementsByTagName("imageX")[0].childNodes[0].nodeValue + 
				"m</div></li>";
			}
			tau.changePage("#surroundingSubwayStation");						
		}
	},
	function(data, xhr) {
		toastPopup.openPopup("API를 불러오는데 실패하였습니다.", true);
	});
}

function errorCallback(error) {
	switch (error.code) {
	case error.PERMISSION_DENIED:
		toastPopup.openCheckPopup("GPS 권한을 허용해주세요.", true);
		break;
	case error.POSITION_UNAVAILABLE:
		toastPopup.openCheckPopup("연결된 디바이스의 GPS를 켜주세요.", true);
		break;
	case error.TIMEOUT:
		toastPopup.openPopup("GPS 요청 시간이 초과되었습니다.", true);
		break;
	case error.UNKNOWN_ERROR:
		toastPopup.openPopup("알 수없는 오류가 발생했습니다.", true);
		break;
	}
}

SUBWAY.prototype.findSurroundingStationsByGps = function() {
	if (navigator.geolocation) {
		tau.changePage("#processing");
		navigator.geolocation.getCurrentPosition(successCallback, errorCallback, {
			maximumAge : 10000, timeout : 20000
		});
	} else {
		toastPopup.openPopup("GPS를 지원하지 않는 기기입니다.");
	}
}
