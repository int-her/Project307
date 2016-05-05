/*global tau*/
var moreoption = (function() {
	var moreoption = {},
		page,
		popup,
		handler,
		elSelector,
		selector,
		clickHandlerBound;
	
	function clickHandler(event) {
		tau.openPopup(popup);
	}
	
	moreoption.pageBeforeShowHandler = function(pageId) {
		var radius = window.innerHeight / 2 * 0.8;
		page = document.getElementById(pageId);
		handler = page.querySelector(".ui-more");
		popup = page.querySelector("#" + pageId + "_MoreOptions");
		elSelector = page.querySelector("#selector");

		clickHandlerBound = clickHandler.bind(null);
		handler.addEventListener("click", clickHandlerBound);
		
		selector = tau.widget.Selector(elSelector, {itemRadius: radius});
		
		elSelector.addEventListener("click", function(event) {
			var target = event.target;
			if (target.classList.contains("ui-selector-indicator")) {
				tau.closePopup(popup);
			}
		});
	};

	moreoption.pageBeforeHideHandler = function() {
		handler.removeEventListener("click", clickHandlerBound);
		selector.destroy();
	};
	
	return moreoption;
}());