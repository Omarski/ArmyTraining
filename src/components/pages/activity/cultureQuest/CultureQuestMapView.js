
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
    },

    componentDidUpdate: function(prevProps, prevState){
        this.updateLayersAccess();
    },

    onLayersReady:function(layersColl){

        //bubble up to parent comp
        this.props.onLayersReady(layersColl);
    },

    onRegionClicked: function(canvasElement){
        
        //bubble up
        if (canvasElement && !canvasElement.hidden) {
            this.props.onRegionClicked(canvasElement);
        }
    },

    onRegionRollover: function(canvasElement, pageX, pageY) {

            var self = this;
            var state = self.state;

            if (canvasElement && !canvasElement.hidden) {
                switch(canvasElement.state){

                    case "idle": case "last":
                        if (!canvasElement.classList.contains("image-layers-view-fade-in")){
                            canvasElement.classList.add("image-layers-view-fade-in");
                            canvasElement.classList.remove("image-layers-view-fade-out");
                            if (state.lastHighlightedRegion) {
                                state.lastHighlightedRegion.classList.remove("image-layers-view-fade-in");
                                if (!state.lastHighlightedRegion.classList.contains("image-layers-view-fade-out")){
                                    state.lastHighlightedRegion.classList.add("image-layers-view-fade-out");
                                }
                            }
                        }

                        state.lastHighlightedRegion = canvasElement;
                        break;
                }
            }else{

                if (state.lastHighlightedRegion && !state.lastHighlightedRegion.hidden &&
                    !state.lastHighlightedRegion.classList.contains("image-layers-view-fade-out")) {
                    state.lastHighlightedRegion.classList.remove("image-layers-view-fade-in");
                    state.lastHighlightedRegion.classList.add("image-layers-view-fade-out");
                    state.lastHighlightedRegion = null;
                }
            }
    },

    updateLayersAccess: function(){
        if (this.props.answersColl.length > 0){
            for (var i=0; i < this.props.layersColl.length; i++){
                if (this.props.answersColl[i].completed){
                    this.props.updateLayersColl(this.props.lastSelected, "attributeAdd", [{name:'state', value:"static"}]);
                    this.props.updateLayersColl(this.props.lastSelected, "classRemove", [{name:'image-layers-view-fade-out'}]);
                    this.props.updateLayersColl(this.props.lastSelected, "classAdd", [{name:'image-layers-view-fade-in'}]);
                }
            }

            this.state.lastHighlightedRegion = null;
        }

    },

    render: function() {

        return (
           
            <ImageLayersView

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