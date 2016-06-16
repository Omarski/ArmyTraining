/**
 * Created by Alec on 3/2/2016.
 * Taken over by David on 5/10/16
 */
var React = require('react');
var PageStore = require('../../../stores/PageStore');
var ReactBootstrap = require('react-bootstrap');
var PageHeader = require('../../widgets/PageHeader');
var EthnoLayersView = require("../../widgets/EthnoLayersView");
var EthnoMapPopover = require("../../widgets/EthnoMapPopover");
var Utils = require("../../widgets/Utils");


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

        // Because the prebuild sends the data in a random order, the below line may not work
        // data.imageData = JSON.parse(props.page.info.property[2].value);
        // this uses a Util function to get the correct data if the name "builtEthnoMap" exists
        data.imageData = JSON.parse(Utils.findInfo(props.page.info, "builtEthnoMap"));



        if(props.page.EthnoData){
            data.json = props.page.EthnoData;
        } else {
            data.json = JSON.parse(Utils.findInfo(props.page.info, "builtEthnoMap"));
        }
    }

    return data;
}

/*INTERACTIVE ETHNOLINGUISTIC MAP VIEW ------ [[[EthnoMapView]]] <--- EthnoMap <--- ImageLayerView & EthnoToggleDiv */
var EthnoMapView = React.createClass({
    getInitialState: function() {
        var pageState = getPageState(this.props);
        console.log("this.props", this.props);
        return pageState;
    },
    onLayersReady: function(x){
    },
    render: function() {
        var self = this;
        var page = self.state.page;
        var title = self.state.title;
        var sources = self.state.sources;
        var parsedJSON = JSON.parse(Utils.findInfo(self.props.page.info, "builtEthnoMap"));

        var backgroundImageURL = "data/media/" + parsedJSON.background;
        var areaWidth = "768";
        var areaHeight = "504";
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
            topZindex: 10,
            toolTipText: "",
            popoverIndex: 1,
            popoverShow: false
        };
    },
    componentWillMount: function() {
        //prep CultureQuestMap data from original JSON
        var self = this;
        var imageData = self.props.imageData;
        self.setState({
            areaWidth: "768",
            areaHeight: "504",
            imageColl: imageData.areas,
            backgroundImage: imageData.background,
            onLayersReady: self.onLayersReady,
            onRollover: self.onRegionRollover,
            onClick: self.onRegionClick,
            showHilightedRegion: self.showHilightedRegion
        });
    },
    onRegionClick: function(canvasElement) {
        var self = this;
        if(canvasElement !== null) {

            var lastTwo = canvasElement.getAttribute('id').slice(-2);
            var canvasId = "";

            if(lastTwo.charAt(0) === "_"){
                canvasId = lastTwo.charAt(1);
            } else if (lastTwo.charAt(0) !== "_"){
                canvasId = lastTwo;
            }

        }

        if(self.state.popoverShow === false) {
            self.setState({popoverIndex: [canvasId], popoverShow: true});
        }

    },
    onRegionRollover: function(canvasElement, x, y, pageX) {
        var self = this;
        if(canvasElement !== null) {
            var canvasId = canvasElement.id;
            var isVisible = $("#" + canvasId).hasClass("ethno-visible");
            if(isVisible === true) {
                var zIndex = getComputedStyle(canvasElement).getPropertyValue("z-index");
                var newzIndex = this.state.topZindex + 1;
                self.setState({topZindex: newzIndex});
                $("#" + canvasId).css("zIndex", newzIndex);
            }
        }

        var toolTipper = document.getElementById("toolTipperId");

        if(canvasElement !== null) {
            $("#toolTipperId").removeClass("ethno-not-visible");

            var lastTwo = canvasElement.getAttribute('id').slice(-2);
            var canvasIdTwo = "";

            if(lastTwo.charAt(0) === "_"){
                canvasIdTwo = lastTwo.charAt(1);
            } else if (lastTwo.charAt(0) !== "_"){
                canvasIdTwo = lastTwo;
            }

            var regionNameToolTip = self.props.mapData.areas[canvasIdTwo].label;
            self.setState({toolTipText: regionNameToolTip});
        }

        if(canvasElement === null){
            $("#toolTipperId").addClass("ethno-not-visible");
        }

        var toolTipper = document.getElementById("toolTipperId");
        var xValue = event.clientX;
        var yValue = event.clientY;

        var toolTipWidth = ($("#toolTipperId").width() / 2) ;
        // console.log("toolTipWidth", toolTipWidth);

        toolTipper.style.top = (y - 40) + 'px';
        toolTipper.style.left = (pageX - toolTipWidth - 15) + 'px';
        toolTipper.style.zIndex = self.state.topZindex + 20;
    },
    togglePopoverShow: function (){
        var self = this;
        self.setState({popoverShow: !self.state.popoverShow});
    },
    onLayersReady: function(x){
        $("#toolTipperId").addClass("ethno-not-visible");
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
        var toolTipperInRender = toolTipper(self.state.toolTipText);
        var popoverInRender = popoverFunction(mapData.areas[self.state.popoverIndex], self.state.popoverShow, self.togglePopoverShow);

        var popoverMapData = mapData.areas[self.state.popoverIndex];
        var popoverShowHide = self.state.popoverShow;
        var toggleParentPopoverState = self.togglePopoverShow;

        return (
            <div className="ethno-map-container">
                {toolTipperInRender}
                <div id="wrapperDiv"  className = "container ethno-wrapper-div">
                    {popoverInRender}
                    <EthnoLayersView className="ethno-image-layers-view" topZIndex = {self.state.topZindex} areaWidth = {this.state.areaWidth} areaHeight={this.state.areaHeight} imageColl={this.state.imageColl} backgroundImage={this.state.backgroundImage} onLayersReady={this.state.onLayersReady} onRollover={this.state.onRollover} onClick={this.state.onClick} />
                    <EthnoToggleDiv id="ethnoToggle" mapData = {mapData} changeLabelState = {this.changeLabelState} whatIsLabelState ={this.whatIsLabelState} canvasColl = {canvasColl}/>
                </div>
            </div>
        );
    }
});

/*ETHNO MAP TOGGLE MENU ------ EthnoMapView <--- EthnoMap <--- ImageLayerView & [[[EthnoToggleDiv]]] */
var EthnoToggleDiv = React.createClass({
    getInitialState: function() {
        return {
            topZindex: 10,
            regionColors: ["#F49AC0", null, "#5E3A54", null,"#7B7ABC", null,"#2A7169",null, "#8DD883",null, "#2A3761",null, "#742753", null,"#374428", null,"#BF3C28", null,"#E68E4E", null,"#965F27", null,"#61764B", null,"#770026",null, "#B03A3A", null,"#9C9638", null,"#72250E"]
        };
    },
    toggleOnClick: function(e){

        console.log("e", e);
        var self = this;
        var index = e.target.attributes['data-index'].value;
        var targetCanvas = document.getElementById("imageLayer_canvas_" + index);
        // CHECK VISIBLE --- determines if a given ethno map (parameter is a canvas element) has the custom CSS class visible
        var checkOpacity = function(target){
            var opacity = getComputedStyle(target).getPropertyValue("opacity");
            var visibleTrueFalse = $("#imageLayer_canvas_" + index).hasClass("ethno-visible");
            var zIndex = getComputedStyle(target).getPropertyValue("z-index");
            if(opacity === 0 || visibleTrueFalse === false){
                var newzIndex = self.state.topZindex + 1;
                self.setState({topZindex: newzIndex});
                $("#imageLayer_canvas_" + index).addClass("ethno-visible");
                $("#imageLayer_canvas_" + index).css("opacity", "1");
                $("#imageLayer_canvas_" + index).css("zIndex", newzIndex);
                $("#ethno-toggle-name-" + index).css("color", self.state.regionColors[index]);


                console.log("index + 1", index + 1);
                var numIndex = Number(index);

                console.log("self.props", self.props.mapData.areas.length);

                for(var i = 1; i < self.props.mapData.areas.length; i += 2){
                    if (i !== numIndex + 1) {
                        var opacityLevel = $("#imageLayer_canvas_" + i).css("opacity");
                        if(opacityLevel === "1") {
                            console.log("INDSIDE FIRST ONE");
                            $("#imageLayer_canvas_" + i).removeClass("ethno-visible");
                            $("#imageLayer_canvas_" + i).addClass("ethno-not-visible");
                        }
                    } else if (i === numIndex + 1) {
                        console.log("INSIDE", i);
                        $("#imageLayer_canvas_" + i).removeClass("ethno-not-visible");
                        $("#imageLayer_canvas_" + i).addClass("ethno-visible");
                        $("#imageLayer_canvas_" + i).css("zIndex", self.state.topZindex + 19);
                    }
                }
            } else if (opacity === "1" && visibleTrueFalse === true){
                $("#ethno-toggle-name-" + index).css("color", "black");
                $("#imageLayer_canvas_" + index).removeClass("ethno-visible");
                $("#imageLayer_canvas_" + index).css("opacity", "0");
                $("#imageLayer_canvas_" + (Number(index) + 1)).removeClass("ethno-visible");
                $("#imageLayer_canvas_" + (Number(index) + 1)).addClass("ethno-not-visible");
            }
        };
        checkOpacity(targetCanvas);
    },
    render: function () {
        var self = this;
        var mapData = self.props.mapData;


        var toggleElements = [];
        for(var i = 0; i < mapData.areas.length; i = i + 2){
            var region = mapData.areas[i];
            toggleElements.push(
                <div className="checkbox">
                    <label>
                        <input type="checkbox" data-region = {region.label} data-index={i} onClick = {self.toggleOnClick} />
                        <span id={"ethno-toggle-name-" + i}>{region.label + " "} </span>
                    </label>
                </div>
                );
        }


        return (
            <form className="well ethno-sidebar-form">
                {toggleElements}
            </form>
        );
    }
});

function popoverFunction(mapDataArgument, popoverShowHide, popoverSetter){
    var mapData = mapDataArgument;
    var showHide = popoverShowHide;
    var toggleParentPopoverState = popoverSetter;
    return (<EthnoMapPopover mapData={mapData} showHide={showHide} toggleParentPopoverState={toggleParentPopoverState}/>);
}


function toolTipper(region, x, y){

    var xVal = x;
    var yVal = y;
    var regionName = region;
    var mouseX;
    var mouseY;

    return (<div>
        <ReactBootstrap.Tooltip id="toolTipperId"  placement="top" className="in">{regionName}</ReactBootstrap.Tooltip>
    </div>);
}

module.exports = EthnoMapView;