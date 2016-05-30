var React = require('react');
var PropTypes  = React.PropTypes;
var ItemTypes  = require('./Constants').ItemTypes;
var DragSource = require('react-dnd').DragSource;

//draggable contract - Return the data describing the dragged item:

var puzzlePieceSource = {

    canDrag: function (props) {
        if (props.draggableCanDragCond) return props.draggableCanDragCond({id: props.id});
        return true;
    },
    beginDrag: function (props, monitor, component) {
        if (props.onDraggableBeginDrag) props.onDraggableBeginDrag({id: props.id}, monitor, component);
        return {id: props.id};
    },
    endDrag: function(props, monitor, component){
        props.onDraggableEndDrag({id: props.id},monitor,component);
        return {id: props.id};
    }
};

//props needed - monitor updates, connect designations
function collect(connect, monitor) {
    return {
        //designate as draggable
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    }
}

var DnDPuzzleDraggable = React.createClass({

    propTypes: {

        connectDragSource: PropTypes.func.isRequired,
        isDragging: PropTypes.bool.isRequired,
        
        id:PropTypes.string.isRequired,
        imgUrl:PropTypes.string,
        draggableStyle:PropTypes.object.isRequired,
        onDraggableBeginDrag:PropTypes.func,
        onDraggableEndDrag:PropTypes.func.isRequired,
        draggableCanDragCond:PropTypes.func
    },

    render: function() {

        var id = this.props.id;
        var connectDragSource = this.props.connectDragSource;
        var isDragging = this.props.isDragging;
        var draggableStyle = this.props.draggableStyle;
        var combinedStyle = {
            opacity: isDragging ? 0.5 : 1,
            cursor: 'move'
        };

        if (this.props.imgUrl) combinedStyle['background'] = "url("+this.props.imgUrl+") no-repeat 100% 100%";

        //add passed style
        for (var style in draggableStyle) combinedStyle[style] = draggableStyle[style];

        return connectDragSource(

            <div id={id} style={combinedStyle}>
            </div>
        );
    }
});


module.exports = DragSource(ItemTypes.PUZZLE_PIECE, puzzlePieceSource, collect)(DnDPuzzleDraggable);