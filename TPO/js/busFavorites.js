/*global tau, toastPopup, rest */
function BUSFAVORITES() {
	this.activeStationId = 1;
	this.activeStationName = "";
	this.registerBusId = [];
	this.registerBusAdirection = [];
}
BUSFAVORITES.prototype = new Object();

/**@brief
 * This supports bus favorites functions for creating, modifying, deleting.
 * @type BUS
 */
Window.prototype.busFavorites = new BUSFAVORITES();


BUSFAVORITES.prototype.deleteFavorites = function(stationId) {
	var tpoDir, 
	tpoFile;

	tizen.filesystem.resolve("documents", function(result) {
		tpoDir = result.resolve("TPO_files");
		tpoFile = tpoDir.resolve("TPO_favorite.tpo");
		tpoFile.readAsText(function(txt) {
			var stations = txt.split("\n"),
				station,
				text = "\n",
				count = 0;

			
			for (var i = 1; i < stations.length; ++i) {
				station = stations[i].split(" ");
				for (var j = 0; j < stationId.length; ++j) {
					if (stationId[j] === station[0]) {
						break;
					}
				}
				// stationIds do not include this station id
				if (j === stationId.length) {
					text += stations[i];
					count++;
				}
			}
			
			if (count == 0) {
				tpoDir.deleteFile(tpoFile.fullPath, function() {
					toastPopup.openCheckPopup("삭제 완료!", true);
				});
			} else {
				tpoDir.deleteFile(tpoFile.fullPath, function() {
					tpoFile = tpoDir.createFile("TPO_favorite.tpo");
					tpoFile.openStream("w", function(fs) {
		        		fs.write(text);
		        		fs.close();
		        		
		        		toastPopup.openCheckPopup("삭제 완료!", true);
		        	}, onOpenFail, "UTF-8");		
				});
			}
		});	
	});
};

BUSFAVORITES.prototype.changeToDeleteMode = function(pageId) {
	var page = document.getElementById(pageId),
	title = document.querySelector('#' + pageId + '_title'),
	more = document.querySelector('#' + pageId + '_more'),
	footer = document.querySelector('#' + pageId + '_footer'),
	listview = document.querySelector('#' + pageId + ' .ui-listview'),
	list = listview.getElementsByTagName("li"),
	listLength = list.length,
	selectWrapper = document.querySelector(".select-mode"),
	selectBtn = document.getElementById("select-btn"),
	selectBtnText =  document.getElementById("select-btn-text"),
	selectAll = document.getElementById("select-all"),
	deselectAll = document.getElementById("deselect-all"),
	selectCount,
	i,
	addFunction,
	fnSelectAll,
	fnDeselectAll,
	fnPopup,
	fnPopupClose,
	fnBackKey;

	function textRefresh() {
		selectBtnText.innerHTML =
			selectCount < 10 ? "0" + selectCount : selectCount;
	}

	function modeShow() {
		selectWrapper.classList.remove("open");
		selectWrapper.classList.add("show-btn");
		textRefresh();
	}

	function modeHide() {
		selectWrapper.classList.remove("open");
		selectWrapper.classList.remove("show-btn");
		selectCount = 0;
	}

	addFunction = function(event){
		var target = event.target;
		if (!target.classList.contains("select")) {
			target.classList.add("select");
			selectCount++;
			modeShow();
		} else {
			target.classList.remove("select");
			selectCount--;
			if (selectCount <= 0) {
				modeHide();
			} else {
				textRefresh();
			}
		}
	};

	fnSelectAll = function(){
		for (i = 0; i < listLength; i++) {
			list[i].classList.add("select");
		}
		selectCount = listLength;
		modeShow();
	};

	fnDeselectAll = function(){
		for (i = 0; i < listLength; i++) {
			list[i].classList.remove("select");
		}
		modeHide();
	};

	fnPopup = function() {
		selectWrapper.classList.add("open");
		event.preventDefault();
		event.stopPropagation();
	};

	fnPopupClose = function() {
		selectWrapper.classList.remove("open");
	};

	fnBackKey = function() {
		var classList = selectWrapper.classList;
		if (event.keyName === "back" && classList.contains("show-btn")) {
			if (classList.contains("open")) {
				classList.remove("open");
			} else {
				fnDeselectAll();
			}
			event.preventDefault();
			event.stopPropagation();
		} else if (event.keyName === "back" && !classList.contains("show-btn")) {
			title.innerHTML = "즐겨찾기";
			listview.removeEventListener('click', addFunction, false);
			selectAll.removeEventListener("click", fnSelectAll, false);
			deselectAll.removeEventListener("click", fnDeselectAll, false);
			selectBtn.removeEventListener("click", fnPopup, false);
			selectWrapper.removeEventListener("click", fnPopupClose, false);
			document.removeEventListener('tizenhwkey', fnBackKey);
			modeHide();
			addModifyEvent();
			
			more.style.display = "block";
			footer.style.display = "none";
			event.preventDefault();
			event.stopPropagation();
		} 
	};
	
	page.addEventListener('pagehide', function() {
		title.innerHTML = "즐겨찾기";
		listview.removeEventListener('click', addFunction, false);
		selectAll.removeEventListener("click", fnSelectAll, false);
		deselectAll.removeEventListener("click", fnDeselectAll, false);
		selectBtn.removeEventListener("click", fnPopup, false);
		selectWrapper.removeEventListener("click", fnPopupClose, false);
		document.removeEventListener('tizenhwkey', fnBackKey);
		modeHide();
		addModifyEvent();
		
		more.style.display = "block";
		footer.style.display = "none";
	});
	
	more.style.display = "none";
	footer.style.display = "block";
	title.innerHTML = "";
	listview.addEventListener('click', addFunction, false);
	selectAll.addEventListener("click", fnSelectAll, false);
	deselectAll.addEventListener("click", fnDeselectAll, false);
	selectBtn.addEventListener("click", fnPopup, false);
	selectWrapper.addEventListener("click", fnPopupClose, false);
	document.addEventListener('tizenhwkey', fnBackKey);
	modeHide();
	removeModifyEvent();
};

/**
 *  즐겨찾기에서 정류장 클릭시 즐겨찾기 버스 목록을 수정하는 페이지를 띄운다. 
 */
function showModifyMode(event)
{
	var target = event.target;
	busFavorites.activeStationId = target.id;
	busFavorites.activeStationName = target.innerHTML;
	busFavorites.showBusListInStation(1);
}

function removeModifyEvent()
{
	var stationList = document.getElementsByClassName("li-favorites");
	for (var i = 0; i < stationList.length; ++i) {
		stationList[i].removeEventListener("click", showModifyMode);
	}
}

function addModifyEvent()
{
	var stationList = document.getElementsByClassName("li-favorites");
	for (var i = 0; i < stationList.length; ++i) {
		stationList[i].addEventListener("click", showModifyMode);
	}
}

/**
 * 즐겨찾기로 등록한 버스 정류장들을 리스트로 만든다.
 * @param data {String Array} [Station ID] [Station Name] [Registered Bus Length] <[Bus Number] [Bus Adirection]>* 
 */
BUSFAVORITES.prototype._createRegisteredStationList = function(data, init) {
	var lv = document.getElementById('lvRegisteredStation');
	
	if (init) {
		lv.innerHTML = "";
	}
	lv.innerHTML += "<li class='li-favorites' id='" + data[0] + "'>" + data[1] + "</li>";
};

/**
 * 즐겨찾기로 등록한 버스 정류장들을 보여준다. 
 */
BUSFAVORITES.prototype.showRegisteredStation = function() {
	var tpoDir, 
		tpoFile;
	
	tizen.filesystem.resolve("documents", function(result) {
        try {
        	tpoDir = result.resolve("TPO_files");
        } catch (error) {
        	toastPopup.openCheckPopup("등록하신 즐겨찾기가 없습니다.", false);
        	return;
        }
        
        if (tpoDir !== null) {
    		try {
    			tpoFile = tpoDir.resolve("TPO_favorite.tpo");
    			tpoFile.readAsText(function(txt) {
    				var stations = txt.split("\n"),
    					station;
    				
    				for (var i = 1; i < stations.length; ++i) {
    					station = stations[i].split(" ");
    					busFavorites._createRegisteredStationList(station, i === 1);
    				}
    				addModifyEvent();
    				
    				tau.changePage('#showFavoriteStation');
    			});
    		} catch (error) {
    			toastPopup.openCheckPopup("등록하신 즐겨찾기가 없습니다.", false);
    			return;
    		}
    	}
	});
};

BUSFAVORITES.prototype._modifyFile = function() {
	var tpoDir, 
	tpoFile;

	tizen.filesystem.resolve("documents", function(result) {
	    try {
	    	tpoDir = result.resolve("TPO_files");
	    } catch (error) {
	    	toastPopup.openCheckPopup("즐겨찾기를 불러오지 못하였습니다.", true);
	    	return;
	    }
	    
	    if (tpoDir !== null) {
			try {
				tpoFile = tpoDir.resolve("TPO_favorite.tpo");
				tpoFile.readAsText(function(txt) {
					var stations = txt.split("\n"),
						station,
						temp = "";
					
					for (var i = 1; i < stations.length; ++i) {
						station = stations[i].split(" ");
						if (station[0] === busFavorites.activeStationId.toString()) {
							stations[i] = busFavorites.activeStationId.toString();
							stations[i] += " " + busFavorites.activeStationName;
							stations[i] += " " + busFavorites.registerBusId.length;
							for (var j = 0; j < busFavorites.registerBusId.length; ++j) {
								stations[i] += " " + busFavorites.registerBusId[j];
								stations[i] += " " + busFavorites.registerBusAdirection[j];
							}
						}
						temp += "\n" + stations[i];
					}
					tpoDir.deleteFile(tpoFile.fullPath, function() {
        				tpoFile = tpoDir.createFile("TPO_favorite.tpo");
        				tpoFile.openStream("w", function(fs) {
        	        		fs.write(temp);
        	        		fs.close();
        	        		
        	        		toastPopup.openCheckPopup("즐겨찾기를 수정하였습니다.", true, 2);
        	        	}, onOpenFail, "UTF-8");
        			});
				});
			} catch (error) {
				toastPopup.openCheckPopup("즐겨찾기를 불러오지 못하였습니다.", false);
				return false;
			}
		}
	});
		
};

function onOpenFail(error) {
	toastPopup.openPopup("즐겨찾기 등록 실패!");
	//toastPopup.openPopup(error.message);
}

BUSFAVORITES.prototype._writeFile = function(fs, preSave) {
	fs.write(preSave);
	fs.write("\n");
	fs.write(this.activeStationId);
	fs.write(" ");
	fs.write(this.activeStationName);
	fs.write(" ");
	fs.write(this.registerBusId.length);
	for (var i = 0; i < this.registerBusId.length; ++i) {
		fs.write(" ");
		fs.write(this.registerBusId[i]);
		fs.write(" ");
		fs.write(this.registerBusAdirection[i]);
	}
	fs.close();

	toastPopup.openCheckPopup("위젯에 등록되었습니다.", true, 2);
};


/**
 * 즐겨찾기 버스 목록을 저장할 파일을 만든다.
 */
BUSFAVORITES.prototype._addToFile = function() {
	var tpoDir = null, tpoFile;
	
	// document 폴더에 저장한다.
	tizen.filesystem.resolve("documents", function(result) {
        try {
        	tpoDir = result.createDirectory("TPO_files");
        } catch (error) {
        	if (error.name === "IOError") {
        		tpoDir = result.resolve("TPO_files");
        	}
        }
        
        if (tpoDir !== null) {
        	try {
        		tpoFile = tpoDir.createFile("TPO_favorite.tpo");
        		tpoFile.openStream("rw", function(fs) {
            		busFavorites._writeFile(fs, '');
            	}, onOpenFail, "UTF-8");
        	} catch (error) {
        		if (error.name === "IOError") {
        			try {
        				tpoFile = tpoDir.resolve("TPO_favorite.tpo");
        				tpoFile.readAsText(function(txt) {
        	        		tpoDir.deleteFile(tpoFile.fullPath, function() {
    	        				tpoFile = tpoDir.createFile("TPO_favorite.tpo");
    	        				tpoFile.openStream("w", function(fs) {
    	        	        		busFavorites._writeFile(fs, txt);
    	        	        	}, onOpenFail, "UTF-8");
    	        			});
        	        	}, onOpenFail, "UTF-8");
        			} catch (error) {
        				
        			}
        		}
        	}
        }
     });
};


/**
 * 선택한 정류장에서 선택한 버스들을 즐겨찾기에 등록한다.
 */
BUSFAVORITES.prototype.confirm = function(mode) {
	var page = document.getElementById('busFavorites'),
		checkbox = page.querySelectorAll(".li-checkbox"),
		j = 0;
	
	this.registerBusId = [];
	this.registerBusAdirection = [];
	for (var i = 0; i < checkbox.length; ++i) {
		if (checkbox[i].checked) {
			this.registerBusId[j] = checkbox[i].id;
			this.registerBusAdirection[j++] = checkbox[i].dataset.adirection;
		}
	}
	
	if (j === 0) {
		toastPopup.openCheckPopup("버스 하나 이상을 선택해주세요!", false);
	} else {
		if (mode === 0) {
			this._addToFile();
		}
		else if (mode === 1) {
			this._modifyFile();
		}
	}
};

BUSFAVORITES.prototype._checkRegisteredBus = function(busId, busDirection) {
	var tpoDir, 
	tpoFile;

	tizen.filesystem.resolve("documents", function(result) {
	    try {
	    	tpoDir = result.resolve("TPO_files");
	    } catch (error) {
	    	return;
	    }
	    
	    if (tpoDir !== null) {
			try {
				tpoFile = tpoDir.resolve("TPO_favorite.tpo");
				tpoFile.readAsText(function(txt) {
					var stations = txt.split("\n"),
						station,
						n,
						page = document.getElementById('busFavorites'),
						checkbox = page.querySelectorAll(".li-checkbox");
					
					for (var i = 1; i < stations.length; ++i) {
						station = stations[i].split(" ");
						if (station[0] === busFavorites.activeStationId.toString()) {
							n = parseInt(station[2]);
							for (var j = 0; j < busId.length; ++j) {
								for (var k = 0; k < n; ++k) {
									if (busId[j] === station[3 + k * 2] && busDirection[j] === station[4 + k * 2]) {
										checkbox[j].checked = true;
									}
								}
							}
							break;
						}
					}
				});
			} catch (error) {
				return;
			}
		}
	});
}

/**
 * 활성화된(선택한) 정류장의 모든 버스 번호를 list에 checkbox와 함께 추가한다.
 * @param data {String} XML Data
 * @param mode {Number} 즐겨찾기 등록 or 수정 여부를 결정하는 값, 0 : 등록, 1 : 수정
 */
BUSFAVORITES.prototype._createBusCheckList = function(data, mode) {
	var lv = document.getElementById('lvBusFavorites'),
		x = data.getElementsByTagName("itemList"),
		busId = [],
		busDirection = [];
	
	lv.innerHTML = "";
	document.getElementById('activeStationName').innerHTML = this.activeStationName;
	for (var i = 0; i < x.length; ++i) {
		lv.innerHTML += "<li class='li-has-checkbox' id=" + x[i].getElementsByTagName("rtNm")[0].childNodes[0].nodeValue + 
		"><label>" + x[i].getElementsByTagName("rtNm")[0].childNodes[0].nodeValue + 
		"<input type='checkbox' class='li-checkbox' id=" + x[i].getElementsByTagName("rtNm")[0].childNodes[0].nodeValue + 
		" data-adirection=" + x[i].getElementsByTagName("adirection")[0].childNodes[0].nodeValue +  
		" /></label></li>";
		busId[i] = x[i].getElementsByTagName("rtNm")[0].childNodes[0].nodeValue;
		busDirection[i] = x[i].getElementsByTagName("adirection")[0].childNodes[0].nodeValue;
	}
	
	if (mode === 1) {
		this._checkRegisteredBus(busId, busDirection);
	}
};

/**
 * activeStationId 정류장 번호를 기반으로 즐겨찾기를 등록하거나 수정하는 페이지로 이동한다. 
 * @param mode {Number} 즐겨찾기 등록 or 수정 여부를 결정하는 값, 0 : 등록, 1 : 수정 
 */
BUSFAVORITES.prototype.showBusListInStation = function(mode) {
	tau.changePage("#processing");
	rest.get('http://ws.bus.go.kr/api/rest/stationinfo/getStationByUid',
			null,
			{
		"ServiceKey" : "DELETED",
		"arsId" : this.activeStationId,
			},
			function(data, xhr) {
				var msg = data.getElementsByTagName("headerCd")[0].childNodes[0].nodeValue;				
				if (msg === "4") {
					/** No result */
					toastPopup.openCheckPopup("정류장 번호를 찾지 못하였습니다.", true);
				} else if (msg === "0") {
					/** Success */
					busFavorites._createBusCheckList(data, mode);
					if (mode === 0) {
						/* 등록 */
						document.getElementById('btnModify').style.display = "none";
						document.getElementById('btnRegister').style.display = "block";
					} else if (mode == 1) {
						/* 수정 */
						document.getElementById('btnRegister').style.display = "none";
						document.getElementById('btnModify').style.display = "block";
					}
					tau.changePage("#busFavorites");
					
//					tizen.filesystem.resolve("documents", function(result) {
//						var tpoDir = result.resolve("TPO_files");
//				        
//				        if (tpoDir !== null) {
//	        				var tpoFile = tpoDir.resolve("TPO_favorite.tpo");
//	        				tpoDir.deleteFile(tpoFile.fullPath, function() {}, function() {});
//				        }
//				     });
				}
			}, function(data, xhr) {
				toastPopup.openPopup("API를 불러오는데 실패하였습니다.", true);
			});		
};
