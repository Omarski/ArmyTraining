var React = require('react')
var NotificationActions = require('../../actions/NotificationActions');


var EthnoLayersView = React.createClass({

    getInitialState: function() {

        var state = {
            mediaPath: 'data/media/',
            mapWidth: this.props.areaWidth,
            mapHeight: this.props.areaHeight,
            loadedImageColl:[],
            loadCounter:0,
            totalImages:0,
            canvasColl:[],
            lastHighlightedRegion:null
        };

        return state;
    },

    componentWillMount: function() {

    },
    componentDidMount: function() {
        var self = this;
        var state = self.state;
        // setTimeout(
        //     function(){
        //         NotificationActions.show({
        //             title: 'Interactive Ethnolinguistic Map',
        //             body: 'Loading...',
        //             full: false,
        //             percent: 0,
        //             allowDismiss: true
        //         })
        //preload images
        var imageColl = [];

        self.props.imageColl.map(function(region,index){
            imageColl.push(self.state.mediaPath+region.image);
        });

        self.setState({totalImages:imageColl.length});


    console.log("imageColl", imageColl);

        self.loadImage(imageColl, 0);

        /*
        for (var i=0 ; i < imageColl.length; i++){
            state.loadedImageColl[i] = new Image();
            state.loadedImageColl[i].src = imageColl[i];
            state.loadedImageColl[i].onload = self.loadCounter;
            if(i > 0){
                var x = ((i+1)/imageColl.length) * 100;
                NotificationActions.updatePercent(x);
                if( (i + 1) === (imageColl.length)){
                            NotificationActions.hide(true);
                            if($('.modal-backdrop')){
                                $('.modal-backdrop').remove();
                            }
                }
            }
        }
        */
        //     }
        // );

    },

    loadImage: function(imagesArray, index){
        var self = this;
        var state = self.state;
        if(index < imagesArray.length){
            var self = this;
            state.loadedImageColl[index] = new Image();
            state.loadedImageColl[index].src = imagesArray[index];
            state.loadedImageColl[index].onload = function () {
                index++;
                self.loadImage(imagesArray, index);
            };
        } else {
            console.log("image load complete");
            self.placeRegions();
        }
    },

    componentWillUnmount: function() {
    },

    loadCounter: function(){
        var self = this;
        self.state.loadCounter++;
        if (self.state.loadCounter == self.state.totalImages){
            this.onImagesPreloaded();
        }
    },

    onImagesPreloaded: function(){
        this.placeRegions();
    },

    createCanvas: function(canvasData){

        var self = this;
        var canv = document.createElement("canvas");
        canv.setAttribute('width',canvasData.canvasWidth);
        canv.setAttribute('height',canvasData.canvasHeight);
        canv.setAttribute('id',canvasData.canvasId);
        canv.style = canvasData.canvasStyle;
        canv.state = "idle";
        canv.className = "imageLayerView-region-canvas";
        var context = canv.getContext("2d");
        var image = new Image();
        image.src = canvasData.mapSrc;
        image.onload = function(){
            context.drawImage(image,0,0);
        };

        //events
        canv.addEventListener("click", function(e){
            self.pixelTracker(e, "click");
        });

        canv.addEventListener("mousemove", function(e){
            self.pixelTracker(e, "mousemove");
        });

        canv.addEventListener("mouseout", function(e){
            self.pixelTracker(e, "mouseout");
        })

        return canv;

    },

    placeRegions: function(){

        var self = this;
        var canvasColl = [];
        var lastActualLabel = "";

        //loop through regions
        self.props.imageColl.map(function(image,index){

            var regionCanvas =  self.createCanvas({
                canvasWidth:self.props.areaWidth,
                canvasHeight:self.props.areaHeight,
                canvasId: "imageLayer_canvas_" + index,
                canvasStyle:"{z-index:"+index+1+"}",
                mapSrc: self.state.loadedImageColl[index].src
            });

            document.getElementById("imageLayerView-back-image").appendChild(regionCanvas);


            canvasColl.push(regionCanvas);
            // self.props.onLayersReady(regionCanvas);
        });

        self.setState({canvasColl:canvasColl});
        self.props.onLayersReady(self.state.canvasColl);
    },

    detectRegion: function(e,pixelX,pixelY, pageX, pageY) {
        var self = this;
        var pixelHit = false;

        for (var i = 0; i < self.state.canvasColl.length; i+=2) {
            var canvasElement = self.state.canvasColl[i];
            var canvas = canvasElement.getContext('2d');
            var pixel = canvas.getImageData(pixelX, pixelY, 1, 1).data;
            var opacityLevel = getComputedStyle(canvasElement).getPropertyValue("opacity");
            var opacityLevelHilight = getComputedStyle(self.state.canvasColl[i + 1]).getPropertyValue("opacity");
            var hilightZIndex = self.props.topZIndex + 19;

            if (pixel[3] !== 0) {
                pixelHit = true;
                //If the region is visible
                if(opacityLevel === "0.8") {
                    self.state.lastHighlightedRegion = canvasElement;
                    self.props.onRollover(canvasElement, pixelX, pixelY, pageX, false);
                    if(opacityLevelHilight === "0" ) {
                        $("#" + self.state.canvasColl[i + 1].id).removeClass("ethno-not-visible");
                        $("#" + self.state.canvasColl[i + 1].id).addClass("ethno-visible");
                    }
                    $("#" + self.state.canvasColl[i + 1].id).css("zIndex", hilightZIndex);
                }
                //If the region is invisible
                if(opacityLevel === "0"){
                    //console.log("inside opacity level");
                    self.state.lastHighlightedRegion = canvasElement;
                    self.props.onRollover(canvasElement, pixelX, pixelY, pageX, false);
                    // $("#" + self.state.canvasColl[i].id).removeClass("ethno-not-visible");
                    // $("#" + self.state.canvasColl[i].id).addClass("ethno-visible");
                    if(opacityLevelHilight === "0" ) {
                        $("#" + self.state.canvasColl[i + 1].id).removeClass("ethno-not-visible");
                        $("#" + self.state.canvasColl[i + 1].id).addClass("ethno-visible");
                    }
                    $("#" + self.state.canvasColl[i + 1].id).css("zIndex", hilightZIndex);
                }
            } else if (pixel[3] === 0 || opacityLevel === "0") {
                if($("#" + self.state.canvasColl[i + 1].id).hasClass("ethno-visible")) {
                    $("#" + self.state.canvasColl[i + 1].id).removeClass("ethno-visible");
                    $("#" + self.state.canvasColl[i + 1].id).addClass("ethno-not-visible");
                }
            }

        }

        if (!pixelHit) {
            // self.props.onRollover(null);
            self.state.lastHighlightedRegion = null
        }
    },

    pixelTracker: function(e, mode) {

        var self = this;

        if (mode == "mousemove"){
            var offset = $("#wrapperDiv").offset();
            var x = function(){return e.pageX - offset.left}();
            var y = function(){return e.pageY - offset.top}();
            // console.log("x", x, "y", y);
            self.detectRegion(e, x, y, e.pageX, e.pageY);
            // console.log("document.body.style.cursor", document.body.style.cursor);
        }
        else if (mode == "click"){
            // console.log("self.state.lastHighlightedRegion", self.state.lastHighlightedRegion);
            // console.log("x", x, "y", y);
            var offset = $("#wrapperDiv").offset();
            var x = function(){return e.pageX - offset.left}();
            var y = function(){return e.pageY - offset.top}();
            self.props.onClick(self.state.lastHighlightedRegion, x, y);
        }
        else if (mode = "mouseout") {
            if(!$("#toolTipperId").hasClass("ethno-not-visible")) {
                $("#toolTipperId").addClass("ethno-not-visible");
            }
            // document.body.style.cursor = "zoom-in";
        }
    },

    render: function() {

        var self = this;
        var mapBackground = self.state.mediaPath + self.props.backgroundImage;
        var mapStyle = {background:"transparent url("+mapBackground+") no-repeat 100% 100%",
            position:"relative", width:self.state.mapWidth+"px", height:self.state.mapHeight, textAlign:"center"};

        //<div className="ethno-instruction-text"><p>Click on tribal areas on the map to learn about each tribe.</p></div>
        return (
                <div id="imageLayerView-back-image" className="imageLayerView-back-image" style={mapStyle}></div>
        );
    }
});


module.exports = EthnoLayersView;