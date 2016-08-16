
var React = require('react');
var ReactDom = require('react-dom');
var DnDPuzzleView = require('../../../widgets/dragAndDropPuzzle/ClickDropPuzzleView');
//var DnDPuzzleView = require('../../../widgets/dragAndDropPuzzle/DnDPuzzleView');

var VideoPlayer = require('../../../widgets/VideoPlayer');
var PropTypes = React.PropTypes;

// var DnDPuzzleView;
//
// // device detection
// var isMobile = false;
// if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
//     || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) isMobile = true;
//
// //Drag support detection
// var dragSupport = false;
// if ('draggable' in document.createElement('span')) dragSupport = true;
//
// //drag and drop if drag supported and not mobile
// if (!isMobile && dragSupport) DnDPuzzleView = require('../../../widgets/dragAndDropPuzzle/DnDPuzzleView');
//     else DnDPuzzleView = require('../../../widgets/dragAndDropPuzzle/ClickDropPuzzleView');

var CultureQuestPuzzleGameView = React.createClass({

    getInitialState: function() {

        return {
            mediaPath: 'data/media/',
            stageIsTarget:false,
            pointerOffset:{x:0, y:0},
            dragOriginX:0,
            showVideo:false
        }
    },

    propTypes: {

        imageData: PropTypes.object.isRequired
    },

    componentWillMount: function() {
        this.displayPuzzlePopup();
        this.prepDraggableData();
        this.prepTargetData();
        this.prepStageTargetObj();
    },

    componentDidMount: function(){
        //special gift piece
        $("#puzzleTarget0").attr("pieceNumber","0");
        $("#puzzleDraggable0").attr("placement","placed0");

    },

    displayPuzzlePopup: function(){

        var self = this;
        var debriefText = {width:'400px',marginLeft:'33px',marginTop:'-7px'};

        var popupObj = {
            id:"PuzzleBackground",
            popupStyle: {height:'400px', width:'460px', top:'10%', left:'10%', background:'#fff', zIndex:'25'},

            content: function(){

                return(
                    <div className="popup-view-content">
                        <div className="popup-view-bodyText" style={debriefText}>
                            {self.props.imageData.debriefText}
                        </div> 
                    </div>
                )
            }
        };

        this.props.displayPopup(popupObj);
    },

    prepDraggableData: function(){

        var imageData = this.props.imageData;
        var draggableColl = [];
        var pieceHeight = 55, topStart = 90, left = 680;

        for (var i=0; i < imageData.regions.length; i++){

            var imgUrl = this.state.mediaPath + imageData.regions[i].tile;
            var draggableStyle = {position:'absolute', width:'40px', height:'50px',
                background: "url('"+imgUrl+"') no-repeat", backgroundSize:"40px 50px", zIndex:'30',
                left: left+"px", top:topStart+(pieceHeight * i)+"px"};

            if (i === 0) {
                draggableStyle.top = "113px";
                draggableStyle.left = "140px";
                draggableStyle.width = "112px";
                draggableStyle.height = "168px";
                draggableStyle.backgroundSize = "100%";
            }

            var draggableObj = {
                
                id:"puzzleDraggable"+i,
                draggableStyle : draggableStyle,
                imgUrl:null,
                onDraggableBeginDrag: this.onDraggableBeginDrag,
                onDraggableEndDrag: this.onDraggableEndDrag,
                onDraggableWhileDrag: this.onDraggableWhileDrag,
                draggableCanDragCond: null
                };

            draggableColl.push(draggableObj);
        }

        return draggableColl;
    },

    prepTargetData: function(){

        var imageData = this.props.imageData;
        var targetColl = [];
        var gridOrigin = {x:140, y:113}, targetWidth = 112, targetHeight = 168;
        var targetPosColl = [];

        for (var r = 0 ; r < 3; r++){
            for (var c = 0 ; c < 3 ; c++){
                var x = (c === 0) ? parseInt(gridOrigin.x + (targetWidth * c)) : parseInt(gridOrigin.x + (targetWidth * c)) - c;
                var y = (r === 0) ? parseInt(gridOrigin.y + (targetHeight * r)) : parseInt(gridOrigin.y + (targetHeight * r)) - r;
                targetPosColl.push({
                    x:x,
                    y:y
                });
            }
        }

        for (var i=0; i < imageData.regions.length; i++){

            var targetStyle = {position:'absolute', width:targetWidth+'px', height:targetHeight+'px', zIndex:'50px',
                background:'#fff', top: targetPosColl[i].y+"px", left:targetPosColl[i].x+"px",
                border:'1px solid #000'};

            var targetOverStyle = {position:'absolute', width:targetWidth+'px', height:targetHeight+'px', zIndex:'50px',
                background:'#fff', top: targetPosColl[i].y+"px", left:targetPosColl[i].x+"px",
                border:'1px solid red'};

            var targetObj = {
                id:"puzzleTarget"+i,
                imgUrl:null,
                targetStyle: targetStyle,
                targetOverStyle: targetOverStyle,
                onTargetDrop: this.onTargetDrop,
                onTargetHover: this.onTargetHover,
                targetCanDropCond: true
                };

            targetColl.push(targetObj);
        }

        return targetColl;
    },

    prepStageTargetObj: function(){

        var stageStyle = {position:'absolute', width:'765px', height:'502px',
            top:0, left:0, zIndex:'10'};

        return {
            id:"puzzleStageTarget",
            imgUrl:null,
            targetStyle: stageStyle,
            targetOverStyle: null,
            onTargetDrop: this.onTargetDrop,
            onTargetHover: this.onTargetHover,
            targetCanDropCond: this.state.stageIsTarget
        };
    },
    
    onPuzzleReady: function(draggableColl, targetColl){
    },

    onDraggableBeginDrag: function(itemObj, monitor, component){
        var dragItem = ReactDom.findDOMNode(component);
        this.setState({dragOriginX:parseInt(dragItem.style.left.replace("px",""))});
        dragItem.style.width  = "112px";
        dragItem.style.height = "168px";
        dragItem.style.backgroundSize  = "100%";
    },

    onDraggableEndDrag: function(itemObj, monitor, component){

        var dragItem = ReactDom.findDOMNode(component);

        if (monitor.getDropResult()) {
            var target = $("#"+monitor.getDropResult().id);

            if (monitor.didDrop()) {
                if (monitor.getDropResult().id !== "puzzleStageTarget"){
                    dragItem.style.top  = $(target).position().top+"px";
                    dragItem.style.left = $(target).position().left+"px";
                    $(target).attr("pieceNumber", $(dragItem).attr("id").substring(15));
                    this.checkCompletion();
                }else{
                    dragItem.style.top  = (this.state.pointerOffset.y - parseInt(dragItem.style.height) / 2)+"px";
                    dragItem.style.left = (this.state.pointerOffset.x - parseInt(dragItem.style.width) / 2) -50 + "px";
                    if (this.state.pointerOffset.x > 700) dragItem.style.left = "650px";
                }
            }
        }else{
            //dragged shrunk only if dragged from slider
            if (this.state.dragOriginX > 700){
                dragItem.style.width  = "40px";
                dragItem.style.height = "50px";
            }
        }
    },

    //mobile
    onDraggableClick: function(e){

    },

    onDraggableSwap: function(dragId,targetId){
        var tempTargetNumber1 = $("#"+dragId).attr("placement").substring(6);
        var tempTargetNumber2 = $("#"+targetId).attr("placement").substring(6);
        console.log("Saving from drg: " + tempTargetNumber1 + " from target: " + tempTargetNumber2)

        //swap target pieceNumbers
        $("#puzzleTarget"+tempTargetNumber1).attr("pieceNumber", tempTargetNumber1);
        $("#puzzleTarget"+tempTargetNumber2).attr("pieceNumber", tempTargetNumber2);

        var tempDragObj = {"placement":$("#"+dragId).attr("placement"), "top": $("#"+dragId).position().top+"px", "left":$("#"+dragId).position().left+"px"};
        $("#"+dragId).css({"top":$("#"+targetId).position().top+"px", "left":$("#"+targetId).position().left+"px"}).attr("placement", $("#"+targetId).attr("placement"));
        $("#"+targetId).css({"top":tempDragObj.top, "left":tempDragObj.left}).attr("placement", tempDragObj.placement);

        this.checkCompletion();
    },

    onDraggableDrop: function(dragId,targetId){
        $("#"+dragId).css({"width": "112px", height:"168px","background-size":"102%",
            "top":$("#"+targetId).position().top+"px", "left":$("#"+targetId).position().left+"px"});
        $("#"+targetId).attr("pieceNumber", dragId.substring(15));
        this.checkCompletion();
    },

    checkCompletion: function(){
        var self = this;
        var correctColl = "";
        var placedPuzzles = "";
        $("[id^='puzzleTarget']").each(function(){
            if ($(this).attr('pieceNumber')) {placedPuzzles += ($(this).attr('pieceNumber')); self.viewUpdate({task:"tileAudio", value:null});}
            correctColl += $(this).attr('id').substring(12);
        });
        
        //completed
        if (placedPuzzles === correctColl) {
            window.setTimeout(function(){
                self.setState({showVideo:true});
                $("#DnDStage").css("pointer-events","none");},1500);
        }
    },

    draggableCanDragCond: function(itemObj){
        //return true or false according to target
        return true;
    },

    onTargetDrop: function(targetObj, monitor, component){
    },
    
    onTargetHover: function(targetObj, monitor, component){
        this.setState({stageIsTarget: targetObj.id === "puzzleStageTarget"});
        var offset = monitor.getSourceClientOffset();
        if (offset) this.setState({pointerOffset:{x:offset.x, y:offset.y}})
    },

    targetCanDropCond: function(targetObj){
        //return true or false according to target
    },

    onClosePopup: function(){
        //bubble up
        this.props.onClosePopup();
    },

    viewUpdate: function(update){
        //propagate up
        this.props.viewUpdate(update);
    },

    onVidEnded: function(){
        this.viewUpdate({task:"gameEnded",value:null})
    },


    render: function() {
        var self=this;
        var videoUrl = this.state.mediaPath + this.props.imageData.videoReward;
        var stageStyle = {width:'768px', height:'506px', display:'block',
                          top: '28px', left:0, position:'absolute', zIndex:'25'};

        return (
            <div>
                <DnDPuzzleView
                    stageStyle           = {stageStyle}
                    draggableColl        = {this.prepDraggableData()}
                    stageTargetObj       = {this.prepStageTargetObj()}
                    targetsColl          = {this.prepTargetData()}
                    onDraggableBeginDrag = {this.onDraggableBeginDrag}
                    onDraggableClick     = {this.onDraggableClick}
                    onDraggableEndDrag   = {this.onDraggableEndDrag}
                    onTargetClick        = {this.onDraggableDrop}
                    draggableCanDragCond = {null}
                    onTargetDrop         = {this.onTargetDrop}
                    onTargetHover        = {this.onTargetHover}
                    targetCanDropCond    = {null}
                    draggableOnClass     = {"culture-quest-puzzle-game-dragOn"}
                    targetOnClass        = {"culture-quest-puzzle-game-targetOn"}
                    onPuzzleReady        = {this.onPuzzleReady}
                    onDraggableSwap      = {this.onDraggableSwap}
                />
                <div className = "culture-quest-puzzle-game-view-puzzleSlider">
                    <div className = "culture-quest-puzzle-game-slider-title">Collection</div>
                </div>

                {self.state.showVideo ?
                    <VideoPlayer
                        id="puzzleAwardVideo"
                        style={{zIndex:'50',position:'absolute',top:'141px',left:'82px', width:'450px', height:'338px'}}
                        sources={[{format:"mp4",url:videoUrl}]}
                        autoPlay={true}
                        width="450"
                        height="338"
                        onVidEnded={self.onVidEnded}
                    />:null}
            </div>
        )
    }
});

module.exports = CultureQuestPuzzleGameView;