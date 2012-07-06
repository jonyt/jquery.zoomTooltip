A plugin for jQuery that allows a zoomed version of a thumbnail to be used as a tooltip. This is useful for sites like Faceboook where you want to give the user the ability to hover over a thumbnail and see the large version. Check out the [demo](http://jonyt.github.com/jquery.zoomTooltip/demo.html).

Load jQuery and jquery.zoomTooltip with:
```
     <script type="text/javascript" src="jquery.min.js"></script>
     <script type="text/javascript" src="jquery.zoomTooltip.js"></script>
```
Then use it with:
```
    var imageIdentifier = {
        identifier: function($img){ return $img.prop("tagName") === "IMG"; },
        handler: function($img){ return "zoom.jpg"; }
    };
    $(document).ready(function(){
        $('#someDiv').zoomTooltip([imageIdentifier], settings); // Will enable zoom tooltip on elements under #someDiv
    });
```
Where each `imageIdentifier` object has an `identifier` property which returns a boolean indicating whether this thumbnail can be zoomed, and a `handler` property which returns the zoomed image URL.

You can also play with the settings. Available keys are:

* smallImgClassName - class name added to the thumbnail
* zoomedImgClassName - class name added to the zoomed image
* loader - URL for the loading spinner
* zoomedImageCss - CSS for the zoomed image
* loaderCss - CSS for the loading spinner
