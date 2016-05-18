/**
 * Created by omaramer on 5/13/16.
 */

var React = require('react');
var ImageLayersView = require('../../../widgets/ImageLayersView');

var CultureQuestMap = React.createClass({

    getInitialState: function() {

        return {imageLayersData:{},
                lastHighlightedRegion:null
        };
    },

    componentWillMount: function() {

        //prep CultureQuestMap data from original JSON
        var self = this;
        var imageData = self.props.imageData;

        self.setState({imageLayersData:{

            areaWidth: imageData.regions[0].nearWidth,
            areaHeight: imageData.regions[0].nearHeight,
            imageColl: imageData.regions,
            backgroundImage: imageData.mapBackground,
            onLayersReady: self.onLayersReady,
            onRollover: self.onRegionRollover,
            onClick: self.onRegionClicked
        }});

        //PageStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {

        //PageStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        //PageStore.removeChangeListener(this._onChange);
    },

    onLayersReady:function(layersColl){

        //bubble up to parent comp
        this.props.onLayersReady(layersColl);
    },

    onRegionClicked: function(canvasElement){

        if (canvasElement) {
            this.props.onRegionClicked(canvasElement);
        }
    },

    onRegionRollover: function(canvasElement) {

        var self = this;
        var state = self.state;
        
        if (canvasElement) {

                    switch(canvasElement.state){

                        case "idle":
                            if (!canvasElement.classList.contains("imageLayerView-fade-in")){
                                canvasElement.classList.add("imageLayerView-fade-in");
                                canvasElement.classList.remove("imageLayerView-fade-out");
                                if (state.lastHighlightedRegion) {
                                    state.lastHighlightedRegion.classList.remove("imageLayerView-fade-in");
                                    if (!state.lastHighlightedRegion.classList.contains("imageLayerView-fade-out")){
                                        state.lastHighlightedRegion.classList.add("imageLayerView-fade-out");
                                    }
                                }
                            }

                            state.lastHighlightedRegion = canvasElement;
                            break;
                        }
                }else {

                    if (state.lastHighlightedRegion && !state.lastHighlightedRegion.classList.contains("imageLayerView-fade-out")) {
                        state.lastHighlightedRegion.classList.remove("imageLayerView-fade-in");
                        state.lastHighlightedRegion.classList.add("imageLayerView-fade-out");
                        state.lastHighlightedRegion = null;
                    }
        }

    },

    render: function() {

        return (
           
            <ImageLayersView className = {this.props.showQuiz ?
                                          "CultureQuestQuizView-killInteraction":""}

                areaWidth       = {this.state.imageLayersData.areaWidth}
                areaHeight      = {this.state.imageLayersData.areaHeight}
                imageColl       = {this.state.imageLayersData.imageColl}
                backgroundImage = {this.state.imageLayersData.backgroundImage}
                onLayersReady   = {this.state.imageLayersData.onLayersReady}
                onRollover      = {this.state.imageLayersData.onRollover}
                onClick         = {this.state.imageLayersData.onClick}

            >
            </ImageLayersView>

        );
    }
});

module.exports = CultureQuestMap;