function TOASTPOPUP() {}
TOASTPOPUP.prototype = new Object();

Window.prototype.toastPopup = new TOASTPOPUP();

TOASTPOPUP.prototype.openPopup = function(text, isBackAfterClose, back) {
	var popupPage = document.getElementById("toastPopup"),
		content = popupPage.querySelector(".ui-popup-content");
	content.innerHTML = text;
	
	if (typeof isBackAfterClose !== "undefined" && isBackAfterClose === true) {
		if (typeof back === "undefined") {
			back = 1;
		}
		popupPage.addEventListener("popuphide", function() {
			setTimeout(function(){window.history.go(-back);}, 50);
		});
	}
	popupPage.addEventListener("click", function() {
		tau.closePopup();
	});
	
	tau.openPopup(popupPage);
};

TOASTPOPUP.prototype.openCheckPopup = function(text, isBackAfterClose, back) {
	var popupPage = document.getElementById("toastGraphicPopup"),
		content = popupPage.querySelector(".ui-popup-content");
	content.innerHTML = "<div class='ui-popup-toast-check-icon'></div>" + text;
	
	if (typeof isBackAfterClose !== "undefined" && isBackAfterClose === true) {
		if (typeof back === "undefined") {
			back = 1;
		}
		popupPage.addEventListener("popuphide", function() {
			setTimeout(function(){window.history.go(-back);}, 50);
		});
	}
	popupPage.addEventListener("click", function() {
		tau.closePopup();
	});
	
	tau.openPopup(popupPage);
};