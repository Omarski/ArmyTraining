var React = require('react');
var CheckIcon = React.createClass({
    render: function() {
        var classString = "glyphicon";
        var inner = " "
        if (this.props.checked) {
            classString += " glyphicon-ok";
            inner = "";
        }

        return <span className={classString} aria-hidden="true">{inner}</span>
    }
});

module.exports = CheckIcon;