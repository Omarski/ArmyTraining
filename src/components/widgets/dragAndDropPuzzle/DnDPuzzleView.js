
var React = require('react');

var PropTypes = React.PropTypes;

var DnDPuzzleDraggable = require('./DnDPuzzleDraggable');
var DnDPuzzleDropTarget = require('./DnDPuzzleDropTarget');

var DnDPuzzleView = React.createClass({

    getInitialState: function() {

        return {
            mediaPath: 'data/media/',
            renderedDraggableColl:[],
            renderedDropTargetsColl:[]
        };
    },

    propTypes: {

        stageStyle: PropTypes.object.isRequired,
        draggableColl: PropTypes.array.isRequired,
        targetsColl: PropTypes.array.isRequired,
        onDraggableBeginDrag: PropTypes.func,
        onDraggableEndDrag: PropTypes.func.isRequired,
        draggableCanDragCond: PropTypes.func,
        onTargetDrop:  PropTypes.func.isRequired,
        onTargetHover: PropTypes.func,
        targetCanDropCond: PropTypes.func,
        onPuzzleReady: PropTypes.func
    },

    renderDraggableColl: function(){

        var self = this;
        var draggableCollRender = self.props.draggableColl.map(function(itemObj,index){

            return (

                <DnDPuzzleDraggable key={index}
                    id={"puzzleDraggable"+index}
                    imgUrl={itemObj.imgUrl?itemObj.imgUrl:null}
                    draggableStyle={itemObj.draggableStyle}
                    onDraggableBeginDrag={itemObj.onDraggableBeginDrag ? self.onDraggableBeginDrag:null}
                    onDraggableEndDrag={self.onDraggableEndDrag}
                    draggableCanDragCond={itemObj.draggableCanDragCond ? self.draggableCanDragCond:null}
                />
            )
        });

        self.state.renderedDraggableColl = draggableCollRender;
        return draggableCollRender;
    },

    renderDropTargetColl: function(){

        var self = this;
        var dropTargetsRender = self.props.targetsColl.map(function(itemObj,index){

            return (

                <DnDPuzzleDropTarget key={index}
                    id = {"puzzleTarget"+index}
                    imgUrl = {itemObj.imgUrl?itemObj.imgUrl:null}
                    targetStyle = {itemObj.targetStyle}
                    targetOverStyle = {itemObj.targetOverStyle}
                    onTargetDrop = {self.onTargetDrop}
                    onTargetHover = {itemObj.onTargetHover ? self.onTargetHover:null}
                    targetCanDropCond = {itemObj.targetCanDropCond ? self.targetCanDropCond:null}
                />
            )
        });

        self.state.renderedDropTargetsColl = dropTargetsRender;
        self.props.onPuzzleReady(self.state.renderedDraggableColl,self.state.renderedDropTargetsColl);

        return dropTargetsRender;
    },

    onDraggableBeginDrag: function(itemObj, monitor, component){
        //bubble up to parent
        this.props.onDraggableBeginDrag(itemObj, monitor, component);
    },

    onDraggableEndDrag: function(itemObj,monitor,component){
        //bubble up to parent
        this.props.onDraggableEndDrag(itemObj,monitor,component);
    },
    
    draggableCanDragCond: function(itemObj){
        //bubble up to parent
        if (this.props.draggableCanDragCond) this.props.draggableCanDragCond(itemObj);
    },

    onTargetDrop: function(targetObj, monitor, component){
        //bubble up to parent
        this.props.onTargetDrop(targetObj,monitor,component);
    },

    onTargetHover: function(targetObj, monitor, component){
        //bubble up to parent
        this.props.onTargetHover(targetObj,monitor,component);
    },

    targetCanDropCond: function(targetObj){
        //bubble up to parent
        if (this.props.targetCanDropCond) this.props.targetCanDropCond(targetObj);
    },

    render: function() {

        return (
            <div style={this.props.stageStyle}>
                {this.renderDraggableColl()}
                {this.renderDropTargetColl()}
            </div>
        )
    }
});

module.exports = DnDPuzzleView;