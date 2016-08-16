
var React = require('react');

var PropTypes = React.PropTypes;

var ClickDropPuzzleView = React.createClass({

    getInitialState: function() {

        return {
            mediaPath: 'data/media/',
            renderedDraggableColl:[],
            renderedDropTargetsColl:[],
            lastDraggable:null,
            lastTarget:null
        };
    },

    propTypes: {

        stageStyle: PropTypes.object,
        draggableColl: PropTypes.array.isRequired,
        targetsColl: PropTypes.array.isRequired,
        draggableOnClass: PropTypes.string.isRequired,
        targetOnClass: PropTypes.string.isRequired,
        stageTargetObj: PropTypes.object,
        onDraggableClick: PropTypes.func.isRequired,
        onTargetClick: PropTypes.func.isRequired,
        onPuzzleReady: PropTypes.func,
        onDraggableSwap:PropTypes.func
    },

    renderDraggableColl: function(){

        var self = this;
        var draggableCollRender = self.props.draggableColl.map(function(itemObj,index){

            return (

                <div key={index}
                    id = {itemObj.id}
                    style={itemObj.draggableStyle}
                    onClick={self.onDraggableClick}
                    className=""
                ></div>
            )
        });

        self.state.renderedDraggableColl = draggableCollRender;
        return draggableCollRender;
    },

    renderDropTargetColl: function(){

        var self = this;
        var dropTargetsRender = self.props.targetsColl.map(function(itemObj,index){
        var targetClass = self.state.lastDraggable ? self.props.targetOnClass:"";

            return (

                <div key={index}
                     id = {itemObj.id}
                     style={itemObj.targetStyle}
                     onClick={self.onTargetClick}
                     className={targetClass}
                ></div>
            )
        });

        self.state.renderedDropTargetsColl = dropTargetsRender;
        self.props.onPuzzleReady(self.state.renderedDraggableColl,self.state.renderedDropTargetsColl);
        
        return dropTargetsRender;
    },

    onDraggableClick: function(e){

        var self = this;
        var lastDraggable = document.getElementById(self.state.lastDraggable);

        //swapping
        if (self.props.onDraggableSwap && e.target.hasAttribute("placement") && e.target.getAttribute("placement").indexOf("placed") != -1 && self.state.lastDraggable
            && lastDraggable.hasAttribute("placement") && lastDraggable.getAttribute("placement").indexOf("placed") != -1){
            self.setState({draggableSelected:false, lastDraggable:null});
            lastDraggable.className = lastDraggable.className.replace(self.props.draggableOnClass," ");
            self.props.onDraggableSwap(self.state.lastDraggable, e.target.id);
            return;
        }

        if (e.target.className.indexOf(self.props.draggableOnClass) === -1) {
            if (lastDraggable) lastDraggable.className = lastDraggable.className.replace(self.props.draggableOnClass," ");
            e.target.className = e.target.className + " " + self.props.draggableOnClass;
            self.setState({draggableSelected:true, lastDraggable:e.target.id});
        }else {
            e.target.className = (e.target.className).replace(self.props.draggableOnClass," ");
            self.setState({draggableSelected:false, lastDraggable:null});
        }
    },

    onTargetClick: function(e){

        var self = this;
        var lastDraggable = document.getElementById(self.state.lastDraggable);
        lastDraggable.setAttribute("placement","placed"+e.target.id.substring(12));
        self.props.onTargetClick(self.state.lastDraggable, e.target.id);
        lastDraggable.className = lastDraggable.className.replace(self.props.draggableOnClass," ");
        self.setState({draggableSelected:false, lastDraggable:null});
    },

    accessDraggables: function(item){

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