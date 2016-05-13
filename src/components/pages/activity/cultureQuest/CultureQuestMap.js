
var React = require('react');

var CultureQuestMap = React.createClass({

    getInitialState: function() {
        return {loadedImageColl:[], loadCounter:0, totalImages:0, canvasColl:[], lastHighlightedRegion:null};
    },

    componentWillMount: function() {
        //PageStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {

        //preload images
        var self = this;
        var state = self.state;
        var imageColl = [];

        self.props.mapData.regions.map(function(region,index){
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
        canv.className = "cultureQuest-region-canvas";
        var context = canv.getContext("2d");
        var image = new Image();
        image.src = canvasData.mapSrc;
        image.onload = function(){
            context.drawImage(image,0,0);
        };

        //events
        canv.addEventListener("click", function(e){
            self.onRegionClick(e);
        });
        canv.addEventListener("mousemove", function(e){
            self.onRegionOver(e);
        });

        return canv;

    },

    placeRegions: function(){

        var self = this;
        var canvasColl = [];

        //loop through regions
        self.props.mapData.regions.map(function(region,index){

            var regionCanvas =  self.createCanvas({
                canvasWidth:region.nearWidth,
                canvasHeight:region.nearHeight,
                canvasId:"cultureQuest_canvas_" + index,
                canvasStyle:"{z-index:"+index+1+"}",
                mapSrc: self.state.loadedImageColl[index].src
            });

            document.getElementById("cultureQuest-map").appendChild(regionCanvas);

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
                        if (!canvasElement.classList.contains("cultureQuest-fade-in")){
                            canvasElement.classList.add("cultureQuest-fade-in");
                            canvasElement.classList.remove("cultureQuest-fade-out");
                            if (state.lastHighlightedRegion) {
                                state.lastHighlightedRegion.classList.remove("cultureQuest-fade-in");
                                if (!state.lastHighlightedRegion.classList.contains("cultureQuest-fade-out")){
                                    state.lastHighlightedRegion.classList.add("cultureQuest-fade-out");
                                }
                            }
                        }

                        state.lastHighlightedRegion = canvasElement;
                        break;
                }

            }else{


            }
        }

        if (!pixelHit && state.lastHighlightedRegion &&
            !state.lastHighlightedRegion.classList.contains("cultureQuest-fade-out")) {
            state.lastHighlightedRegion.classList.remove("cultureQuest-fade-in");
            state.lastHighlightedRegion.classList.add("cultureQuest-fade-out");
            state.lastHighlightedRegion = null;
        }
    },

    onRegionClick: function(e) {
        this.pixelTracker(e, "click");
    },

    onRegionOver: function(e) {
        this.pixelTracker(e, "hover");
    },

    pixelTracker: function(e, mode) {

        var self = this;
        function findPos(obj) {

            var curleft = 0, curtop = 0;
            if (obj.offsetParent) {
                do {
                    curleft += obj.offsetLeft;
                    curtop += obj.offsetTop;
                } while (obj = obj.offsetParent);
                return {x: curleft, y: curtop};
            }
            return undefined;
        }

        // get the position of clicked pixel
        var pos = findPos(e.target);
        var x = e.pageX - pos.x;
        var y = e.pageY - pos.y;

        if (mode == "hover"){
            self.detectRegion(e, x, y);
        }
        else if (mode == "click"){
            if (self.state.lastHighlightedRegion)
                console.log("Clicked on: " + self.state.lastHighlightedRegion.getAttribute('id'));
        }
    },

    render: function() {
        var self = this;
        var mapData = self.props.mapData;
        var mapBackground = self.props.mediaPath + mapData.mapBackground;
        var mapStyle = {background:"#000 url("+mapBackground+") no-repeat 100% 100%",
            position:"relative", width:"768px" , height:"504px", textAlign:"center"};

        return (
            <div id="cultureQuest-map" className="cultureQuest-map" style={mapStyle}>

            </div>
        );
    }
});

module.exports = CultureQuestMap;