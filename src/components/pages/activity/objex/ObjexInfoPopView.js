var React = require('react');
var PropTypes  = React.PropTypes;
var PopupView = require('./../../../widgets/PopupView');

var ObjexInfoPopView = React.createClass({

    
    getInitialState: function() {

        return {
            popupObj:null
        };
    },

    propTypes: {
        activeObjex: PropTypes.object.isRequired,
        mediaPath: PropTypes.string.isRequired,
        updateGameView: PropTypes.func.isRequired
    },

    componentWillMount: function() {
    },

    componentDidMount: function(){
        this.prepPop();
    },

    prepPop: function(){

        var self=this;
        var objex  = this.props.activeObjex;
        var img = objex.iconImgSrc;
        var popImgStyle = {background:'url('+img+') no-repeat', backgroundSize:'140px 140px'};
        var closeImg = this.props.mediaPath + "objex/img/close.png";
        var closeBtnStyle = {background:'url('+closeImg+') no-repeat 100% 100%'};

        var popupObj = {
            id:"InfoPop",
            onClickOutside: null,
            popupStyle: {height:'230px', width:'300px', top:'100px', right:'50px',
                         background: '#fff', border:'2px solid gray', padding:'5px', zIndex:'6'},

            content: function(){

                return(
                    <div className="objex-view-popCont">
                        <div className="objex-view-infoPopClose" onClick={self.closeClicked} style={closeBtnStyle}></div>
                        <div className="objex-view-infoPopTitle">{objex.abbreviation}</div>
                        <div className="objex-view-infoPopImg" style={popImgStyle}></div>
                        <div className="objex-view-infoPopText">{objex.description}</div>
                    </div>
                )
            }
        };

        this.setState({popupObj:popupObj})
    },

    closeClicked: function(){
        this.updateGameView({task: "delInfoPop", value:null});
    },

    updateGameView: function(update){

        this.props.updateGameView(update);
    },

    render: function() {

        var self = this;
        return(<div>
                {self.state.popupObj ? <PopupView
                    id = {"objexPopInfo"}
                    popupStyle = {self.state.popupObj.popupStyle}
                    onClickOutside = {self.state.popupObj.onClickOutside}
                >
                    {self.state.popupObj.content()}
                </PopupView>:null}
            </div>
        )
    }
});

module.exports = ObjexInfoPopView;