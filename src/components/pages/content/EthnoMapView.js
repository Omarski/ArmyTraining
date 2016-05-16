/**
 * Created by Alec on 3/2/2016.
 * Taken over by David on 5/10/16
 */
var React = require('react');
var PageStore = require('../../../stores/PageStore');
var ReactBootstrap = require('react-bootstrap');
var PageHeader = require('../../widgets/PageHeader');
var ImageLayersView = require("../../widgets/ImageLayersView");


function getPageState(props) {
    var title = "";
    var pageType = "";
    var noteItems = "";
    var mediaItems = "";
    var json = "";

    var data = {
        page: "",
        info: "",
        title: "",
        pageType: "",
        noteItems: "",
        mediaItems: "",
        json: "",
        sources: []
    };

    if (props && props.page) {
        data.page = props.page;
        data.title = props.page.title;
        data.pageType = props.page.type;
        data.info = props.info;


        if(props.page.EthnoData){
            data.json = props.page.EthnoData;
        } else {
            data.json = JSON.parse(props.page.info.property[2].value);
        }
    }

    return data;
}
/*INTERACTIVE ETHNOLINGUISTIC MAP VIEW*/
var EthnoMapView = React.createClass({
    getInitialState: function() {
        var pageState = getPageState(this.props);
        return pageState;
    },
    componentWillMount: function() {
        // PageStore.addChangeListener(this._onChange);
    },
    handleClick: function(e){
        //console.dir(e.target);
    },
    componentDidMount: function() {
        //PageStore.addChangeListener(this._onChange);
    },
    componentWillUnmount: function() {
        // PageStore.removeChangeListener(this._onChange);
    },
    render: function() {
        var self = this;
        var page = self.state.page;
        var title = self.state.title;
        var sources = self.state.sources;
        var parsedJSON = JSON.parse(self.props.page.info.property[2].value);
        var backgroundImageURL = "data/media/" + parsedJSON.background;
        console.log("parsedJSON", parsedJSON);
        console.log("self", self);

        var areaWidth = "768px";
        var areaHeight = "504px";
        var imageColl = "";
        var backgroundImage = "";
        var imageColl = "";
        

        return (
            <div>
                <div className="container" key={"page-" + this.state.page.xid}>
                    <PageHeader sources={sources} title={title} key={page.xid}/>
                </div>
                <EthnoMap mediaPath="data/media/" mapData={parsedJSON} />
                <ImageLayersView areaWidth = {areaWidth} areaHeight={areaHeight} imageColl={imageColl} backgroundImage={backgroundImage} onLayersReady={this.onLayersReady} onRollover={this.onRollover} onClick={this.onClick}/>
            </div>
        );
    },
    /**
     * Event handler for 'change' events coming from the BookStore
     */
    _onChange: function() {
        this.setState(getPageState(this.props));
    }
});


//                <ImageLayersView areaWidth = {areaWidth} areaHeight={areaHeight} imageColl={imageColl} backgroundImage={backgroundImage} onLayersReady={this.onLayersReady} onRollover={this.onRollover} onClick={this.onClick}/>

// areaWidth: imageData.regions[0].nearWidth,
//     areaHeight: imageData.regions[0].nearHeight,
//     imageColl: imageData.regions,
//     backgroundImage: imageData.mapBackground,
//     onLayersReady: self.onLayersReady,
//     onRollover: self.onRegionRollover,
//     onClick: self.onRegionClicked
//
//
//













/* ++++++++++++++++++++ TOGGLE MENU DIV -- allows user to toggle (show/hide) ethnicity maps  ++++++++++++++++++++++++++*/
var EthnoToggleDiv = React.createClass({
    getInitialState: function() {
        return {}; //regions:null
    },
    componentDidMount: function() {

    },
    toggleOnClick: function(e){
        var self = this;
        console.log("this", self);
        var index = e.target.attributes['data-index'].value;
        var targetCanvas = document.getElementById("ethnoMapCanvas_" + index);
        // CHECK VISIBLE --- determines if a given ethno map (parameter is a canvas element) has the custom CSS class visible
        var checkOpacity = function(target){
            var visibleTrueFalse = $("#ethnoMapCanvas_" + index).hasClass("visible");
            var zIndex = getComputedStyle(target).getPropertyValue("z-index");
            //IF canvas is not visible --> make it visible (add CSS class visible)
            if(visibleTrueFalse === false){
                $("#ethnoMapCanvas_" + index).addClass("visible");
                var newZIndex = getComputedStyle(target).getPropertyValue("z-index");
                // Update state to set visible value to true
                //IF canvas is visible --> make it not visible (remove CSS class visible)
            } else if (visibleTrueFalse === true){
                $("#ethnoMapCanvas_" + index).removeClass("visible");
            }
        }
        checkOpacity(targetCanvas);
    },
    render: function () {
        var self = this;
        var mapData = self.props.mapData;
        //RETURN --- returns a toggle botton for each region in the JSON area of ethno-regions
        return (
            <div>
                { mapData.areas.map(function(region,index){
                    return  <div>
                                <p>{region.label}</p>
                                <button data-region = {region.label} data-index={index} onClick = {self.toggleOnClick}>Toggle</button>
                            </div>
                    })
                }
            </div>
        );
    }
});





var EthnoMapLabels = React.createClass({
    getInitialState: function(){
        return {};
    },
    componentDidMount: function(){

    },
    render: function(){
        var mapData = this.props.mapData;
        // console.log("mapData", mapData);
        // console.log("mapData.areas[i].label", mapData.areas[0].label);
        return (
            <div>
            {mapData.areas.map(function(region, i){
                return (
                  <div>
                      <p id={"#ethnoMapCanvas_" + i + "_text"}>{mapData.areas[i].label}</p>
                  </div>
                );
                })
            }
            </div>
        );
    }
});





/* ++++++++++++++++++++  ETHNO MAP VIEW -- Toggle Menu and Map Injected Into this component ++++++++++++++++++++++++++ */
var EthnoMap = React.createClass({
    getInitialState: function() {
        return {};
    },
    componentDidMount: function() {
        this.placeRegions();
    },
    createCanvas: function(canvasData){
        var self = this;
        var canv = document.createElement("canvas");
        canv.setAttribute('width',canvasData.canvasWidth);
        canv.setAttribute('height',canvasData.canvasHeight);
        canv.setAttribute('id',canvasData.canvasId);
        canv.className = "ethno-map-region-canvas";
        canv.style = canvasData.canvasStyle;
        var context = canv.getContext("2d");
        var image = new Image();
        image.onload = function(){
            context.drawImage(image,0,0);
        };
        image.src = canvasData.mapSrc;
        canv.addEventListener("click", function(e){
            self.onRegionClick(e);
        });
        canv.addEventListener("mousemove", function(e){
            self.onRegionMouseover(e);
        });
        return canv;
    },
    placeRegions: function(){
        var self = this;
        var canvasColl = [];
        this.props.mapData.areas.map(function(region,index){
            var regionCanvas =  self.createCanvas({
                position: "relative !important",
                canvasWidth: "768px !important",
                canvasHeight: "504px !important",
                canvasId:"ethnoMapCanvas_" + index,
                canvasStyle:"{opacity: 0; z-index:"+index+1+"}",
                canvasIndex: "",
                index: index,
                mapSrc: self.props.mediaPath + region.image
            });
            document.getElementById("ethnoMap").appendChild(regionCanvas);
            canvasColl.push(regionCanvas);
        });
        this.setState({canvasColl: canvasColl});
    },
    onRegionClick: function(e) {
        this.pixelTracker(e, "click");
    },
    onRegionMouseover: function(e) {
        this.pixelTracker(e, "mousemove");
    },
    pixelTracker: function(e, mode) {
        var self = this;
        // console.log("self.state", self.statef);
        var canvas = e.target.getContext('2d');
        var targetId = e.target.id;
        console.log("targetId", targetId);
        var x = e.offsetX;
        var y = e.offsetY;
        var currentTextId = "#" + e.target.id + "_text";

        if(mode === "mousemove") {
            var pixel = canvas.getImageData(e.offsetX, e.offsetY, 1, 1).data;
            console.log("pixel", pixel);

            var mapsArray = self.state.canvasColl;
            // console.log(mapsArray);
            // console.log("mapsArray", mapsArray);
            //if the pixel is transparent

            if (pixel[3] === 0) {
                // console.log("pixel 3 is transparent")
                //for every map
                for (var i = 0; i < mapsArray.length; i++) {
                    //check if visible -- if second item in array is true
                    //     console.log("mapsArrrayi", mapsArray[i]);
                    var nextCanvas = mapsArray[i].getContext('2d');
                    var nextPixel = nextCanvas.getImageData(x, y, 1, 1).data;
                    console.log("nextPixel", nextPixel);
                    if (nextPixel[3] !== 0) {
                        var test = document.getElementById("ethnoMapCanvas_" + i);
                        $("#" + targetId).removeClass("onTop");
                        $("#ethnoMapCanvas_" + i).addClass("onTop");

                        // $("#ethnoMapCanvas_" + i + "_text").addClass("visibleText");
                    }
                }
                // if (typeof(nextPixel[3]) === "number" && pixel !== 0){
                //     console.log("make HOVER appear!!");
                // }

            } else if (typeof(pixel[3]) === "number" && pixel !== 0) {

            }
        }

        if(mode === "click"){
            console.log("click", e.target.id);
            // $(self.state.).removeClass("visibleText");
            // $("#" + e.target.id + "_text").addClass("visibleText");
        }


        // if( mode === "mousemove" ){
        //     if(pixel[3] === 0){
        //         document.getElementById(e.target.id).style.zIndex = 0;
        //         for(var i = 0; i < self.state.canvasColl; i++){
        //             if(self.state.canvasColl[i].hasClass("visible")){
        //             }
        //         }
        //     } else if (pixel[3] === 1){
        //     }
        // }
    },
    render: function() {
        var self = this;
        var backgroundImage = self.props.mapData.background;
        var mapData = self.props.mapData;
        var imageLayersData = {areaWidth:"", areaHeight:"", imageColl:"", backgroundImage:"", onLayersReady:"", onRollover:"", onClick:""}
        var areaWidth = "768px";
        var areaHeight = "504px";
        var mapBackground = self.props.mediaPath + backgroundImage;
        var mapStyle = {background:"#000 url("+mapBackground+") no-repeat", width:"768px" , height:"504px"};
        var canvasColl = this.state.canvasColl
        return (
            <div>
                <div id="ethnoToggle">
                    <EthnoToggleDiv mapData = {mapData} canvasColl = {canvasColl}/>
                </div>
                <div id="ethnoMap" className="ethno-map" style={mapStyle} ref={(c) => self._mainMap = c}>
                </div>
                <EthnoMapLabels mapData = {mapData} className="ethno-labels"/>
            </div>
        );
    }
});
/*
 <ImageLayersView imageLayersData = {imageLayersData} />
* <ImageLayersView imageLayersData = {
 *
 *      areaWidth: //width of your image stack,
 *      areaHeight: //height of your image stack,
 *      imageColl: array of objects representing your image data (harvest from your page's JSON),
 *      backgroundImage: //URL to the non responsive background image,
 *      onLayersReady: a function that will be passed an array of the image layers (canvas elements) when ready,
 *      onRollover: a function that is passed a layer (canvas) element if cursor is on a live area or null otherwise,
 *      onClick: a function that is passed the canvas element clicked on or null if clicked on empty area.
 *
 * } />
*/
module.exports = EthnoMapView;