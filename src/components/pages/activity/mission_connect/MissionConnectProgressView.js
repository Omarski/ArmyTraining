var React = require('react');
var PropTypes  = React.PropTypes;

var MissionConnectProgressView = React.createClass({

    propTypes: {
        mediaPath: PropTypes.string.isRequired,
        checkList:PropTypes.object.isRequired,
        wrongAttempts: PropTypes.number.isRequired
    },

    componentDidMount: function(){
        this.renderChecklist();
    },

    renderChecklist: function(){

        var list = this.props.checkList;
        return list;
    },

    render: function() {

        var meterImg = this.props.mediaPath + "METER_6-"+this.props.wrongAttempts+"_01.png";
        var meterStyle = {background:'url('+meterImg+') no-repeat 100% 100%'};
        
        return (
            <div>
                <div className="mission-connect-view-charListCont">
                    <div className="mission-connect-view-titleLeaders">Leaders</div>
                    <div className="mission-connect-view-titleCont">Contractors</div>
                    <div className="mission-connect-view-checksLeaders">{this.renderChecklist().leaders}</div>
                    <div className="mission-connect-view-checksCont">{this.renderChecklist().contractors}</div>
                </div>

                <div className="mission-connect-view-meterCont" style={meterStyle}>
                </div>
            </div>
        )
    }
});

module.exports = MissionConnectProgressView;