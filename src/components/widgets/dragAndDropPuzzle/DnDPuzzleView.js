
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

        stageStyle: PropTypes.object,
        draggableColl: PropTypes.array.isRequired,
        targetsColl: PropTypes.array.isRequired,
        stageTargetObj: PropTypes.object,
        onDraggableBeginDrag: PropTypes.func,
        onDraggableEndDrag: PropTypes.func.isRequired,
        draggableCanDragCond: PropTypes.func,
        onTargetDrop: PropTypes.func.isRequired,
        onTargetHover: PropTypes.func,
        targetCanDropCond: PropTypes.bool,
        onPuzzleReady: PropTypes.func
    },

    renderDraggableColl: function(){

        var self = this;
        var draggableCollRender = self.props.draggableColl.map(function(itemObj,index){

            return (

                <DnDPuzzleDraggable key={index}
                    id = {itemObj.id}
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
                    id = {itemObj.id}
                    imgUrl = {itemObj.imgUrl?itemObj.imgUrl:null}
                    targetStyle = {itemObj.targetStyle}
                    targetOverStyle = {itemObj.targetOverStyle}
                    onTargetDrop = {self.onTargetDrop}
                    onTargetHover = {itemObj.onTargetHover ? self.onTargetHover:null}
                    targetCanDropCond = {itemObj.targetCanDropCond}
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

    render: function() {

        var self = this;
        var stageTargetObj = self.props.stageTargetObj;

        //donn't render a target stage if no data supplied
        return (
            <div style={this.props.stageStyle}>
                {this.renderDraggableColl()}
                {!stageTargetObj ? this.renderDropTargetColl():null}

                {stageTargetObj ?

                    <DnDPuzzleDropTarget
                        id = {stageTargetObj.id}
                        imgUrl = {stageTargetObj.imgUrl? stageTargetObj.imgUrl:null}
                        targetStyle = {stageTargetObj.targetStyle}
                        targetOverStyle = {stageTargetObj.targetOverStyle}
                        onTargetDrop = {stageTargetObj.onTargetDrop}
                        onTargetHover = {stageTargetObj.onTargetHover ? stageTargetObj.onTargetHover:null}
                        targetCanDropCond = {stageTargetObj.targetCanDropCond}>

                        {this.renderDropTargetColl()}
                    </DnDPuzzleDropTarget> : null}
                }
               
            </div>
        )
    }
});

module.exports = DnDPuzzleView;