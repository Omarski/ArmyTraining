var React = require('react');
var CheckIcon = React.createClass({
    render: function() {
        var classString = "glyphicon";
        var inner = " "
        var icon = "";
        if (this.props.checked) {
            icon = (<img src="images/icons/completeexplorer.png"/>);
            inner = "";
        }

        return (<span className={classString} aria-hidden="true">{inner}{icon}</span>);
    }
});

module.exports = CheckIcon;