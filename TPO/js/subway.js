function SUBWAY() {}
SUBWAY.prototype = new Object();

/**@brief
 * This supports Subway functions.
 * @type SUBWAY
 */
Window.prototype.subway = new SUBWAY();

/**
 * initialize
 */
var subwayStatus;
var startStation = "설정";
var startStation_x = 0;
var startStation_y = 0;
var finishStation = "설정";
var finishStation_x = 0;
var finishStation_y = 0;

document.getElementById('stationInfo_id').addEventListener('click', function() {
	subwayStatus = 0;
});
document.getElementById('settingStart').addEventListener('click', function() {
	subwayStatus = 1;
});
document.getElementById('settingStart_sub').addEventListener('click', function() {
	subwayStatus = 1;
});
document.getElementById('settingFinish').addEventListener('click', function() {
	subwayStatus = 2;
});
document.getElementById('settingFinish_sub').addEventListener('click', function() {
	subwayStatus = 2;
});

SUBWAY.prototype.getPathInfoBySubway = function() {
	/** Process
	 *  1) station's name -> station's id
	 *  2) station's id -> station's wgs84 point
	 *  3) station's wgs84 point -> path info
	 */
	
	/**
	 * 	지하철이용 경로 조회 (getPathInfoBySubwayList)
	 */
	rest.get('http://ws.bus.go.kr/api/rest/pathinfo/getPathInfoBySubway',
			null,
			{
		"ServiceKey" : "4we1Svife1ANzIwfRlMm4LIKHZI6BiBr2+8+TMz1QkiwBNUTmqJImecu2GHvh04mEAYTTgh60HoxSa+LdhW0+A==",
		"startX" : startStation_y,
		"startY" : startStation_x,
		"endX" : finishStation_y,
		"endY" : finishStation_x,
		"numOfRows" : "999",
		"pageSize" : "999",
		"pageNo" : "1",
		"startPage" : "1"
			}, 
			function(data, xhr) {
				var headerCd = data.getElementsByTagName("headerCd")[0].childNodes[0].nodeValue;				
				if (headerCd === "4") {
					// No result
					toastPopup.openCheckPopup(startStation_x + ',' + startStation_y, true);
				} else if (headerCd === "0"){
					// Success
					var hd = document.getElementById('subwayRouteResult_header');
					hd.innerHTML = "<h2 class='ui-title'>" + startStation + '-' + finishStation + '</h2>';
					var ct = document.getElementById('subwayRouteResult_content');
					ct.innerHTML = "<div>distance : ";
					ct.innerHTML += data.getElementsByTagName("distance")[0].childNodes[0].nodeValue;
					ct.innerHTML += ', time : ' + data.getElementsByTagName("time")[0].childNodes[0].nodeValue;
					ct.innerHTML += "</div>";
					tau.changePage("#subwayRouteResult");				
				}
			}, function(data, xhr) {
				toastPopup.openPopup("API를 불러오는데 실패하였습니다.", true);
			});
};

function remakeSearchSubwayRoutePage() {
	var startSub = document.getElementById('settingStart_sub');
	startSub.innerHTML = "<a href='#stationInfo'>" + startStation + "</a>";
	var finishSub = document.getElementById('settingFinish_sub');
	finishSub.innerHTML = "<a href='#stationInfo'>" + finishStation + "</a>";
	tau.changePage("#searchSubwayRoute");
}

function setStationGPS(stationCd) {
	/**
	 * 	서울시 역코드로 지하철역 위치 조회 (SearchLocationOfSTNByIDService)
	 * 	1	STATION_CD	전철역코드
		2	STATION_NM	전철역명
		3	LINE_NUM	호선
		4	FR_CODE	외부코드
			(외부코드는 지하철에 역 이름과 함께 적혀있는 역번호로, 외국인의 경우 역명보다 역번호로 문의를 하는 경우가 많음)
		5	CYBER_ST_CODE	사이버스테이션
			(환승역의 경우 여러 노선 중 마스터가 되는 노선의 전철역코드)
		6	XPOINT	X좌표
		7	YPOINT	Y좌표
		8	XPOINT_WGS	X좌표(WGS)
		9	YPOINT_WGS	Y좌표(WGS)
	 */
	var url = 'http://openapi.seoul.go.kr:8088/6d7a6d524676616c383573726b7043/xml/SearchLocationOfSTNByIDService/0/5/' + stationCd; 
	rest.get(url, null, null,
		function(data, xhr) {
			var code = data.getElementsByTagName("CODE")[0].childNodes[0].nodeValue;
			if (code !== "INFO-000") {
				// Fail
				toastPopup.openPopup("Fail to load API. Error Code : " + code, true);
			} else if (code === "INFO-000"){
				// Success
				var wgs_x = data.getElementsByTagName("XPOINT_WGS")[0].childNodes[0].nodeValue;
				var wgs_y = data.getElementsByTagName("YPOINT_WGS")[0].childNodes[0].nodeValue;
				if (subwayStatus === 1) {
					startStation_x = wgs_x;
					startStation_y = wgs_y;
				} else if (subwayStatus === 2) {
					finishStation_x = wgs_x;
					finishStation_y = wgs_y;			
				}
			}
		},
		function(data, xhr) {
			toastPopup.openPopup("API를 불러오는데 실패하였습니다.", true);
		}); 
}

function setStationInfo(stationNm) {
	if (subwayStatus === 1) {
		startStation = stationNm;
	} else if (subwayStatus === 2) {
		finishStation = stationNm;
	}
	
	/**
	 * 	서울시 지하철역 정보 검색(역명) (SearchInfoBySubwayNameService)
	 * 	1	STATION_CD	전철역코드
		2	STATION_NM	전철역명
		3	LINE_NUM	호선
		4	FR_CODE	외부코드
			(외부코드는 지하철에 역 이름과 함께 적혀있는 역번호로, 외국인의 경우 역명보다 역번호로 문의를 하는 경우가 많음)
	 */
	var url = 'http://openapi.seoul.go.kr:8088/6d7a6d524676616c383573726b7043/xml/SearchInfoBySubwayNameService/0/5/' + stationNm; 
	rest.get(url, null, null,
		function(data, xhr) {
			var code = data.getElementsByTagName("CODE")[0].childNodes[0].nodeValue;
			if (code !== "INFO-000") {
				// Fail
				toastPopup.openPopup("Fail to load API. Error Code : " + code, true);
			} else if (code === "INFO-000"){
				// Success
				var station_cd = data.getElementsByTagName("STATION_CD")[0].childNodes[0].nodeValue;
				setStationGPS(station_cd);
			}
		},
		function(data, xhr) {
			toastPopup.openPopup("API를 불러오는데 실패하였습니다.", true);
		}); 
}

/**
 *  지하철 역 리스트에서 클릭 시 realtimeStationArrival 함수를 불러와 그 지하철 역의 실시간 도착 정보를 보여준다.
 */
function clickList(event)
{
	var target = event.target;
	if (target.classList.contains('li-subway-station')) {
		if (subwayStatus === 0) {
			subway.realtimeStationArrival(target.id);
		} else if (subwayStatus === 1 || subwayStatus === 2) {
			setStationInfo(target.id);
			remakeSearchSubwayRoutePage();
		}
	}
}

/**
 * li-subway-station 클래스를 가진 list item 에 대해 클릭 이벤트를 추가한다.
 */
function addListEvent() {
	var stationList = document.getElementsByClassName("li-subway-station");
	for (var i = 0; i < stationList.length; ++i) {
		stationList[i].addEventListener("click", clickList);
	}
}

/**
 * API 에서 받아온 data를 파싱하여 도착 예상 시간을 보여주는 리스트를 만든다.
 * @param {String} API 에서 받아온 XML String
 */
function createAllSubwayStationList(data) {
	var lv = document.getElementById('lvAllSubwayStation_content');
	lv.innerHTML = "";
	var x = data.getElementsByTagName("row");
	for (var i = 0; i < x.length; ++i) {
		lv.innerHTML += "<li class='li-subway-station' id=" + x[i].getElementsByTagName("statnNm")[0].childNodes[0].nodeValue + 
		"><div class='li-subway-station' id=" + x[i].getElementsByTagName("statnNm")[0].childNodes[0].nodeValue + ">" +
		x[i].getElementsByTagName("statnNm")[0].childNodes[0].nodeValue +
		"</div></li>";
	}
	addListEvent();
}

/**
 * subwayNm 에 해당하는 호선의 경유 지하철 역을 보여준다.
 * @param {string} subwayNm 지하철호선명
 */
SUBWAY.prototype.lvAllSubwayStation = function(subwayNm) {
	tau.changePage("#processing");
	/**
	 * 	지하철 호선별 역사 경유정보(stationByLine)
	 * 	1	subwayId	지하철호선ID
		2	subwayNm	지하철호선명
		3	statnId	지하철역ID
		4	statnNm	지하철역명
		5	statnSn	지하철역순번
			(역사 순번)
	 */
	var url = 'http://swopenapi.seoul.go.kr/api/subway/4we1Svife1ANzIwfRlMm4LIKHZI6BiBr2+8+TMz1QkiwBNUTmqJImecu2GHvh04mEAYTTgh60HoxSa+LdhW0+A==/xml/stationByLine/0/200/' + subwayNm; 
	rest.get(url, null, null,
		function(data, xhr) {
			var code = data.getElementsByTagName("code")[0].childNodes[0].nodeValue;
			if (code !== "INFO-000") {
				// Fail
				toastPopup.openPopup("Fail to load API. Error Code : " + code, true);
			} else if (code === "INFO-000"){
				// Success
				createAllSubwayStationList(data);
				tau.changePage("#lvAllSubwayStation");
			}
		},
		function(data, xhr) {
			toastPopup.openPopup("API를 불러오는데 실패하였습니다.", true);
		});
};

/**
 * API 에서 받아온 data를 파싱하여 도착 예상 시간을 보여주는 리스트를 만든다.
 * @param {String} API 에서 받아온 XML String
 */
function createSubwayArrivalTimeList(data) {
	var lv = document.getElementById('subwayArrivalTime_content');
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
 * @param {number} stationNm 지하철역명
 */
SUBWAY.prototype.realtimeStationArrival = function(stationNm) {
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
	var url = 'http://swopenAPI.seoul.go.kr/api/subway/6d7a6d524676616c383573726b7043/xml/realtimeStationArrival/0/5/' + stationNm;
	rest.get(url, null,	null,
		function(data, xhr) {
			var code = data.getElementsByTagName("code")[0].childNodes[0].nodeValue;
			if (code !== "INFO-000") {
				// Fail
				toastPopup.openPopup("Fail to load API. Error Code : " + code);
			} else if (code === "INFO-000") {
				// Success
				createSubwayArrivalTimeList(data);
				document.getElementById('subwayArrivalTime_header').innerHTML = stationNm;
				tau.changePage("#subwayArrivalTime");
			}
		},
		function(data, xhr) {
			toastPopup.openPopup("API 로드에 실패했습니다.");
		});
};

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
		lv.innerHTML += "<li id=" + x[i].getElementsByTagName("statnNm")[0].childNodes[0].nodeValue + " class='li-has-multiline li-subway-station'>" +
		"<div id=" + x[i].getElementsByTagName("statnNm")[0].childNodes[0].nodeValue + " class='ui-marquee ui-marquee-gradient'>" + 
		x[i].getElementsByTagName("subwayNm")[0].childNodes[0].nodeValue + ' ' + x[i].getElementsByTagName("statnNm")[0].childNodes[0].nodeValue +
		"</div><div id=" + x[i].getElementsByTagName("statnNm")[0].childNodes[0].nodeValue + " class='ui-li-sub-text li-text-sub'>ord : " + 
		x[i].getElementsByTagName("ord")[0].childNodes[0].nodeValue + 
		"</div></li>";
	}
	addListEvent();
}

/**
 * GPS 받아오기에 성공했을 시 1km 반경 내의 주변 지하철 역을 API를 통하여 읽어오고 리스트를 만든다.
 */
function searchSurroundingSubwayStation(x, y) {
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
	var url = 'http://swopenapi.seoul.go.kr/api/subway/4we1Svife1ANzIwfRlMm4LIKHZI6BiBr2+8+TMz1QkiwBNUTmqJImecu2GHvh04mEAYTTgh60HoxSa+LdhW0+A==/xml/nearBy/0/5/' + x + '/' + y;
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

function successCallback(position) {
	/**
	 * 좌표계 변환(transCoord)
	 * https://developers.daum.net/services/apis/local/geo/transcoord
	 */
	var url = 'https://apis.daum.net/local/geo/transcoord?apikey=2693dc6c6564996cc45fcb78b3bb70d4&fromCoord=WGS84&y=' + position.coords.latitude + '&x=' + position.coords.longitude + '&toCoord=WTM&output=xml';
//	var url = 'https://apis.daum.net/local/geo/transcoord?apikey=2693dc6c6564996cc45fcb78b3bb70d4&fromCoord=WGS84&y=126.57740680000002&x=33.453357700000005&toCoord=WTM&output=xml';
	rest.get(url, null, null,
		function(data, xhr) {
			var splitData = data.split("\'");
			searchSurroundingSubwayStation(splitData[1], splitData[3]);
		},
		function(data, xhr) {
			toastPopup.openPopup("좌표계 변환 에러");
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
};
