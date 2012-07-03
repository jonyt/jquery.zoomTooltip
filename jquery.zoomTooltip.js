(function ($) {
	'use strict';
	var handlers = []; // Each handler should have an 'identifier' property which is a function returning a boolean indicating
					   // whether or not an element can be zoomed, and a 'handler' property which returns the URL of the zoomed
					   // image
	// Calculate the vertical position of the image and the zoom factor (max possible image width/real image width)
	function getVerticalPositionAndRatio(event, imageHeight, imageWidth) {
		var ratio = 1,
			vPadding = 10,
			vClearance = imageHeight / 2 + vPadding,
			vPosition = event.clientY - vClearance,
			topMargin = event.clientY,
			bottomMargin = $(window).height() - event.clientY,
			rightMargin = $(window).width() - event.clientX;
		if (vClearance > topMargin){
			vPosition = vPadding;
		} else if (vClearance > bottomMargin) {
			vPosition = $(window).height() - imageHeight - vPadding;
		}	
		if (rightMargin < imageWidth){
			ratio = rightMargin / imageWidth;
		}
		
		return {position: vPosition, ratio: ratio};
	}
	
	// Get the URL of the zoomed image
	function getZoomedImageUrl(element){
		var zoomUrl;
		$(handlers).each(function(index, handler){
			if (handler.identifier(element)){
				zoomUrl = handler.handler(element);
				return false;
			}
		});
	
		return zoomUrl;
	};		
	
	function setPositionAndDimensions(event, zoomedImage, zoomedImageDimensions){
		var positionAndRatio = getVerticalPositionAndRatio(event, zoomedImageDimensions.height, zoomedImageDimensions.width);
		$(zoomedImage).css({
			top:    positionAndRatio.position, 
			left:   event.pageX, 
			width:  zoomedImageDimensions.width * positionAndRatio.ratio,
			height: zoomedImageDimensions.height * positionAndRatio.ratio
		});
	}
	
    $.fn.zoomTooltip = function(hndlrs, settings) {		
		handlers = hndlrs;
		var options = $.extend({
			smallImgClassName:  'zt-small',
			zoomedImgClassName: 'zt-zoomed',
			dbKeyDimensions:    'originalDimensions',
			dbKeyZoomedImg:     'zoomedImage',
			loader:             'ajax-loader.gif',
			zoomedImageCss:     {
									padding:    '5px', 
									background: 'white'
								},
			loaderCss:          {
									opacity:         0.8,
									'border-radius': 1,
									background:      'white'
								} 
		}, settings);		
		
		// Remove the zoom image if the mouse is anywhere but on a zoomed image or a small image
		$(this).parent().mousemove(function(e){
			if (!($(e.target).hasClass(options.smallImgClassName) || $(e.target).hasClass(options.zoomedImgClassName))){
				var zoomedImage = $('.' + options.zoomedImgClassName).filter(':visible');
				zoomedImage.fadeOut();
			}
		});
		
		// Iterate all elements under this one
		$('*', this).each(function(index, element) {
			var $el = $(element);
			if ($el.hasClass(options.smallImgClassName) || $el.hasClass(options.zoomedImgClassName)) return;
			var	zoomedImageUrl = getZoomedImageUrl($el);			
			if (zoomedImageUrl === undefined) return; // Can't find zoomed image URL - no need to continue
			
			$el.mousemove(function(e){				
				if ($el.hasClass(options.smallImgClassName)) { // Zoomed image is ready, we just need to set position and dimensions 
					var existingZoomedImage = $.data($el, options.dbKeyZoomedImg);
					var dimensions = $.data($el, options.dbKeyDimensions);
					if (dimensions === undefined) return; // Happens in FF sometime for some reason
					setPositionAndDimensions(e, existingZoomedImage, dimensions);
					if (!existingZoomedImage.is(':visible')){
						existingZoomedImage.fadeIn();
					}
				} else { // First time we've seen this element so we need to set up everything						
					var loader = $('<img />', { // Spinner
							src: options.loader,
							alt: 'Loading...'
						}),
						zoomImage = $('<img />', { // The zoom image
							'class': options.zoomedImgClassName, 
							src:     zoomedImageUrl, 
							alt:     ''
						}),
						$body = $('body');
					loader.load(function(){
						$(this).css($.extend({							
							position: 		 'absolute',
							top:  			 $el.offset().top + 2,
							left: 			 $el.offset().left + $el.width() - $(this).width() - 2
						}, options.loaderCss));
					});					
					$body.append(loader);
					
					// Create the zoom image, when it's loaded give it the proper dimensions	
					$body.append(zoomImage);
					zoomImage.load(function(){
						$.data($el, options.dbKeyDimensions, {
							width:  $(this).width(), 
							height: $(this).height()
						});
						$(this).css($.extend({
							position:   'absolute', 
							zIndex:     999							
						}, options.zoomedImageCss));
						setPositionAndDimensions(e, this, $.data($el, options.dbKeyDimensions));
						loader.remove();
					});
					var bounds = {
						xMin: $el.offset().left,
						xMax: $el.offset().left + $(this).width(),
						yMin: $el.offset().top,
						yMax: $el.offset().top + $(this).height()
					};
					// If the mouse pointer is on the zoomed image but out of the bounds of the small image, remove the zoom image, otherwise make sure we move the zoom image and modify its size appropriately
					zoomImage.mousemove(function(e){ 
						if (e.pageX < bounds.xMin || 
							e.pageX > bounds.xMax || 
							e.pageY < bounds.yMin || 
							e.pageY > bounds.yMax) {
							$(this).fadeOut();
							return;
						}
						setPositionAndDimensions(e, this, $.data($el, options.dbKeyDimensions));						
					});		
					$el.addClass(options.smallImgClassName);	
					$.data($el, options.dbKeyZoomedImg, zoomImage);			
				}
			});
		});
    }     
})(jQuery);
