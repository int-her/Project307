var toastPopup = (function() {
	var popupPage,
	content,
	toastPopup = {};
	
	toastPopup.openPopup = function(text, clickFunction) {
		popupPage = document.getElementById("toastPopup");
		content = popupPage.querySelector(".ui-popup-content");
		content.innerHTML = text;
		
		if (typeof clickFunction === "undefined") {
			popupPage.addEventListener("click", function(e) {
				tau.closePopup();
			});
		} else {
			popupPage.addEventListener("click", clickFunction);
		}
		
		tau.openPopup("toastPopup");
	};
	
	toastPopup.openCheckPopup = function(text, clickFunction) {
		popupPage = document.getElementById("toastGraphicPopup");
		content = popupPage.querySelector(".ui-popup-content");
		content.innerHTML = "<div class='ui-popup-toast-check-icon'></div>" + text;
		
		if (typeof clickFunction === "undefined") {
			popupPage.addEventListener("click", function(e) {
				tau.closePopup();
			});
		} else {
			popupPage.addEventListener("click", clickFunction);
		}
		
		tau.openPopup("toastGraphicPopup");
	};
	
	
	return toastPopup;
}());