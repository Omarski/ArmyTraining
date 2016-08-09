
var React = require('react');

var PropTypes = React.PropTypes;

var ClickDropPuzzleView = React.createClass({

    getInitialState: function() {

        return {
            mediaPath: 'data/media/',
            renderedDraggableColl:[],
            renderedDropTargetsColl:[]
        };
    },

    propTypes: {

        stageStyle: PropTypes.object,
        draggableColl: PropTypes.array.isRequired,
        targetsColl: PropTypes.array.isRequired,
        draggableOnStyle: PropTypes.object.isRequired,
        targetOnStyle: PropTypes.object.isRequired,
        stageTargetObj: PropTypes.object,
        onDraggableClick: PropTypes.func,
        onDraggableDrop: PropTypes.func.isRequired,
        onPuzzleReady: PropTypes.func,
    },

    renderDraggableColl: function(){

        var self = this;
        var draggableCollRender = self.props.draggableColl.map(function(itemObj,index){

            return (

                <div key={index}
                    id = {itemObj.id}
                    style={itemObj.draggableStyle}
                    onClick={self.onDraggableClick}
                ></div>
            )
        });

        self.state.renderedDraggableColl = draggableCollRender;
        return draggableCollRender;
    },

    renderDropTargetColl: function(){

        var self = this;
        var dropTargetsRender = self.props.targetsColl.map(function(itemObj,index){

            return (

                <div key={index}
                     id = {itemObj.id}
                     style={itemObj.draggableStyle}
                     onClick={self.onTargetClick}
                ></div>
            )
        });

        self.state.renderedDropTargetsColl = dropTargetsRender;
        self.props.onPuzzleReady(self.state.renderedDraggableColl,self.state.renderedDropTargetsColl);
        
        return dropTargetsRender;
    },

    onDraggableClick: function(e){
        console.log("Draggable clicked...");
    },

    onTargetClick: function(e){
        console.log("Target clicked...");
    },

    render: function() {

        var self = this;

        return (
            <div style={this.props.stageStyle} id="DnDStage">
                {this.renderDraggableColl()}
                {this.renderDropTargetColl()}
            </div>
        )
    }
});

module.exports = ClickDropPuzzleView;