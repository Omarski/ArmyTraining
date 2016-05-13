/**
 * Created by omaramer on 5/13/16.
 */

var React = require('react');

var ImageLayersView = React.createClass({

    getInitialState: function() {
        var mapWidth  = this.props.imageData.regions[0].nearWidth;
        var mapHeight = this.props.imageData.regions[0].nearHeight;
        var state = { mapWidth:mapWidth,
            mapHeight:mapHeight,
            loadedImageColl:[],
            loadCounter:0,
            totalImages:0,
            canvasColl:[],
            lastHighlightedRegion:null};
        return state;
    },

    componentWillMount: function() {
        //PageStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {

        //preload images
        var self = this;
        var state = self.state;
        var imageColl = [];

        self.props.imageData.regions.map(function(region,index){
            imageColl.push(self.props.mediaPath+region.image);
        });

        self.setState({totalImages:imageColl.length});

        for (var i=0 ; i < imageColl.length; i++){
            state.loadedImageColl[i] = new Image();
            state.loadedImageColl[i].src = imageColl[i];
            state.loadedImageColl[i].onload = self.loadCounter;
        }

        //PageStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        //PageStore.removeChangeListener(this._onChange);
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
            //self.onRegionClick(e);
        });
        canv.addEventListener("mousemove", function(e){
            self.pixelTracker(e, "mousemove");
            //self.onRegionOver(e);
        });

        return canv;

    },

    placeRegions: function(){

        var self = this;
        var canvasColl = [];

        //loop through regions
        self.props.imageData.regions.map(function(region,index){

            var regionCanvas =  self.createCanvas({
                canvasWidth:region.nearWidth,
                canvasHeight:region.nearHeight,
                canvasId:"imageLayer_canvas_" + index,
                canvasStyle:"{z-index:"+index+1+"}",
                mapSrc: self.state.loadedImageColl[index].src
            });

            document.getElementById("imageLayerView-back-image").appendChild(regionCanvas);

            canvasColl.push(regionCanvas);
        });

        self.setState({canvasColl:canvasColl});
    },

    detectRegion: function(e,pixelX,pixelY) {

        var self = this;
        var state = self.state;
        var pixelHit = false;

        for (var i=0; i< self.state.canvasColl.length; i++) {

            var canvasElement = self.state.canvasColl[i];
            var canvas = canvasElement.getContext('2d');
            var pixel = canvas.getImageData(pixelX, pixelY, 1, 1).data;

            if (pixel[3] != 0) {

                switch(canvasElement.state){

                    case "idle":
                        pixelHit = true;
                        if (!canvasElement.classList.contains("imageLayerView-fade-in")){
                            canvasElement.classList.add("imageLayerView-fade-in");
                            canvasElement.classList.remove("imageLayerView-fade-out");
                            if (state.lastHighlightedRegion) {
                                state.lastHighlightedRegion.classList.remove("imageLayerView-fade-in");
                                if (!state.lastHighlightedRegion.classList.contains("imageLayerView-fade-out")){
                                    state.lastHighlightedRegion.classList.add("imageLayerView-fade-out");
                                }
                            }
                        }

                        state.lastHighlightedRegion = canvasElement;
                        break;
                }
            }
        }

        if (!pixelHit && state.lastHighlightedRegion &&
            !state.lastHighlightedRegion.classList.contains("imageLayerView-fade-out")) {
            state.lastHighlightedRegion.classList.remove("imageLayerView-fade-in");
            state.lastHighlightedRegion.classList.add("imageLayerView-fade-out");
            state.lastHighlightedRegion = null;
        }
    },

    onRegionClick: function(e) {
        this.pixelTracker(e, "click");
    },

    onRegionOver: function(e) {
        this.pixelTracker(e, "mousemove");
    },

    pixelTracker: function(e, mode) {

        var self = this;

        if (mode == "mousemove"){
            var offset = $("#imageLayerView-back-image").offset();
            var x = e.pageX - offset.left;
            var y = e.pageY - offset.top;
            self.detectRegion(e, x, y);
        }
        else if (mode == "click"){
            self.props.onRegionClicked({clickEvent:e, regionCanvasColl:self.state.canvasColl,
                lastHighlightedRegion:self.state.lastHighlightedRegion});

            // if (self.state.lastHighlightedRegion)
            //     console.log("Clicked on: " + self.state.lastHighlightedRegion.getAttribute('id'));
        }
    },

    render: function() {
        var self = this;
        var imageData = self.props.imageData;
        var mapBackground = self.props.mediaPath + imageData.mapBackground;
        var mapStyle = {background:"#000 url("+mapBackground+") no-repeat 100% 100%",
            position:"relative", width:self.state.mapWidth+"px", height:self.state.mapHeight, textAlign:"center"};

        return (
            <div id="imageLayerView-back-image" className="imageLayerView-back-image" style={mapStyle}>

            </div>
        );
    }
});

module.exports = ImageLayersView;