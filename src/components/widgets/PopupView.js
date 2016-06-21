var React = require('react');
var PropTypes  = React.PropTypes;

var CultureQuestPopupView = React.createClass({

    propTypes: {
        id:PropTypes.string,
        popupStyle: PropTypes.object.isRequired,
        onClickOutside: PropTypes.func
    },

    render: function() {

        return (
            <div id={"popupContBack"+this.props.id}
                 className="popup-view-background"
                 onClick={this.props.onClickOutside
                 ? this.props.onClickOutside:null}>

                <div className="popup-view-cont"
                id={"popupCont"+this.props.id}
                style={this.props.popupStyle}
                >
                    {this.props.children}
                </div>

            </div>
        )
    }
});

module.exports = CultureQuestPopupView;