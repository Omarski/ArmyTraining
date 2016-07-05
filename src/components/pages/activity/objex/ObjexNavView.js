var React = require('react');
var ObjexNavCellView = require('./ObjexNavCellView');
var ObjexNavCoinView = require('./ObjexNavCoinView');
var ObjexInfoPopView = require('./ObjexInfoPopView');

var PropTypes  = React.PropTypes;

var ObjexNavView = React.createClass({

    
    getInitialState: function() {

        return {
            navDisc:"",
            //coinsRemaining:6,
            activeRoundObjexColl:[]
        };
    },

    propTypes: {
        gameData: PropTypes.object,
        activeObjexColl: PropTypes.array.isRequired,
        mediaPath: PropTypes.string.isRequired,
        updateGameView: PropTypes.func.isRequired,
        activeRoundObjexColl: PropTypes.array.isRequired,
        showCells: PropTypes.bool.isRequired,
        showHint: PropTypes.func.isRequired
    },
    
    prepNav: function(){

        var self = this;
        var navCells = self.props.activeRoundObjexColl.map(function(objex,index){
           
            return (
                <ObjexNavCellView
                    key={index}
                    id={index}
                    activeObjex = {objex}
                    onCellOver = {self.onCellOver}
                />
            )
        });

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
        this.props.showHint();
        //this.setState({coinsRemaining: this.state.coinsRemaining - 1});
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
                    {self.props.showCells ? <div className="objex-view-cellCont">
                        {self.prepNav()}
                    </div>:null}
                <div className="objex-view-navContDesc" id="objexViewNavContDesc"><span>{self.state.navDisc}</span></div>
                <div className="objex-view-navContHintLabel">Hints</div>
                <div className="objex-view-navCoinCont" id="objexViewNavCoinCont">{self.prepCoins()}</div>
               </div>
        )
    }
});

module.exports = ObjexNavView;