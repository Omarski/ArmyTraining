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
var AppStateStore = require('../../../stores/AppStateStore');
var UnsupportedScreenSizeView = require('../../../components/UnsupportedScreenSizeView');
var NotificationActions = require('../../../actions/NotificationActions');
var LocalizationActions = require('../../../actions/LocalizationActions');



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
        // data.imageData = JSON.parse(Utils.findInfo(props.page.info, "builtEthnoMap"));


        // if(props.page.EthnoData){
        //     data.json = props.page.EthnoData;
        // } else {}

        data.json = JSON.parse(Utils.findInfo(props.page.info, "builtEthnoMap"));

    }

    return data;
}

/*INTERACTIVE ETHNOLINGUISTIC MAP VIEW ------ [[[EthnoMapView]]] <--- EthnoMap <--- ImageLayerView & EthnoToggleDiv */
var EthnoMapView = React.createClass({
    getInitialState: function() {

        var pageState = getPageState(this.props);
        return pageState;
    },
    componentWillMount: function(){
        var self = this;
    },
    componentDidMount: function() {
        var self = this
        AppStateStore.addChangeListener(this._onAppStateChange);

    },
    componentWillUnmount: function() {
        AppStateStore.removeChangeListener(this._onAppStateChange);
    },

    render: function() {
        var self = this;
        var page = self.state.page;
        var title = self.state.title;
        var sources = self.state.sources;
        var parsedJSON = self.state.json;

        var backgroundImageURL = "data/media/" + parsedJSON.background;
        var areaWidth = "768";
        var areaHeight = "504";
        var imageColl = parsedJSON.areas;
        var backgroundImage = "";


        if (AppStateStore.isMobile()) {
            return (<UnsupportedScreenSizeView/>);
        }


        return (
            <div>
                <div className="" key={"page-" + this.state.page.xid}>
                    <PageHeader sources={sources} title={title} key={page.xid}/>
                </div>
                <EthnoMap mediaPath="data/media/" imageData={parsedJSON} mapData={parsedJSON} />
            </div>
        );
    },

    _onAppStateChange: function () {
        if (AppStateStore.renderChange()) {
            this.setState(getPageState(this.props));
        }
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
            popoverShow: false,
            quadrant: 0,
            currentPopoverSlide: 0
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
    onRegionClick: function(canvasElement, xVal, yVal) {
        var self = this;


        var visibleOrNot = $(canvasElement).hasClass("ethno-visible");
        // if you clicked on a region and that region is visible
        if(canvasElement !== null) {

            var quadrant = 0;

            var findQuandrant = function(x, y){
                var side = "";
                var level = "";
                // is the click on the left side or right side?
                if ((768 - x) > 384){
                    side = "left";
                } else {
                    side = "right";
                }

                // is the click on the top or the bottom?
                var level = "";
                if((504 - y) > 252){
                    level = "top"
                } else {
                    level = "bottom"
                }

                if (side === "left" && level ==="top"){quadrant = 4;}
                if (side === "right" && level ==="top"){quadrant = 3;}
                if (side === "left" && level ==="bottom"){quadrant = 2;}
                if (side === "right" && level ==="bottom"){quadrant = 1;}

            }

            findQuandrant(xVal,yVal);


            var lastTwo = canvasElement.getAttribute('id').slice(-2);
            var canvasId = "";

            if(lastTwo.charAt(0) === "_"){
                canvasId = lastTwo.charAt(1);
            } else if (lastTwo.charAt(0) !== "_"){
                canvasId = lastTwo;
            }

            canvasId = Number(canvasId);

            if(!visibleOrNot){
                $("#ethno-checkbox-" + canvasId).trigger("click");
            }



            //If there is not currently a popover, render popover
            if(self.state.popoverShow === false) {
                self.setState({popoverIndex: canvasId, popoverShow: true, quadrant: quadrant, currentPopoverSlide: 0});
            }//If there is currently a popover...
            else if(self.state.popoverShow === true) {
                // and if that popover is the same as the region that user just clicked on
                if(self.state.popoverIndex === canvasId){
                    //remove the popover
                    self.setState({popoverShow: false});
                    // if the region clicked is a different region; update the popover to new region
                } else {
                    self.setState({popoverShow: true, popoverIndex: canvasId, quadrant: quadrant, currentPopoverSlide: 0 });
                }
            }
        }

        //if you clicked on a region and that region is not visible
        if(canvasElement === null){
            // INSIDE CANVAS ELEMENT IS NULL!!!:", canvasElement
            self.setState({popoverShow: false});
        }

    },
    onRegionRollover: function(canvasElement, x, y, pageX, pageY, invisible) {
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
            var toolTipWidth = ($("#toolTipperId").width() / 2);
            toolTipper.style.top = (y - 40) + 'px';
            toolTipper.style.left = (pageX - toolTipWidth ) + 'px';
            toolTipper.style.zIndex = self.state.topZindex + 20;
    },
    togglePopoverShow: function (){
        var self = this;
        self.setState({popoverShow: !self.state.popoverShow, currentPopoverSlide: 0});
    },
    onLayersReady: function(x){
        $("#toolTipperId").addClass("ethno-not-visible");
    },
    nextPopoverSlide: function(){
        var self = this;
        self.setState({currentPopoverSlide: self.state.currentPopoverSlide + 1});
    },
    previousPopoverSlide: function(){
        var self = this;
        self.setState({currentPopoverSlide: self.state.currentPopoverSlide - 1});
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
        var popoverInRender = popoverFunction(mapData.areas[self.state.popoverIndex], self.state.popoverShow, self.togglePopoverShow, self.state.quadrant, self.state.currentPopoverSlide, self.nextPopoverSlide, self.previousPopoverSlide);

        var popoverMapData = mapData.areas[self.state.popoverIndex];
        var popoverShowHide = self.state.popoverShow;
        var toggleParentPopoverState = self.togglePopoverShow;

        return (
            <div className="ethno-map-container">
                {toolTipperInRender}
                <div id="wrapperDiv"  className = "ethno-wrapper-div">
                    {popoverInRender}
                    <EthnoLayersView className="ethno-image-layers-view col-sm-12 col-md-10" topZIndex = {self.state.topZindex} areaWidth = {this.state.areaWidth} areaHeight={this.state.areaHeight} imageColl={this.state.imageColl} backgroundImage={this.state.backgroundImage} onLayersReady={this.state.onLayersReady} onRollover={this.state.onRollover} onClick={this.state.onClick} />
                    <EthnoToggleDiv id="ethnoToggle" className="col-xs-3 col-sm-2 col-md-2" mapData = {mapData} topZIndex={self.state.topZindex} changeLabelState = {this.changeLabelState} whatIsLabelState ={this.whatIsLabelState} canvasColl = {canvasColl} popoverShow={this.state.popoverShow} toggleParentPopoverState={toggleParentPopoverState} />
                </div>
            </div>
        );
    }
});

/*ETHNO MAP TOGGLE MENU ------ EthnoMapView <--- EthnoMap <--- ImageLayerView & [[[EthnoToggleDiv]]] */
var EthnoToggleDiv = React.createClass({
    getInitialState: function() {
        return {
            regionColors: ["#F49AC0", null, "#5E3A54", null,"#7B7ABC", null,"#2A7169",null, "#8DD883",null, "#2A3761",null, "#742753", null,"#374428", null,"#BF3C28", null,"#E68E4E", null,"#965F27", null,"#61764B", null,"#770026",null, "#B03A3A", null,"#9C9638", null,"#72250E"],
            checkboxColors: ["transparent", null, "transparent", null,"#transparent", null,"#transparent",null, "#transparent",null, "#transparent",null, "#transparent", null,"#transparent", null,"#transparent", null,"transparent", null,"transparent", null,"transparent", null,"transparent",null, "transparent", null,"transparent", null,"transparent"]
        };
    },
    toggleOnClick: function(e){
        var self = this;

        var index = e.target.attributes['data-index'].value;
        var targetCanvas = document.getElementById("imageLayer_canvas_" + index);


        // CHECK VISIBLE --- determines if a given ethno map (parameter is a canvas element) has the custom CSS class visible
        var checkOpacity = function(target){
            var opacity = getComputedStyle(target).getPropertyValue("opacity");
            var visibleTrueFalse = $("#imageLayer_canvas_" + index).hasClass("ethno-visible");
            var zIndex = getComputedStyle(target).getPropertyValue("z-index");
            if(opacity === 0 || visibleTrueFalse === false){
                var newzIndex = self.props.topZIndex + 1;
                // self.setState({topZindex: newzIndex});
                $("#imageLayer_canvas_" + index).addClass("ethno-visible");
                $("#imageLayer_canvas_" + index).css("opacity", "0.8");
                $("#imageLayer_canvas_" + index).css("zIndex", newzIndex);
                $("#ethno-toggle-name-" + index).css("color", self.state.regionColors[index]);
                $("#ethno-checkbox-"+index).css("backgroundColor", self.state.regionColors[index]);

                if(self.props.popoverShow){self.props.toggleParentPopoverState()}

                var numIndex = Number(index);

                for(var i = 1; i < self.props.mapData.areas.length; i += 2){
                    if (i !== numIndex + 1) {
                        var opacityLevel = $("#imageLayer_canvas_" + i).css("opacity");
                        if(opacityLevel === "0.8") {
                            $("#imageLayer_canvas_" + i).removeClass("ethno-visible");
                            $("#imageLayer_canvas_" + i).addClass("ethno-not-visible");
                        }
                    } else if (i === numIndex + 1) {
                        var targetElement = document.getElementById("imageLayer_canvas_" + i);
                        $("#imageLayer_canvas_" + i).removeClass("ethno-not-visible");
                        $("#imageLayer_canvas_" + i).addClass("ethno-visible");
                        $("#imageLayer_canvas_" + i).css("zIndex", self.props.topZIndex + 19);
                    }
                }
            } else if (opacity === "0.8" && visibleTrueFalse === true){
                $("#ethno-toggle-name-" + index).css("color", "black");
                $("#ethno-checkbox-"+index).css("backgroundColor", "transparent");
                $("#imageLayer_canvas_" + index).removeClass("ethno-visible");
                $("#imageLayer_canvas_" + index).css("opacity", "0");
                $("#imageLayer_canvas_" + (Number(index) + 1)).removeClass("ethno-visible");
                $("#imageLayer_canvas_" + (Number(index) + 1)).addClass("ethno-not-visible");
                if(self.props.popoverShow){self.props.toggleParentPopoverState()}
                // if overlay is presesnt
                //if popover is set to the menu item (aka region) that is being clicked off
                // if(){
                //     // remove the popover
                // }
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
            //if this region is showing --> change the fakeCheckboxColor


            if($("#imageLayer_canvas_" + i).hasClass("ethno-visible")){
                var fakeCheckboxColor = {backgroundColor: self.state.regionColors[i]};
            } else if (!$("#imageLayer_canvas_" + i).hasClass("ethno-visible")) {
                var fakeCheckboxColor = {backgroundColor: "transparent"};
            }

            toggleElements.push(
                <div key={"checkboxDiv" + i} className="checkbox">
                    <label onClick = {self.toggleOnClick}>
                        <div id={"ethno-checkbox-" + i} data-region = {region.label} data-index={i} className="ethno-fake-checkbox" style={fakeCheckboxColor} ></div>
                        <div className="ethno-region-name-span" id={"ethno-toggle-name-" + i} data-index={i}>{region.label + " "} </div>
                    </label>
                </div>
                );
        }


        return (
            <form className="well ethno-sidebar-form">
                    <div className="ethno-instruction-text">Click on the highlighted areas of the map to explore.</div>
                {toggleElements}
            </form>
        );
    }
});

function popoverFunction(mapDataArgument, popoverShowHide, popoverSetter, quadrant, currentPopoverSlide, nextSlide, prevSlide){
    var mapData = mapDataArgument, showHide = popoverShowHide, toggleParentPopoverState = popoverSetter, currentPopoverIndex = currentPopoverSlide, parentPopoverNext = nextSlide, parentPopoverPrevious = prevSlide;
    return (<EthnoMapPopover className="ethno-map-popover-style-scrollbar" mapData={mapData} showHide={showHide} quadrant={quadrant} toggleParentPopoverState={toggleParentPopoverState} currentPopoverIndex={currentPopoverIndex} parentPopoverNext={parentPopoverNext} parentPopoverPrevious={parentPopoverPrevious}/>);
}


function toolTipper(region, x, y){

    var xVal = x;
    var yVal = y;
    var regionName = region;
    var mouseX;
    var mouseY;

    return (<div>
        <ReactBootstrap.Tooltip id="toolTipperId"  placement="top" className="in ethno-not-visible">{regionName}</ReactBootstrap.Tooltip>
    </div>);
}

module.exports = EthnoMapView;