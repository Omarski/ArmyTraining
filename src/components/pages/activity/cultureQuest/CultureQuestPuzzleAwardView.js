var React = require('react');
var CultureQuestPuzzleView = React.createClass({

    //props imageData, lastSelected, answersColl

    getInitialState: function() {

        return {
            mediaPath: 'data/media/',
            sliderRendered:false
        };
    },

    componentWillMount: function() {
        this.renderSliderPieces();
        this.setState({sliderRendered:true});
    },

    componentDidMount: function() {

        var self = this;
        var completedIndex = self.props.lastSelected.id.substr(self.props.lastSelected.id.length - 1);
        var lastSelectedData = self.props.imageData.regions[completedIndex];
        var completedTile = lastSelectedData.name.replace(" ","");

        window.setTimeout(function(){
            $("#culture-quest-puzzle-award-view-puzzleSlider").animate({right:'0'},1000,'swing');
            self.viewUpdate({task:"tileAudio", value:null});
        },1200);
        
        window.setTimeout(function(){
            $("#culture-quest-puzzle-award-view-puzzleAwardImg").animate({left:'590px'},1000,'swing',
            function(){
                $("#culture-quest-puzzle-award-view-puzzleAwardImg").remove();
                $("#cultureQuestTile_"+completedTile).css("opacity","1");
            });
        },2500);

        window.setTimeout(function(){

                self.props.showQuizUpdate("hide");
                self.props.showPuzzleUpdate("hide");

        },5500);
    },

    shouldComponentUpdate: function(){
        return !this.state.sliderRendered;
    },

    getSelectedIndex: function(){

        if (this.props.lastSelected) return parseInt(this.props.lastSelected.getAttribute('id').substring(18));
        return false;
    },

    renderSliderPieces: function(){

            var self = this, pieceHeight = 55, topPadding = 60;
            var regionsColl = self.props.imageData.regions;
            var completedData = [];
            var completedIndex = self.props.lastSelected.id.substr(self.props.lastSelected.id.length - 1);
            var lastSelectedData = self.props.imageData.regions[completedIndex];

            //only add completed region data
            for (var i = 0 ; i < self.props.answersColl.length; i++){
                if (self.props.answersColl[i].completed) completedData.push(regionsColl[i]);
            }

            var sliderPuzzles = completedData.map(function(region,index){

                var pieceImg = self.state.mediaPath + region.tile;
                var opacity = (lastSelectedData.tile === region.tile) ? "0":"1";
                if (opacity === "0") console.log("hiding: " + "cultureQuestTile_"+region.name.replace(" ",""));
                var pieceStyle = {top: parseInt(topPadding+(pieceHeight * index)), background:"url("+pieceImg+") no-repeat", backgroundSize:"40px 50px", opacity:opacity};

                return (
                    <div className="culture-quest-puzzle-award-view-sliderPuzzle" id={"cultureQuestTile_"+region.name.replace(" ","")} style={pieceStyle} key={index}></div>
                )
            });
           
            return sliderPuzzles;

    },

    viewUpdate: function(update){
        //propagate up
        this.props.viewUpdate(update);
    },

    render: function() {

        var self = this;
        var puzzleImg = self.state.mediaPath + self.props.imageData.regions[self.getSelectedIndex()].tile;
        var puzzleAwardStyle = {background:"url("+puzzleImg+") no-repeat 100% 100%"};
        var sliderClasses = "culture-quest-puzzle-award-view-puzzleSlider";

        return (
            <div className="culture-quest-puzzle-award-view-puzzleCont" id="culture-quest-puzzle-award-view-puzzleCont">
                <div className = {sliderClasses} id="culture-quest-puzzle-award-view-puzzleSlider">
                    <div className = "culture-quest-puzzle-award-view-slideHeader">Collection</div>
                    {self.renderSliderPieces()}
                </div>
                <div className="culture-quest-puzzle-award-view-puzzleAwardImg" id="culture-quest-puzzle-award-view-puzzleAwardImg"
                     style={puzzleAwardStyle}>
                </div>
            </div>
        )
    }
});

module.exports = CultureQuestPuzzleView;