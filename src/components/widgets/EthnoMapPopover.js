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
            indexOfOverlayInfo: 0
        };
    },
    handleResize: function () {
        var backImageMarginLeft = $("#imageLayerView-back-image").css("margin-left");
        $("#ethnoOverlay").css("margin-left", backImageMarginLeft);
    },
    componentDidMount: function(){
        var self = this;
        console.log("INSIDE COMPONENT DID MOUNT");
        window.addEventListener("resize", self.handleResize);
        self.handleResize();
    },
    popoverPagesFunction: function(){
        var self = this;
        var popoverPages = [];

        for(var prop in self.props.mapData){
            if(self.props.mapData[prop]){
                if(prop !== "image") {
                    var propHolder = prop;
                    var propCapitalized = propHolder.charAt(0).toUpperCase() + propHolder.slice(1);
                    popoverPages.push([propCapitalized, self.props.mapData[prop]]);
                }
            }
        }

        return popoverPages;
    },
    toggle: function() {
        this.setState({ show: !this.state.show });
    },
    toggleParentStateAndResetIndexOfOverlayInfo: function(){
        var self = this;
        self.props.toggleParentPopoverState();
        self.setState({indexOfOverlayInfo: 0});
    },
    setStateIndexOfOverlayInfoPlusOne: function () {
        var self = this;
        var popoverPagesHolder = this.popoverPagesFunction();
        if(self.state.indexOfOverlayInfo < (popoverPagesHolder.length - 1) ) {
            self.setState({indexOfOverlayInfo: self.state.indexOfOverlayInfo + 1});
        }
    },
    setStateIndexOfOverlayInfoMinusOne: function () {
        var self = this;
        if(self.state.indexOfOverlayInfo > 0) {
            self.setState({indexOfOverlayInfo: self.state.indexOfOverlayInfo - 1});
        }
    },
    render: function() {
        var self = this;

        var style = {
            position: 'absolute',
            backgroundColor: '#EEE',
            boxShadow: '0 5px 10px rgba(0, 0, 0, 0.2)',
            border: '1px solid #CCC',
            borderRadius: 3,
            marginLeft: 5,
            marginTop: 5,
            padding: 5,
            zIndex: 999,
            top: 0,
            left: 0
        };

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
                <ReactBootstrap.Overlay show={this.props.showHide} onHide={function(){self.setState({show: false})}} container={this} >
                    <div id="ethnoOverlay" className="ethno-overlay-main-div">
                        <div className="ethno-overlay-title">
                            <strong>{self.props.mapData.label}</strong>
                            <button className="ethno-close-button-for-overlay btn btn-default" aria-label="Right Align" onClick={this.toggleParentStateAndResetIndexOfOverlayInfo}><span className="glyphicon glyphicon-remove"></span></button>
                        </div>
                        <div className="ethno-overlay-info">
                            <p className="ethno-overlay-info-title">{popoverPages[self.state.indexOfOverlayInfo][0]}</p>
                            <p className="ethno-overlay-info-text">{popoverPages[self.state.indexOfOverlayInfo][1]}</p>
                        </div>
                        <EthnoMapButtons disabledPrev={checkIfPrevButtonIsDisabled} disabledNext={checkIfNextButtonIsDisabled} onNextClick={self.setStateIndexOfOverlayInfoPlusOne} onPrevClick={self.setStateIndexOfOverlayInfoMinusOne} />
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
            <div>
                <button disabled={this.props.disabledPrev()} onClick={this.props.onPrevClick} className="btn btn-default ethno-overlay-prev-button"><span className="glyphicon glyphicon-chevron-left"></span></button>
                <button disabled={this.props.disabledNext()} onClick={this.props.onNextClick} className="btn btn-default ethno-overlay-next-button"><span className="glyphicon glyphicon-chevron-right"></span></button>
            </div>
        );
    }
});


module.exports = EthnoMapPopover;