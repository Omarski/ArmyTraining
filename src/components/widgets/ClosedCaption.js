var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var OverlayTrigger = ReactBootstrap.OverlayTrigger;
var Button = ReactBootstrap.Button;
var Popover = ReactBootstrap.Popover;

function getCCState(props) {
    return {
        transcript: props.transcript || ''
    };
}

var ClosedCaptionView = React.createClass({
    getInitialState: function() {
        var ccState = getCCState(this.props);
        return ccState;
    },

    componentWillMount: function() {

    },

    componentDidMount: function() {

    },

    componentWillUnmount: function() {
        
    },
    render: function() {


        function createCC(transcript) {
            return {__html: transcript};
        }

        var t = (
            <p dangerouslySetInnerHTML={createCC(this.state.transcript)}>

            </p>
        );


        var popover = ( <Popover id="settingsPopover" title='Transcript'>
                            {t}
                        </Popover>);

        return  (   <OverlayTrigger trigger='click' placement='left' overlay={popover}>
                        <Button title={"Closed Caption"}
                                alt={"Closed Caption or Transcript"}
                                aria-label={"Video Transcript"}
                                className="btn btn-default btn-link btn-lg closed-caption-button">
                            <span className="glyphicon glyphicon-subtitles btn-icon" aria-hidden="true"></span>
                        </Button>
                    </OverlayTrigger>
        );
    }
});

module.exports = ClosedCaptionView;