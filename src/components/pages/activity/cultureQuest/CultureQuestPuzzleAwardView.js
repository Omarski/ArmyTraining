var React = require('react');
var CultureQuestPuzzleView = React.createClass({

    //props imageData, lastSelected, answersColl

    getInitialState: function() {

        return {
            mediaPath: 'data/media/'
        };
    },

    componentWillMount: function() {
        this.renderSliderPieces();
    },

    componentDidMount: function() {
        var self = this;
        window.setTimeout(function(){
            $("#CultureQuestPuzzleView-puzzleSlider").animate({right:'0'},1000,'swing');
        },1200);
        
        window.setTimeout(function(){
            $("#cultureQuestPuzzleView-puzzleAwardImg").animate({left:'590px'},1000,'swing',
            function(){
                $("#cultureQuestPuzzleView-puzzleAwardImg").remove();
            });
        },2500);

        window.setTimeout(function(){
                self.props.showQuizUpdate("hide");
                self.props.showPuzzleUpdate("hide");
        },5500);
    },

    componentWillUnmount: function() {
    },

    componentDidUpdate: function(prevProps, prevState){
    },

    getSelectedIndex: function(){

        if (this.props.lastSelected) return parseInt(this.props.lastSelected.getAttribute('id').substring(18));
        return false;
    },

    renderSliderPieces: function(){

        var self = this, pieceHeight = 55, topPadding = 60;
        var regionsColl = self.props.imageData.regions;
        var completedData = [];

        //only add completed region data
        for (var i = 0 ; i < self.props.answersColl.length; i++){
            if (self.props.answersColl[i].completed) completedData.push(regionsColl[i]);
        }

        var sliderPuzzles = completedData.map(function(region,index){

            var pieceImg = self.state.mediaPath + region.tile;
            var pieceStyle = {top: topPadding+(pieceHeight * index), background:"url("+pieceImg+") no-repeat 100% 100%"};
            return (
                <div className="CultureQuestPuzzleView-sliderPuzzle" style={pieceStyle} key={index}></div>
            )
        });
        return sliderPuzzles;
    },

    render: function() {

        var self = this;
        var puzzleImg = self.state.mediaPath + self.props.imageData.regions[self.getSelectedIndex()].tile;
        var puzzleAwardStyle = {background:"url("+puzzleImg+") no-repeat 100% 100%"};
        var sliderClasses = "CultureQuestPuzzleView-puzzleSlider";

        return (
            <div className="CultureQuestPuzzleView-puzzleCont" id="CultureQuestPuzzleView-puzzleCont">
                <div className = {sliderClasses} id="CultureQuestPuzzleView-puzzleSlider">
                    {self.renderSliderPieces()}
                </div>
                <div className="cultureQuestPuzzleView-puzzleAwardImg" id="cultureQuestPuzzleView-puzzleAwardImg"
                     style={puzzleAwardStyle}>
                </div>
            </div>
        )
    }
});

module.exports = CultureQuestPuzzleView;