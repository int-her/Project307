function SUBWAY() {}
SUBWAY.prototype = new Object();

/**@brief
 * This supports Subway functions.
 * @type SUBWAY
 */
Window.prototype.subway = new SUBWAY();

/**
 * API 에서 받아온 data를 파싱하여 도착 예상 시간을 보여주는 리스트를 만든다.
 * @param {String} API 에서 받아온 XML String
 */
function createSubwayArrivalTimeList(data) {
	var lv = document.getElementById('lvSubwayArrivalTime');
	lv.innerHTML = "";
	var x = data.getElementsByTagName("row");
	for (var i = 0; i < x.length; ++i) {
		if (i >= 20) {
			break;
		}
		lv.innerHTML += "<li class='li-has-multiline' id=" + x[i].getElementsByTagName("btrainNo")[0].childNodes[0].nodeValue + 
		"><div>" + x[i].getElementsByTagName("trainLineNm")[0].childNodes[0].nodeValue +
		"</div>";
		
		var barvlDt = x[i].getElementsByTagName("barvlDt")[0].childNodes[0].nodeValue;
		if (barvlDt === 0) {
			lv.innerHTML += "<div class='ui-li-sub-text li-text-sub'>잠시 후 도착</div></li>";
		} else if (barvlDt < 60) {
			lv.innerHTML += "<div class='ui-li-sub-text li-text-sub'>" + barvlDt + "초  후 도착</div></li>";
		} else if (barvlDt % 60 === 0){
			lv.innerHTML += "<div class='ui-li-sub-text li-text-sub'>" + barvlDt/60 + "분  후 도착</div></li>";
		} else {
			lv.innerHTML += "<div class='ui-li-sub-text li-text-sub'>" + Math.floor(barvlDt/60) + "분 " + barvlDt%60 + "초 후 도착</div></li>";
		}
	}
}

/**
 * stationName 에 해당하는 정류장에 대한 버스 도착 예상시간을 보여준다.
 * @param {number} stationName 지하철역명
 */
SUBWAY.prototype.realtimeStationArrival = function(stationName) {
	tau.changePage("#processing");
	/**
	 *  서울시 지하철 실시간 도착정보(realtimeStationArrival)
	 *  1	subwayId	지하철호선ID
		2	updnLine	상하행선구분
			(2호선 : (내선,외선),상행,하행)
		3	trainLineNm	도착지방면
			(성수행 - 구로디지털단지방면)
		4	subwayHeading	내리는문방향
			(오른쪽,왼쪽)
		5	statnFid	이전지하철역ID
		6	statnTid	다음지하철역ID
		7	statnId	지하철역ID
		8	statnNm	지하철역명
		9	trnsitCo	환승노선수
		10	ordkey	도착예정열차순번
		11	subwayList	연계호선ID
			(1002, 1007 등 연계대상 호상ID)
		12	statnList	연계지하철역ID
			(1002000233,1007000744)
		13	btrainSttus	열차종류
			(급행,ITX)
		14	barvlDt	열차도착예정시간
			(단위:초)
		15	btrainNo	열차번호
			(현재운행하고 있는 호선별 열차번호)
		16	bstatnId	종착지하철역ID
		17	bstatnNm	종착지하철역명
		18	recptnDt	열차도착정보를 생성한 시각
		19	arvlMsg2	첫번째도착메세지
			(전역 진입, 전역 도착 등)
		20	arvlMsg3	두번째도착메세지
			(종합운동장 도착, 12분 후 (광명사거리) 등)
		21	arvlCd	도착코드
			(0:진입, 1:도착, 2:출발, 3:전역출발, 4:전역진입, 5:전역도착, 99:운행중)
	 */	
	var url = 'http://swopenAPI.seoul.go.kr/api/subway/6d7a6d524676616c383573726b7043/xml/realtimeStationArrival/0/5/' + stationName; 
	rest.get(url, null,	null,
		function(data, xhr) {
			var code = data.getElementsByTagName("code")[0].childNodes[0].nodeValue;
			if (code !== "INFO-000") {
				// Fail
				toastPopup.openPopup("Fail to load API. Error Code : " + code);
			} else if (code === "INFO-000") {
				// Success
				createSubwayArrivalTimeList(data);
				tau.changePage("#subwayArrivalTime");
			}
		},
		function(data, xhr) {
			toastPopup.openPopup("API 로드에 실패했습니다.");
		});
}

/**
 * API 에서 받아온 data를 파싱하여 주변 지하철 역을 보여주는 리스트를 만든다.
 * @param {String} API 에서 받아온 XML String
 */
function createSurroundingSubwayList(data) {
	var lv = document.getElementById('lvSurroundingSubwayStation');
	lv.innerHTML = "";
	var x = data.getElementsByTagName("row");
	for (var i = 0; i < x.length; ++i) {
		if (i >= 20) {
			break;
		}
		lv.innerHTML += "<li class='li-has-multiline'><div class='ui-marquee ui-marquee-gradient' id=" + i + ">" + 
		x[i].getElementsByTagName("subwayNm")[0].childNodes[0].nodeValue + ' ' +
		x[i].getElementsByTagName("statnNm")[0].childNodes[0].nodeValue +
		"</div><div class='ui-li-sub-text li-text-sub'>imageX : " + 
		x[i].getElementsByTagName("imageX")[0].childNodes[0].nodeValue + 
		"m</div></li>";
	}
}

/**
 * GPS 받아오기에 성공했을 시 1km 반경 내의 주변 지하철 역을 API를 통하여 읽어오고 리스트를 만든다.
 */
function successCallback(position) {
	/**
	 *  서울시 좌표기반 근접 지하철역 정보(nearBy)
	 *  1	statnId	지하철역ID
		2	statnNm	지하철역명
		3	subwayId	지하철호선ID
		4	subwayNm	지하철호선명
		5	ord	근접순위
		6	subwayXcnts	지하철X좌표
		7	subwayYcnts	지하철Y좌표
		8	imageX	이미지상X좌표
		9	imageY	이미지상Y좌표
	 */
	var url = 'http://swopenapi.seoul.go.kr/api/subway/4we1Svife1ANzIwfRlMm4LIKHZI6BiBr2+8+TMz1QkiwBNUTmqJImecu2GHvh04mEAYTTgh60HoxSa+LdhW0+A==/xml/nearBy/0/5/' + position.coords.longitude + '/' + position.coords.latitude; 
	rest.get(url, null, null,
		function(data, xhr) {
			var code = data.getElementsByTagName("code")[0].childNodes[0].nodeValue;
			if (code !== "INFO-000") {
				// Fail
				toastPopup.openPopup("Fail to load API. Error Code : " + code, true);
			} else if (code === "INFO-000"){
				// Success
				createSurroundingSubwayList(data);
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

/**
 * GPS를 이용하여 1km 반경 내의 주변 지하철 역을 조회한다.
 */
SUBWAY.prototype.showSurroundingStationsByGps = function() {
	if (navigator.geolocation) {
		tau.changePage("#processing");
		navigator.geolocation.getCurrentPosition(successCallback, errorCallback, {
			timeout : 20000
		});
	} else {
		toastPopup.openPopup("GPS를 지원하지 않는 기기입니다.");
	}
}
