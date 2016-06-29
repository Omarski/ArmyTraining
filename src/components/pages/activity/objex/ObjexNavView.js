var React = require('react');
var ObjexNavCellView = require('./ObjexNavCellView');
var ObjexNavCoinView = require('./ObjexNavCoinView');
var PropTypes  = React.PropTypes;

var ObjexNavView = React.createClass({

    
    getInitialState: function() {

        return {
            firstRound:true,
            navDisc:"",
            coinsRemaining:6
        };
    },

    propTypes: {
        gameData: PropTypes.object,
        activeObjexColl: PropTypes.array.isRequired,
        mediaPath: PropTypes.string.isRequired,
        updateGameView: PropTypes.func.isRequired
    },

    componentWillMount: function() {
    },

    componentDidMount: function(){
    },
    
    prepNav: function(){

        var self = this;
        var activeObjexColl = self.state.firstRound ? self.props.activeObjexColl.slice(0,6):
                              self.props.activeObjexColl.slice(5,10);

        var navCells = activeObjexColl.map(function(objex,index){
            return (
            <ObjexNavCellView
                key={index}
                activeObjex = {objex}
                onCellOver = {self.onCellOver}
            />
            )
        });

        return navCells;
    },

    prepCoins: function(){
        
        var coinOffset = 15;
        var coinArt = this.props.gameData.ui_images.hint_icon;
        
        var coinsRender = this.props.activeObjexColl.map(function(objex,index){
            
            var coinOffset = {left:index * coinOffset + "px"};
            
            return(
                <ObjexNavCoinView
                    key={index}
                    coinArt = {coinArt}
                    activeObjex = {objex}
                    onCoinClick = {this.onCoinClick}
                    coinOffset = {coinOffset}
                />
            )
        });
        
        return coinsRender;
    },

    onCellOver: function(e){
        console.log("Over: "+ e.target.id);
    },

    onCoinClick: function(e){
        console.log("Coin : "+ e.target.id);
    },

    viewUpdate: function(update){
        //propagate up
        this.props.viewUpdate(update)
    },

    updateGameView: function(update){

        var self = this;
        switch (update.task){
        }
    },

    render: function() {

        var self = this;

        return (<div className="objex-view-navCont">
                    <div className="objex-view-cellCont">
                        {self.prepNav}
                    </div>
                <div className="objex-view-navContDesc" id="objexViewNavContDesc">{self.state.navDisc}</div>
                <div className="objex-view-navCoinCont" id="objexViewNavCoinCont">{self.prepCoins}</div>
               </div>
        )
    }
});

module.exports = ObjexNavView;