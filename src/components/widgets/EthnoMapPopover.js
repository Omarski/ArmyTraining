/*
 * Created by David on 5/24/16.
 * This widget is the popover of info for the ethnoMap
 */

var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var EthnoMapPopover = React.createClass({
    getInitialState: function() {
        return {
            show: true,
            showChanged: false,
            parentShow: this.props.showHide,
            popoverQuadrant: this.props.quadrant
        };
    },
    handleResize: function () {
        var backImageMarginLeft = $("#imageLayerView-back-image").css("margin-left");
        $("#ethnoOverlay").css("margin-left", backImageMarginLeft);
    },
    componentDidMount: function(){
        var self = this;
        window.addEventListener("resize", self.handleResize);
        self.handleResize();
    },
    componentWillMount: function(){

    },
    popoverPagesFunction: function(){
        var self = this;
        var popoverPages = [];



            if(self.props.mapData["population"]) {
                popoverPages.push(["Population", self.props.mapData["population"]]);
            }
            if(self.props.mapData["location"]){
                popoverPages.push(["Location", self.props.mapData["location"]]);
            }
            if(self.props.mapData["language"]){
                popoverPages.push(["Language", self.props.mapData["language"]]);
            }
            if(self.props.mapData["summary"]){
                popoverPages.push(["Background", self.props.mapData["summary"]]);
            }
            if(self.props.mapData["religion"]){
                popoverPages.push(["Religion", self.props.mapData["religion"]]);
            }
            if(self.props.mapData["politics"]){
                popoverPages.push(["Livelihood", self.props.mapData["politics"]]);
            }
            if(self.props.mapData["society"]){
                popoverPages.push(["Society", self.props.mapData["society"]]);
            }

            /*
            This is a for in loop for if there is no desired order for the sections of popover information
            if(!popoverPages[0]) {
                for (var prop in self.props.mapData) {
                    if (self.props.mapData[prop]) {
                        if (prop !== "image" && prop !== "label") {
                            var propHolder = prop;
                            var propCapitalized = propHolder.charAt(0).toUpperCase() + propHolder.slice(1);
                            popoverPages.push([propCapitalized, self.props.mapData[prop]]);
                        }
                    }
                }
            }
            */

        return popoverPages;
    },
    toggle: function() {
        this.setState({ show: !this.state.show });
    },
    toggleParentStateAndResetIndexOfOverlayInfoandResetMoreLessInfo: function(){
        var self = this;
        self.props.toggleParentPopoverState();
        // self.setState({indexOfOverlayInfo: 0});
    },
    setStateIndexOfOverlayInfoPlusOne: function () {
        var self = this;
        var popoverPagesHolder = this.popoverPagesFunction();

        // console.log("self.props.indexOfOverlay", self.props.indexOfOverlay);
        // console.log("self.props", self.props);

        //console.log("self.props.currentPopoverIndex", self.props.currentPopoverIndex);

        if(self.props.currentPopoverIndex < (popoverPagesHolder.length - 1) ) {
            self.props.parentPopoverNext();
        }
    },
    setStateIndexOfOverlayInfoMinusOne: function () {
        var self = this;
        if(self.props.currentPopoverIndex > 0) {
            self.props.parentPopoverPrevious();
        }
    },
    render: function() {
        var self = this;

        // var style = {
        //     position: 'absolute',
        //     backgroundColor: '#EEE',
        //     boxShadow: '0 5px 10px rgba(0, 0, 0, 0.2)',
        //     border: '1px solid #CCC',
        //     borderRadius: 3,
        //     marginLeft: 5,
        //     marginTop: 5,
        //     padding: 5,
        //     zIndex: 999
        // };

        //console.log("quadrant", self.props.quadrant);

        var style = {};

        if(self.props.quadrant === 1){
            style = {marginTop: 5, marginLeft: 5};
        } else if (self.props.quadrant === 2){
            style = {marginTop: 5 , marginLeft: 379};
        } else if (self.props.quadrant === 3){
            style = {marginTop: 319, marginLeft: 5};
        } else if (self.props.quadrant === 4){
            style = {marginTop: 319, marginLeft: 379};
        } else {
            //console.log("ERROR!!!");
        }

        //console.log("style", style);

        var checkIfPrevButtonIsDisabled = function(){
            if(self.state.indexOfOverlayInfo === 0){
                return true;
            } else {
                return false;
            }
        }

        var popoverPages = self.popoverPagesFunction();

        var checkIfNextButtonIsDisabled = function(){
            if(self.state.indexOfOverlayInfo ===  (popoverPages.length - 1)){
                return true;
            } else {
                return false;
            }
        }

            return (
                <div>
                    <ReactBootstrap.Overlay show={this.props.showHide} onHide={function(){self.setState({show: false})}} container={this}>
                        <div id="ethnoOverlay" className="ethno-overlay-main-div" style={style}>
                            <div className="ethno-overlay-title">
                                <ul className="ethno-overlay-ul">
                                    <li className="ethno-overlay-li">
                                        <strong className="ethno-overlay-title-text">{self.props.mapData.label}</strong>
                                    </li>
                                    <li className="ethno-overlay-li">
                                        <button className="ethno-close-button-for-overlay btn btn-default"
                                                aria-label="Right Align"
                                                onClick={this.toggleParentStateAndResetIndexOfOverlayInfoandResetMoreLessInfo}><span
                                            className="glyphicon glyphicon-remove"></span></button>
                                    </li>
                                </ul>
                            </div>
                            <div className="ethno-overlay-info">
                                <p className="ethno-overlay-info-title">{popoverPages[self.props.currentPopoverIndex][0]}</p>
                                <p className="ethno-overlay-info-text">{popoverPages[self.props.currentPopoverIndex][1]}</p>
                            </div>
                            <EthnoMapButtons disabledPrev={checkIfPrevButtonIsDisabled}
                                             disabledNext={checkIfNextButtonIsDisabled}
                                             onNextClick={self.setStateIndexOfOverlayInfoPlusOne}
                                             onPrevClick={self.setStateIndexOfOverlayInfoMinusOne}/>
                        </div>
                    </ReactBootstrap.Overlay>
                </div>
            );
    },
    _onChange: function() {
        this.setState(getSettingsState());
    }
});


var EthnoMapButtons = React.createClass({

    render: function(){
        return(
            <div className="ethno-overlay-button-container">
                <button disabled={this.props.disabledPrev()} onClick={this.props.onPrevClick} className="btn btn-default ethno-overlay-prev-button"><span className="glyphicon glyphicon-chevron-left"></span></button>
                <button disabled={this.props.disabledNext()} onClick={this.props.onNextClick} className="btn btn-default ethno-overlay-next-button"><span className="glyphicon glyphicon-chevron-right"></span></button>
            </div>
        );
    }
});


module.exports = EthnoMapPopover;