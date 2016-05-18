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

/*INTERACTIVE ETHNOLINGUISTIC MAP VIEW ------ [[[EthnoMapView]]] <--- EthnoMap <--- ImageLayerView & EthnoToggleDiv */
var EthnoMapView = React.createClass({
    getInitialState: function() {
        var pageState = getPageState(this.props);
        return pageState;
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
    _onChange: function() {
        this.setState(getPageState(this.props));
    }
});

/*ETHNO MAP  ------ EthnoMapView <--- [[[EthnoMap]]] <--- ImageLayerView & EthnoToggleDiv */
var EthnoMap = React.createClass({
    getInitialState: function() {
        return {imageLayersData:{},
            layerColl:[],
            lastHighlightedRegion:null,
            topZindex: 10
        };
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
    },
    onRegionClick: function(canvasElement) {
        if (canvasElement) console.log("Clicked on: " + canvasElement.getAttribute('id'));
    },
    onRegionRollover: function(canvasElement) {
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
        // console.log("x", x);
        // console.log("this.props", this.props);

        var canvasNames = [];
        this.props.mapData.areas.map(function(region, index){
            canvasNames.push(region.label);
        })
        console.log("canvasNames", canvasNames);
        x.map(function(item, i){
            console.log("item", item, "i", i);
            var canvas = document.getElementById("imageLayer_canvas_" + i);
            console.log("canvas", canvas);
            var ctx = canvas.getContext("2d");
            ctx.font = "30px Arial";
            ctx.fillStyle = "Red";
            ctx.strokeText(canvasNames[i], 100, 180);
        });
    },
    placeLabels: function(label){
        document.getElementById("imageLayerView-back-image").appendChild(label);
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
        return (
            <div>
                <div id="ethnoToggle">
                    <EthnoToggleDiv mapData = {mapData} canvasColl = {canvasColl}/>
                </div>
                <ImageLayersView areaWidth = {this.state.areaWidth} areaHeight={this.state.areaHeight} imageColl={this.state.imageColl} backgroundImage={this.state.backgroundImage} onLayersReady={this.state.onLayersReady} onRollover={this.state.onRollover} onClick={this.state.onClick}/>
                <EthnoMapLabels mapData = {mapData} className="ethno-labels"/>
            </div>
        );
    }
});

/*ETHNO MAP TOGGLE MENU ------ EthnoMapView <--- EthnoMap <--- ImageLayerView & [[[EthnoToggleDiv]]] */
var EthnoToggleDiv = React.createClass({
    getInitialState: function() {
        return {
            topZindex: 10
        };
    },
    toggleOnClick: function(e){
        var self = this;
        console.log("this", self);
        var index = e.target.attributes['data-index'].value;
        var targetCanvas = document.getElementById("imageLayer_canvas_" + index);
        console.log("targetCanvas", targetCanvas);
        // CHECK VISIBLE --- determines if a given ethno map (parameter is a canvas element) has the custom CSS class visible
        var checkOpacity = function(target){
            var opacity = getComputedStyle(target).getPropertyValue("opacity");
            var visibleTrueFalse = $("#imageLayer_canvas_" + index).hasClass("visible");
            var zIndex = getComputedStyle(target).getPropertyValue("z-index");
            if(opacity === 0 || visibleTrueFalse === false){
                var newzIndex = self.state.topZindex + 1;
                self.setState({topZindex: newzIndex}, function(){console.log("self.state", self.state)});
                $("#imageLayer_canvas_" + index).addClass("visible");
                $("#imageLayer_canvas_" + index).css("opacity", "1");
                $("#imageLayer_canvas_" + index).css("zIndex", newzIndex);
            } else if (opacity === "1" && visibleTrueFalse === true){
                $("#imageLayer_canvas_" + index).removeClass("visible");
                $("#imageLayer_canvas_" + index).css("opacity", "0");
            }
        };
        checkOpacity(targetCanvas);
    },
    render: function () {
        var self = this;
        var mapData = self.props.mapData;
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
    render: function(){
        var mapData = this.props.mapData;
        return (
            <div>
            {mapData.areas.map(function(region, i){
                return (
                  <div>
                      <p id={"#ethnoMapCanvas_" + i + "_text"} className="labels">{mapData.areas[i].label}</p>
                  </div>
                    );
                })
            }
            </div>
        );
    }
});


module.exports = EthnoMapView;