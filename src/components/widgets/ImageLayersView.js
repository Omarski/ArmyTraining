/*
 * Created by omaramer on 5/13/16.
 * This widget takes an object and creates layers of uncropped images that respond to
 * rollovers and clicks on a pixel level.
 *
 * How to use:
 * require the widget from components/widgets/ImageLayersView
 * Pass the widget the following attributes:
 * <ImageLayersView
 *
 *      areaWidth =  //width of your image stack,
 *      areaHeight =  //height of your image stack,
 *      imageColl = array of objects representing your image data (harvest from your page's JSON),
 *      backgroundImage = URL to the non responsive background image,
 *      onLayersReady = a function that will be passed an array of the image layers (canvas elements) when ready,
 *      onRollover = a function that is passed a layer (canvas) element if cursor is on a live area or null otherwise,
 *      onClick= a function that is passed the canvas element clicked on or null if clicked on empty area.
 *
 *  />
 */

var React = require('react');
var PropTypes  = React.PropTypes;

var ImageLayersView = React.createClass({

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

    propTypes: {
        areaWidth: PropTypes.number,
        areaHeight: PropTypes.number,
        imageColl: PropTypes.array.isRequired,
        backgroundImage: PropTypes.string.isRequired,
        onLayersReady: PropTypes.func.isRequired,
        onRollover: PropTypes.func.isRequired,
        onClick: PropTypes.func.isRequired
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
        canv.className = "image-layers-view-region-canvas";
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

        return canv;
    },

    placeRegions: function(){

        var self = this;
        var canvasColl = [];

        //loop through regions
        self.props.imageColl.map(function(image,index){

            var id = (image.id) ? image.id : index;
            var regionCanvas =  self.createCanvas({
                canvasWidth:self.props.areaWidth,
                canvasHeight:self.props.areaHeight,
                canvasId:"imageLayer_canvas_" + id,
                canvasStyle:"{z-index:"+index+1+"}",
                mapSrc: self.state.loadedImageColl[index].src
            });
            document.getElementById("image-layers-view-back-image").appendChild(regionCanvas);

            canvasColl.push(regionCanvas);
        });

        self.setState({canvasColl:canvasColl});
        self.props.onLayersReady(canvasColl);
    },

    detectRegion: function(e,pixelX,pixelY) {

        var self = this;
        var pixelHit = false;

        for (var i = 0; i < self.state.canvasColl.length; i++) {

            var canvasElement = self.state.canvasColl[i];
            if (canvasElement.getAttribute('hidden') === true) continue;
            var canvas = canvasElement.getContext('2d');
            var pixel = canvas.getImageData(pixelX, pixelY, 1, 1).data;

            if (pixel[3] != 0) {
                pixelHit = true;
                self.state.lastHighlightedRegion = canvasElement;
                self.props.onRollover(canvasElement, e.pageX, e.pageY);
                break;
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
            var offset = $("#image-layers-view-back-image").offset();
            var x = e.pageX - offset.left;
            var y = e.pageY - offset.top;
            self.detectRegion(e, x, y);
        }
        else if (mode == "click"){
            self.props.onClick(self.state.lastHighlightedRegion);
        }
    },

    render: function() {

        var self = this;
        var mapBackground = self.state.mediaPath + self.props.backgroundImage;
        var mapStyle = {background:"#000 url("+mapBackground+") no-repeat 100% 100%",
            position:"relative", width:self.state.mapWidth+"px", height:self.state.mapHeight, textAlign:"center"};

        return (
            <div id="image-layers-view-back-image" className="image-layers-view-back-image" style={mapStyle}>

            </div>
        );
    }
});

module.exports = ImageLayersView;