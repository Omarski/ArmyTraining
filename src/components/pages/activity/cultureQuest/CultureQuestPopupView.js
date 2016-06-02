var React = require('react');
var PropTypes  = React.PropTypes;

var CultureQuestPopupView = React.createClass({

    propTypes: {

        popupStyle: PropTypes.object.isRequired,
        onClickOutside: PropTypes.func.isRequired
    },

    getInitialState: function() {

        return {
        };
    },

    componentDidMount: function() {
    },

    render: function() {

        return (
            <div id={"cultureQuestPopupContBack"+this.props.id}
                 className="culture-quest-popup-view-background"
                 onclick={this.props.onClickOutside()}>

                <div className="culture-quest-popup-view-cont"
                id={"cultureQuestPopupCont"+this.props.id}>
                    {this.props.children}
                </div>

            </div>
        )
    }
});

module.exports = CultureQuestPopupView;