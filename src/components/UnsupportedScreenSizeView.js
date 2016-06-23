var React = require('react');

function getPageState(props) {
    return {};
}

var UnsupportedScreenSizeView = React.createClass({
    getInitialState: function() {
        var pageState = getPageState(this.props);
        return pageState;
    },

    render: function() {

        return (
            <div>
                <h3>This activity is unsupported at the current screen size</h3>
            </div>
        );
    },


});

module.exports = UnsupportedScreenSizeView;