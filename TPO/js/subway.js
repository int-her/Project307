var subwayStation = (function(){
	subwayStation = {};
	
	function realtimeStationArrival(stationName) {
		rest.get('http://swopenAPI.seoul.go.kr/api/subway/sample/xml/realtimeStationArrival/0/5/' + stationName,
				null,
				null,
				function(data, xhr) {
					var code = data.getElementsByTagName("code")[0].childNodes[0].nodeValue;
					if (code != "INFO-000") {
						toastPopup.openPopup("toastPopup", "Fail to load API. Error Code : " + code);
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
					toastPopup.openPopup("toastPopup", "API 로드에 실패했습니다.");
				}
		)
	}
	
	function successCallback(position) {
		/**
		 *  서울시 좌표기반 근접 지하철역 정보(nearBy)
		 */
		rest.get('http://swopenapi.seoul.go.kr/api/subway/DELETED/xml/nearBy/0/9' + position.coords.longitude + position.coords.latitude,
				null,
				null, 
				function(data, xhr) {
					var code = data.getElementsByTagName("code")[0].childNodes[0].nodeValue;
					if (code != "INFO-000") {
						toastPopup.openPopup("toastPopup", "Fail to load API. Error Code : " + code);
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
				}, function(data, xhr) {
					toastPopup.openPopup("toastPopup", "API를 불러오는데 실패하였습니다.");
				});
	}
	
	function errorCallback(error) {
		switch (error.code) {
		case error.PERMISSION_DENIED:
			toastPopup.openPopup("toastPopup", "GPS 권한이 거부되었습니다.");
			break;
		case error.POSITION_UNAVAILABLE:
			toastPopup.openPopup("toastPopup", "연결된 디바이스의 GPS를 켜주세요.");
			break;
		case error.TIMEOUT:
			toastPopup.openPopup("toastPopup", "GPS 요청 시간이 초과되었습니다.");
			break;
		case error.UNKNOWN_ERROR:
			toastPopup.openPopup("toastPopup", "알 수없는 오류가 발생했습니다.");
			break;
		}
	}

	function findSurroundingStationsByGps() {
		if (navigator.geolocation) {
			toastPopup.openPopup("toastPopup", "GPS로 주변 정류소를 조회하는 중입니다. 잠시만 기다려주세요.");
			navigator.geolocation.getCurrentPosition(successCallback, errorCallback, {
				timeout : 60000
			});
		} else {
			toastPopup.openPopup("toastPopup", "GPS를 지원하지 않는 기기입니다.");
		}
	}
	
	subwayStation.realtimeStationArrival = realtimeStationArrival;
	subwayStation.findSurroundingStationsByGps = findSurroundingStationsByGps;
	
	return subwayStation;
}());
