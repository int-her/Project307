var busStation = (function() {
	busStation = {};

	function successCallback(position) {
		/**
		 *  좌표 기반 근접 정류소 목록 조회(getStationByPos)
		 *  [Request Parameter]
		 *  tmX - 기준 위치 X(WGS84)
		 *  tmY - 기준 위치 Y(WGS84)
		 *  radius - 검색 반경 (0~1500m)
		 *  
		 *  [Response Element]
		 *  stationId - 정류소 ID
		 *  stationNm - 정류소명
		 *  gpsX - 정류소 좌표X (WGS84)
		 *  gpsY - 정류소 좌표Y (WGS84)
		 *  arsId - 정류소 고유 번호
		 *  dist - 거리
		 *  posX - 정류소 좌표X (GRS80)
		 *  posY - 정류소 좌표Y (GRS80)
		 *  stationTp - 정류소 타입 (0:공용, 1:일반형 시내/농어촌버스, 2:좌석형 시내/농어촌버스, 3:직행좌석형 시내/농어촌버스, 4:일반형 시외버스, 5:좌석형 시외버스, 6:고속형 시외버스, 7:마을버스)
		 */
		rest.get('http://ws.bus.go.kr/api/rest/stationinfo/getStationByPos',
				null,
				{
					"ServiceKey" : "DELETED",
					"tmX" : position.coords.latitude,
					"tmY" : position.coords.longitude,
					"radius" : "1000",
					"numOfRows" : "999",
					"pageNo" : "1"
				}, 
				function(data, xhr) {
					var lv = document.getElementById('lvBusStation');
				}, function(data, xhr) {
				});
	}

	function errorCallback(error) {
		switch (error.code) {
		case error.PERMISSION_DENIED:
			toastPopup.openPopup("toastPopup", "연결된 디바이스의 GPS를 켜주세요.");
			break;
		case error.POSITION_UNAVAILABLE:
			toastPopup.openPopup("toastPopup", "사용 불가능한 위치 정보입니다.");
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
			navigator.geolocation.getCurrentPosition(successCallback, errorCallback, {
				maximumAge : 60000
			});
		} else {
			toastPopup.openPopup("toastPopup", "GPS를 지원하지 않는 기기입니다.");
		}
	}
	busStation.findSurroundingStationsByGps = findSurroundingStationsByGps;
	
	return busStation;
}());
