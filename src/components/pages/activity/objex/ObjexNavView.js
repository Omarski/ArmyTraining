var React = require('react');
var ObjexNavCellView = require('./ObjexNavCellView');
var ObjexNavCoinView = require('./ObjexNavCoinView');
var PropTypes  = React.PropTypes;

var ObjexNavView = React.createClass({

    
    getInitialState: function() {

        return {
            navDisc:"",
            coinsRemaining:6,
            activeRoundObjexColl:[]
        };
    },

    propTypes: {
        gameData: PropTypes.object,
        activeObjexColl: PropTypes.array.isRequired,
        mediaPath: PropTypes.string.isRequired,
        updateGameView: PropTypes.func.isRequired,
        firstRound: PropTypes.bool.isRequired
    },

    componentWillMount: function(){
        var self = this;
        var activeRoundObjexColl = self.props.firstRound ? self.props.activeObjexColl.slice(0,5):
                                   self.props.activeObjexColl.slice(6,10);
        self.setState({activeRoundObjexColl:activeRoundObjexColl});
        self.updateGameView({task:"activeRoundObjexColl", value:activeRoundObjexColl});
    },

    componentDidMount: function(){
    },
    
    prepNav: function(){

        var self = this;
        var activeRoundObjexColl = self.props.firstRound ? self.props.activeObjexColl.slice(0,5):
                              self.props.activeObjexColl.slice(6,10);

        var navCells = activeRoundObjexColl.map(function(objex,index){

            return (
                <ObjexNavCellView
                    key={index}
                    activeObjex = {objex}
                    onCellOver = {self.onCellOver}
                />
            )
        });

        //self.setState({activeRoundObjexColl:activeRoundObjexColl});
        //self.updateGameView({task:"activeRoundObjexColl", value:activeRoundObjexColl});
        return navCells;
    },

    prepCoins: function(){
        
        var self = this;
        var offset = 15;
        var coinColl = [1,2,3,4,5,6];
        var coinArt = self.props.mediaPath + this.props.gameData.ui_images.hint_icon;
        
        var coinsRender = coinColl.map(function(coin,index){
            
            var coinOffset = index * offset + "px";
            
            return(

                <ObjexNavCoinView
                    key={index}
                    id={index}
                    coinArt = {coinArt}
                    onCoinClick = {self.onCoinClick}
                    coinOffset = {coinOffset}
                />
            )
        });
        
        return coinsRender;
    },

    onCellOver: function(e){

        var hog_id = e.currentTarget.id.substring(13);
        var objex = $.grep(this.props.activeObjexColl, function(e) { return e.hog_id === hog_id });
        this.setState({navDisc:objex[0].tooltip});
    },

    onCoinClick: function(e){
        $("#"+e.target.id).remove();
        this.setState({coinsRemaining: this.state.coinsRemaining -1});

        console.log("Coin : "+ e.target.id + " Remaining: "+ this.state.coinsRemaining);
    },

    viewUpdate: function(update){
        //propagate up
        this.props.viewUpdate(update)
    },

    updateGameView: function(update){

       this.props.updateGameView(update);
    },

    render: function() {

        var self = this;

        return (<div className="objex-view-navCont">
                    <div className="objex-view-cellCont">
                        {self.prepNav()}
                    </div>
                <div className="objex-view-navContDesc" id="objexViewNavContDesc"><span>{self.state.navDisc}</span></div>
                <div className="objex-view-navContHintLabel">Hints</div>
                <div className="objex-view-navCoinCont" id="objexViewNavCoinCont">{self.prepCoins()}</div>
               </div>
        )
    }
});

module.exports = ObjexNavView;