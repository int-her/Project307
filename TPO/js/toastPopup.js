var toastPopup = (function() {
	var popupPage,
	content,
	toastPopup = {};
	
	toastPopup.openPopup = function(popupId, text) {
		popupPage = document.getElementById(popupId);
		content = popupPage.querySelector(".ui-popup-content");
		content.innerHTML = text;
		tau.openPopup(popupId);
	};
	
	return toastPopup;
}());