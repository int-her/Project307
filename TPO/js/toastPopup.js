var toastPopup = (function() {
	var popupPage,
	content,
	toastPopup = {};
	
	function openPopup(popupId, text) {
		popupPage = document.getElementById(popupId),
		content = popupPage.querySelector(".ui-popup-content");
		content.innerHTML = text;
		tau.openPopup(popupId);
	}
	toastPopup.openPopup = openPopup;
	
	return toastPopup;
}());