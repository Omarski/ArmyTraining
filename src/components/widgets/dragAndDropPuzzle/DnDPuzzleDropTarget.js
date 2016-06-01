var React = require('react');
var ItemTypes = require('./Constants').ItemTypes;
var DropTarget = require('react-dnd').DropTarget;
var PropTypes = React.PropTypes;

//target contract
var dropTarget = {

    canDrop: function (props, monitor) {
       return props.targetCanDropCond;
    },

    drop: function (props, monitor, component) {
        props.onTargetDrop({id:props.id}, monitor, component);
        return({id:props.id});
    },

    hover: function (props, monitor, component) {
        if (props.onTargetHover) props.onTargetHover({id:props.id}, monitor, component);
        return({id:props.id});
    }
};

//props needed - monitor updates, connect designations
function collect(connect, monitor) {
    return {
        //designate as drop target
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver()
    };
}

var DnDPuzzleDropTarget = React.createClass({

    propTypes: {

        isOver: PropTypes.bool.isRequired,
        id: PropTypes.string.isRequired,
        targetStyle: PropTypes.object.isRequired,
        targetOverStyle: PropTypes.object,
        onTargetDrop: PropTypes.func.isRequired,
        onTargetHover: PropTypes.func,
        targetCanDropCond: PropTypes.bool
    },

    render: function () {
        
        var self= this;
        var id = self.props.id;
        var connectDropTarget = self.props.connectDropTarget;
        var isOver = self.props.isOver;

        //wrapper
        return connectDropTarget(

            <div id={id} style={isOver && self.props.targetOverStyle ?
                self.props.targetOverStyle : self.props.targetStyle}>
                <div>{this.props.children}
                </div>
            </div>

        );
    }
});

//wrapper
module.exports = DropTarget(ItemTypes.PUZZLE_PIECE, dropTarget, collect)(DnDPuzzleDropTarget);