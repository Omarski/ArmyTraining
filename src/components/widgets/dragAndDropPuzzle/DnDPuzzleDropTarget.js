var React = require('react');
var ItemTypes = require('./Constants').ItemTypes;
var DropTarget = require('react-dnd').DropTarget;
var PropTypes = React.PropTypes;

var dropTarget = {

    canDrop: function (props) {
        return true;
    },
    drop: function (props) {
       //to do at drop
        console.log("Dropped into !!!");
    },
    over: function (props) {
       //to do at drop
        console.log("Over target !!!");
    }
};

//props needed - monitor updates, connect designations
function collect(connect, monitor) {
    return {
        //designate as drop target
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
    };
}

var DnDPuzzleDropTarget = React.createClass({

    propTypes: {
        id: PropTypes.string.isRequired,
        targetStyle: PropTypes.object.isRequired,
        targetOverStyle: PropTypes.object.isRequired,
        isOver: PropTypes.bool.isRequired,
        canDrop: PropTypes.bool.isRequired
    },

    render: function () {
        var self= this;
        var id = self.props.id;
        var connectDropTarget = self.props.connectDropTarget;
        var isOver = self.props.isOver;


        return connectDropTarget(

            <div id={id} style={isOver? self.props.targetStyle: self.props.targetOverStyle}>
            </div>

        );
    }
});

//wrapper
module.exports = DropTarget(ItemTypes.PUZZLE_PIECE, dropTarget, collect)(DnDPuzzleDropTarget);