/**
 * Created by omaramer on 5/13/16.
 */

var React = require('react');
var ImageLayersView = require('../../../widgets/ImageLayersView');

var CultureQuestMap = React.createClass({

    getInitialState: function() {

        return {imageLayersData:{},
                layerColl:[],
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
        this.setState({layersColl:layersColl});
    },

    onRegionClicked: function(canvasElement){

        if (canvasElement) console.log("Clicked on: " + canvasElement.getAttribute('id'));
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
            <ImageLayersView imageLayersData = {this.state.imageLayersData} >
            </ImageLayersView>

        );
    }
});

module.exports = CultureQuestMap;