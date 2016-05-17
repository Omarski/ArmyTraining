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
        json: ""
    };

    if (props && props.page) {
        data.page = props.page;
        data.title = props.page.title;
        data.pageType = props.page.type;
        data.info = props.info;
        data.imageData = JSON.parse(props.page.info.property[2].value);


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
    onLayersReady: function(x){
        console.log("x", x);
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

        var areaWidth = "768";
        var areaHeight = "504px";
        var imageColl = parsedJSON.areas;
        var backgroundImage = "";
        

        return (
            <div>
                <div className="container" key={"page-" + this.state.page.xid}>
                    <PageHeader sources={sources} title={title} key={page.xid}/>
                </div>
                <EthnoMap mediaPath="data/media/" imageData={parsedJSON} mapData={parsedJSON} />
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
        return {
            topZindex: 10
        }; //regions:null
    },
    componentDidMount: function() {

    },
    toggleOnClick: function(e){
        var self = this;
        console.log("this", self);
        var index = e.target.attributes['data-index'].value;
        var targetCanvas = document.getElementById("imageLayer_canvas_" + index);
        console.log("targetCanvas", targetCanvas);
        // CHECK VISIBLE --- determines if a given ethno map (parameter is a canvas element) has the custom CSS class visible
        // console.log("11111**************index", index);
        var checkOpacity = function(target){
            var opacity = getComputedStyle(target).getPropertyValue("opacity");
            // console.log("opacity", opacity);
            var visibleTrueFalse = $("#imageLayer_canvas_" + index).hasClass("visible");
            // console.log("visibleTrueFalse", visibleTrueFalse);
            var zIndex = getComputedStyle(target).getPropertyValue("z-index");
            // console.log("zIndex", zIndex);
            if(opacity === 0 || visibleTrueFalse === false){
                // console.log("makeVisible");
                var newzIndex = self.state.topZindex + 1;
                // console.log("newzIndex", newzIndex);
                self.setState({topZindex: newzIndex}, function(){console.log("self.state", self.state)});
                $("#imageLayer_canvas_" + index).addClass("visible");
                $("#imageLayer_canvas_" + index).css("opacity", "1");
                $("#imageLayer_canvas_" + index).css("zIndex", newzIndex);
            } else if (opacity === "1" && visibleTrueFalse === true){
                $("#imageLayer_canvas_" + index).removeClass("visible");
                $("#imageLayer_canvas_" + index).css("opacity", "0");
            }
            // console.log(opacity === "1" && visibleTrueFalse === true);
            // // //IF canvas is not visible --> make it visible (add CSS class visible)
            // if(visibleTrueFalse === false){
            //     $("#imageLayer_canvas_" + index).addClass("visible");
            //     var newZIndex = getComputedStyle(target).getPropertyValue("z-index");
            //     // Update state to set visible value to true
            //     //IF canvas is visible --> make it not visible (remove CSS class visible)
            // }
            // else if (visibleTrueFalse === true){
            //     $("#imageLayer_canvas_" + index).removeClass("visible");
            // }
        }
        checkOpacity(targetCanvas);
    },
    render: function () {
        var self = this;
        var mapData = self.props.mapData;
        // console.log("22222222**************index", index);
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
        return {imageLayersData:{},
            layerColl:[],
            lastHighlightedRegion:null,
            topZindex: 10
        };
    },
    componentDidMount: function() {
        // this.placeRegions();
    },
    componentWillMount: function() {

        //prep CultureQuestMap data from original JSON
        var self = this;
        console.log("self", self);
        var imageData = self.props.imageData;
        console.log("imageData", imageData);
        self.setState({
            areaWidth: "768",
            areaHeight: "504",
            imageColl: imageData.areas,
            backgroundImage: imageData.background,
            onLayersReady: self.onLayersReady,
            onRollover: self.onRegionRollover,
            onClick: self.onRegionClicked
        });

        //PageStore.addChangeListener(this._onChange);
    },
    onRegionClick: function(canvasElement) {
        if (canvasElement) console.log("Clicked on: " + canvasElement.getAttribute('id'));
    },
    onRegionRollover: function(canvasElement) {
        // console.log(self, "self");
        if(canvasElement !== null) {
            var canvasId = canvasElement.id;
            console.log("test", canvasId);
            var isVisible = $("#" + canvasId).hasClass("visible");
            if(isVisible === true){
                var zIndex = getComputedStyle(canvasElement).getPropertyValue("z-index");
                var newzIndex = this.state.topZindex + 1;
                this.setState({topZindex: newzIndex});
                console.log("SUCCESSS!!!!!");
                $("#" + canvasId).css("zIndex", newzIndex);
            }
        }
    },
    onLayersReady: function(x){
        console.log("x", x);
    },
    onRollover: function(e){
        // this.pixelTracker(e, "mousemove");
        console.log("self", self);
        console.log("this", this);
    },
    render: function() {
        var self = this;
        var backgroundImage = self.props.mapData.background;
        var mapData = self.props.mapData;
        var areaWidth = "768";
        var areaHeight = "504";
        var mapBackground = self.props.mediaPath + backgroundImage;
        var mapStyle = {background:"#000 url("+mapBackground+") no-repeat", width:"768px" , height:"504px"};
        var canvasColl = this.state.canvasColl;
        // var imageColl = mapData.areas;
        // console.log("imageColl", imageColl);
        return (
            <div>
                <div id="ethnoToggle">
                    <EthnoToggleDiv mapData = {mapData} canvasColl = {canvasColl}/>
                </div>
                <div id="ethnoMap" className="ethno-map" style={mapStyle} ref={(c) => self._mainMap = c}>
                </div>
                <EthnoMapLabels mapData = {mapData} className="ethno-labels"/>
                <ImageLayersView areaWidth = {this.state.areaWidth} areaHeight={this.state.areaHeight} imageColl={this.state.imageColl} backgroundImage={this.state.backgroundImage} onLayersReady={this.state.onLayersReady} onRollover={this.state.onRollover} onClick={this.state.onClick}/>
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