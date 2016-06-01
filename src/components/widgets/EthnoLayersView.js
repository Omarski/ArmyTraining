var React = require('react');

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

        //preload images
        var self = this;
        var state = self.state;
        var imageColl = [];

        self.props.imageColl.map(function(region,index){
            imageColl.push(self.state.mediaPath+region.image);
        });

        self.setState({totalImages:imageColl.length});

        for (var i=0 ; i < imageColl.length; i++){
            state.loadedImageColl[i] = new Image();
            state.loadedImageColl[i].src = imageColl[i];
            state.loadedImageColl[i].onload = self.loadCounter;
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

        //loop through regions
        self.props.imageColl.map(function(image,index){

            var regionCanvas =  self.createCanvas({
                canvasWidth:self.props.areaWidth,
                canvasHeight:self.props.areaHeight,
                canvasId:"imageLayer_canvas_" + index,
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
        // XXXXXXXXXX pageX and pageY are extra parameters that I pass into onRollover on line 153; This change also is related to the cahnge on line 173 which sets it up
        var self = this;
        var pixelHit = false;

        for (var i = 0; i < self.state.canvasColl.length; i++) {

            var canvasElement = self.state.canvasColl[i];
            var canvas = canvasElement.getContext('2d');
            var pixel = canvas.getImageData(pixelX, pixelY, 1, 1).data;
            // XXXXXXXXXX  DAVID ---- You have .getAttribute('hidden') can we change it to find the opacity, like below? XXXXXXXXXX
            var opacityLevel = getComputedStyle(canvasElement).getPropertyValue("opacity");

            if (pixel[3] !== 0) {
                pixelHit = true;
                // XXXXXXXXXX If the opacity is 1 (which is the default--we can change this to !== 0 if you'd like) then it changes the lastHighlightedRegion to the current element. XXXXXXXXXX
                if(opacityLevel === "1") {
                    self.state.lastHighlightedRegion = canvasElement;
                    // I pass in pageX and pageY below. I added this because it is faster than setting up another listener in my component; this passes the XY mouse coordinates in context of the page not just the canvas
                    self.props.onRollover(canvasElement, pixelX, pixelY);
                }
            }
        }

        if (!pixelHit) {
            self.props.onRollover(null);
            self.state.lastHighlightedRegion = null;
        }
    },

    pixelTracker: function(e, mode) {

        var self = this;

        if (mode == "mousemove"){
            var offset = $("#imageLayerView-back-image").offset();
            var x = function(){return e.pageX - offset.left}();
            var y = function(){return e.pageY - offset.top}();
            //XXXXXXXXXX below we pass the e.pageX and e.pageY so we get the mouse coordinates that I need
            self.detectRegion(e, x, y, e.pageX, e.pageY);
        }
        else if (mode == "click"){
            self.props.onClick(self.state.lastHighlightedRegion);
        } else if (mode = "mouseout") {
            if(!$("#toolTipperId").hasClass("ethno-not-visible")) {
                $("#toolTipperId").addClass("ethno-not-visible");
            }
        }
    },

    render: function() {

        var self = this;
        var mapBackground = self.state.mediaPath + self.props.backgroundImage;
        var mapStyle = {background:"#000 url("+mapBackground+") no-repeat 100% 100%",
            position:"relative", width:self.state.mapWidth+"px", height:self.state.mapHeight, textAlign:"center"};

        return (
            <div id="imageLayerView-back-image" className="imageLayerView-back-image" style={mapStyle}>

            </div>
        );
    }
});


module.exports = EthnoLayersView;