var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var OverlayTrigger = ReactBootstrap.OverlayTrigger;
var Tooltip = ReactBootstrap.Tooltip;

var PageHeader = React.createClass({
    getInitialState: function() {
        var sources = "";
        if (this.props.sources && this.props.sources.length) {
            sources = this.props.sources.concat(", ")
        }

        return {
            sources: sources,
            title: this.props.title || ""
        }
    },

    componentWillMount: function() {

    },

    componentDidMount: function() {

    },

    componentWillUnmount: function() {

    },
    render: function() {
        var attributions = <Tooltip id="sourcesTooltip">{this.state.sources}</Tooltip>;
        var info = "";
        if (this.state.sources !== "") {
            info = <OverlayTrigger placement="right" overlay={attributions}>
                        <span className="infoAttributions glyphicon glyphicon-info-sign"></span>
                    </OverlayTrigger>;
        }

        return  <div className="page-header">
            <h1>{this.state.title}<small>
                {info}
            </small>
            </h1>
        </div>;
    }
});

module.exports = PageHeader;