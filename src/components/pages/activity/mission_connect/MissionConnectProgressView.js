var React = require('react');
var PropTypes  = React.PropTypes;

var MissionConnectProgressView = React.createClass({

    propTypes: {
        mediaPath: PropTypes.string.isRequired,
        charList:PropTypes.array.isRequired,
        wrongAttempts: PropTypes.number.isRequired
    },

    componentDidMount: function(){
        this.renderChecklist();
    },

    renderChecklist: function(){

        var list = this.props.charList.map(function(char,index){
            return(
                <div key={index}>{char+"\n\n<br><br>"}</div>
            )
        });

        return list;
    },

    render: function() {

        var meterImg = this.props.mediaPath + "METER_6-"+this.props.wrongAttempts+"_01.png";
        var meterStyle = {background:'url('+meterImg+') no-repeat 100% 100%'};
        
        return (
            <div>
                <div className="mission-connect-view-charListCont"
                     dangerouslySetInnerHTML={{__html:this.renderChecklist()}}>
                </div>

                <div className="mission-connect-view-meterCont" style={meterStyle}>
                </div>
            </div>
        )
    }
});

module.exports = MissionConnectProgressView;