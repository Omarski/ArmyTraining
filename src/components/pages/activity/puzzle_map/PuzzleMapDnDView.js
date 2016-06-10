
var React = require('react');
var PropTypes = React.PropTypes;

var PuzzleMapDnDView = React.createClass({

    getInitialState: function() {

        return {
            mediaPath: 'data/media/',
            dragImg: null,
            isDragging:false,
            context:null,
            canvas:null,
            imgBounds:{},
            bottomCanvas:null,
            bottomCanvasContext:null,
            dropStatus:""
        }
    },

    propTypes: {

        imageData: PropTypes.object.isRequired,
        puzzlePiecesObj: PropTypes.object.isRequired,
        scoreObj: PropTypes.object.isRequired,
        renderHUD: PropTypes.func.isRequired,
        updateHUDView: PropTypes.func.isRequired
    },

    componentWillMount: function() {
    },

    componentDidMount: function(){
        this.prepDraggableData();
        this.prepBottomCanvas();
    },

    prepDraggableData: function(){

        var self = this;
        var puzzlePiecesObj = self.props.puzzlePiecesObj;
        var imgUrl = self.state.mediaPath + puzzlePiecesObj.correctUrl;

        var canvas = document.getElementById('puzzleMapDragCanvas');
        var context = canvas.getContext('2d');

        var imageObj = new Image();

        imageObj.onload = function() {

            context.drawImage(imageObj, puzzlePiecesObj.offsetX,
                              puzzlePiecesObj.offsetY,
                              canvas.width * puzzlePiecesObj.scaleAmount,
                              canvas.height * puzzlePiecesObj.scaleAmount
            );

            var imgBounds = {};

            var factorToFull = 100/(100 - (self.props.puzzlePiecesObj.scaleAmount * 100));
            imgBounds.width = self.getBounds().width * factorToFull;
            imgBounds.height = self.getBounds().height * factorToFull;
            self.setState({imgBounds:imgBounds});
        };

        imageObj.src = imgUrl;

        $("#puzzleMapDragCanvas").mousedown(function(e){self.handleMouseDown(e);});
        $("#puzzleMapDragCanvas").mousemove(function(e){self.handleMouseMove(e);});
        $("#puzzleMapDragCanvas").mouseup(function(e){self.handleMouseUp(e);});
        $("#puzzleMapDragCanvas").mouseout(function(e){self.handleMouseOut(e);});

        self.setState({context:context, dragImg:imageObj, canvas:canvas })
    },

    prepBottomCanvas: function(){
        var canvas = document.getElementById('puzzleMapViewBottomCanvas');
        var context = canvas.getContext('2d');
        this.setState({bottomCanvas:canvas, bottomCanvasContext:context});
    },

    handleMouseDown: function(e){
        // var canvasOffset=$("#puzzleMapDragCanvas").offset();
        // var canMouseX=parseInt(e.clientX-canvasOffset.left);
        // var canMouseY=parseInt(e.clientY-canvasOffset.top);
        self.props.updateHUDView(true);
        this.setState({isDragging:true});
    },

    handleMouseUp: function(e){
        // var canvasOffset=$("#puzzleMapDragCanvas").offset();
        // var canMouseX=parseInt(e.clientX-canvasOffset.left);
        // var canMouseY=parseInt(e.clientY-canvasOffset.top);
        this.setState({isDragging:false});
    },

    handleMouseOut: function(e){
        var canvasOffset=$("#puzzleMapDragCanvas").offset();
        var canMouseX=parseInt(e.clientX-canvasOffset.left);
        var canMouseY=parseInt(e.clientY-canvasOffset.top);
        var imgOffsetX = (canMouseX - (canvasWidth  * scaleAmount)) - (parseInt(self.state.imgBounds.width)/2);
        var imgOffsetY = (canMouseY - (canvasHeight * scaleAmount)) - (parseInt(self.state.imgBounds.height)/2);
        if ((imgOffsetX >= -50 && imgOffsetX <= 50) && (imgOffsetY >= -50 && imgOffsetY <= 50)){
            this.updateBottomCanvas("labeled");
        }else this.updateBottomCanvas("hint");
    },

    handleMouseMove: function(e){

        var self = this;
        var scaleAmount = parseFloat(self.props.puzzlePiecesObj.scaleAmount);
        var canvasOffset=$("#puzzleMapDragCanvas").offset();
        var canMouseX=parseInt(e.clientX-canvasOffset.left);
        var canMouseY=parseInt(e.clientY-canvasOffset.top);

        if (self.state.isDragging){
            var canvasWidth = parseInt(self.state.canvas.width);
            var canvasHeight = parseInt(self.state.canvas.height);

            self.state.context.clearRect(0,0, canvasWidth, canvasHeight);
            self.state.context.drawImage(self.state.dragImg,
                (canMouseX - (canvasWidth  * scaleAmount)) - (parseInt(self.state.imgBounds.width)/2),
                (canMouseY - (canvasHeight * scaleAmount)) - (parseInt(self.state.imgBounds.height)/2));

            //console.log("x: " + (canMouseX - (canvasWidth * scaleAmount)) - (parseInt(self.state.imgBounds.width)/2));
            //console.log((canMouseY - (canvasHeight * scaleAmount)) - (parseInt(self.state.imgBounds.height)/2));
        }
    },

    getBounds: function(){

        var self = this;
        var context = self.state.context;
        var canvas = self.state.canvas;
        var w = parseInt(canvas.width);
        var h = parseInt(canvas.height);

            var idata = context.getImageData(0, 0, w, h),
                buffer = idata.data,
                buffer32 = new Uint32Array(buffer.buffer),
                x, y,
                x1 = w, y1 = h, x2 = 0, y2 = 0;

            // get left edge
            for(y = 0; y < h; y++) {
                for(x = 0; x < w; x++) {
                    if (buffer32[x + y * w] > 0) {
                        if (x < x1) x1 = x;
                    }
                }
            }

            // get right edge
            for(y = 0; y < h; y++) {
                for(x = w; x >= 0; x--) {
                    if (buffer32[x + y * w] > 0) {
                        if (x > x2) x2 = x;
                    }
                }
            }

            // get top edge
            for(x = 0; x < w; x++) {
                for(y = 0; y < h; y++) {
                    if (buffer32[x + y * w] > 0) {
                        if (y < y1) y1 = y;
                    }
                }
            }

            // get bottom edge
            for(x = 0; x < w; x++) {
                for(y = h; y >= 0; y--) {
                    if (buffer32[x + y * w] > 0) {
                        if (y > y2) y2 = y;
                    }
                }
            }

        return {width: x2-x1, height: y2-y1};
    },

    updateBottomCanvas: function(mode){

        var self = this;
        var imageObj = new Image();

        imageObj.onload = function() {
            self.state.bottomCanvasContext.drawImage(imageObj, 0, 0);
        };

        if (mode === "labeled"){
            imageObj.src = self.props.puzzlePiecesObj.labeled.src;
            self.props.updateHUDView(true);
            self.state.dropStatus = "correct";
        } else {
            if (self.state.dropStatus !== "hint") {
                imageObj.src = self.props.puzzlePiecesObj.hint.src;
                self.state.dropStatus = "hint";
            }
        }
    },

    render: function() {

        var canvasStyle = {position:'absolute', top:'0', left:'0', zIndex:'20'};
        return (
            <canvas width="768px" height="504px" id="puzzleMapDragCanvas" style={canvasStyle}>
            </canvas>
        )
    }
});

module.exports = PuzzleMapDnDView;


// var React = require('react');
// var DnDPuzzleView = require('../../../widgets/DragAndDropPuzzle/DnDPuzzleView');
// var PropTypes = React.PropTypes;
//
// var PuzzleMapDnDView = React.createClass({
//
//     getInitialState: function() {
//
//         return {
//             mediaPath: 'data/media/',
//             pointerOffset:{x:0, y:0}
//         }
//     },
//
//     propTypes: {
//
//         imageData: PropTypes.object.isRequired,
//         puzzlePiecesObj: PropTypes.object.isRequired,
//         scoreObj: PropTypes.object.isRequired,
//         updateHUDView: PropTypes.func.isRequired
//     },
//
//     componentWillMount: function() {
//     },
//
//     componentDidMount: function(){
//     },
//
//     prepDraggableData: function(){
//
//         var puzzlePiecesObj = this.props.puzzlePiecesObj;
//         //for (var key in puzzlePiecesObj) console.log(key + " --- " + puzzlePiecesObj[key]);
//         var draggableColl = [];
//         var imgUrl = this.state.mediaPath + puzzlePiecesObj.correctUrl;
//
//         var draggableStyle = {position:'absolute', width:'768px', height:'504px',
//             background: "url('"+imgUrl+"') no-repeat 100% 100%", zIndex:'20',
//             left:puzzlePiecesObj.offsetX * puzzlePiecesObj.scaleAmount+ "px",
//             top:puzzlePiecesObj.offsetY * puzzlePiecesObj.scaleAmount + "px",
//             MsTransform:'scale('+puzzlePiecesObj.scaleAmount+',' +puzzlePiecesObj.scaleAmount+')',
//             WebkitTransform:'scale('+puzzlePiecesObj.scaleAmount+',' +puzzlePiecesObj.scaleAmount+')',
//             transform:'scale('+puzzlePiecesObj.scaleAmount+',' +puzzlePiecesObj.scaleAmount+')',
//             MozTransform:'scale('+puzzlePiecesObj.scaleAmount+',' +puzzlePiecesObj.scaleAmount+')'
//         };
//
//         var draggableObj = {
//
//             id:"puzzleDraggable"+puzzlePiecesObj.index,
//             draggableStyle : draggableStyle,
//             imgUrl:imgUrl.src,
//             onDraggableBeginDrag: this.onDraggableBeginDrag,
//             onDraggableEndDrag: this.onDraggableEndDrag,
//             onDraggableWhileDrag: null,
//             draggableCanDragCond: null
//         };
//
//         draggableColl.push(draggableObj);
//
//         return draggableColl;
//     },
//
//     prepTargetData: function(){
//
//         var targetColl = [];
//
//         var targetStyle = {position:'absolute', width:'768px', height:'504px', zIndex:'19',
//             background:'transparent', top: "0", left: "0", zIndex:'19',
//             border:'1px solid #000'};
//
//         var targetObj = {
//             id:"puzzleTarget",
//             imgUrl:null,
//             targetStyle: targetStyle,
//             targetOverStyle: null,
//             onTargetDrop: this.onTargetDrop,
//             onTargetHover: this.onTargetHover,
//             targetCanDropCond: true
//         };
//
//         targetColl.push(targetObj);
//
//         return targetColl;
//     },
//
//     onPuzzleReady: function(draggableColl, targetColl){
//     },
//
//     onDraggableBeginDrag: function(itemObj, monitor, component){
//
//         this.props.updateHUDView(false);
//
//         var dragItem = component.getDOMNode();
//         dragItem.style.transform = "scale(1,1)";
//         dragItem.style.MsTransform = "scale(1,1)";
//         dragItem.style.WebkitTransform = "scale(1,1)";
//         dragItem.style.MozTransform = "scale(1,1)";
//         console.log("OffsetX: " + dragItem.style.left + " ------- " + "OffsetY: " + dragItem.style.top );
//
//
//     },
//
//     onDraggableEndDrag: function(itemObj, monitor, component){
//
//         var dragItem = component.getDOMNode();
//         dragItem.classList.add("puzzle-map-view-full-scale");
//         dragItem.style.transform = "scale(1,1)";
//         dragItem.style.MsTransform = "scale(1,1)";
//         dragItem.style.WebkitTransform = "scale(1,1)";
//         dragItem.style.MozTransform = "scale(1,1)";
//         console.log("OffsetX: " + dragItem.style.left + " ------- " + "OffsetY: " + dragItem.style.top );
//         if (monitor.getDropResult() && monitor.didDrop()) {
//
//             if (monitor.didDrop()) {
//
//                 // dragItem.style.top = (this.state.pointerOffset.y - parseInt(dragItem.style.height) / 2) + "px";
//                 // dragItem.style.left = (this.state.pointerOffset.x - parseInt(dragItem.style.width) / 2) + "px";
//
//                 dragItem.style.top = this.state.pointerOffset.y + "px";
//                 dragItem.style.left = this.state.pointerOffset.x + "px";
//                 //console.log("Move to X: " + dragItem.style.left + "  Y: " + dragItem.style.top);
//             }
//         }
//     },
//
//
//     draggableCanDragCond: function(itemObj){
//         //return true or false according to target
//         return true;
//     },
//
//     onTargetDrop: function(targetObj, monitor, component){
//     },
//
//     onTargetHover: function(targetObj, monitor, component){
//         var offset = monitor.getSourceClientOffset();
//
//         console.log("x: " + offset.x + "-------  y: "+ offset.y);
//         if (offset) this.setState({pointerOffset:{x:offset.x, y:offset.y}});
//     },
//
//     targetCanDropCond: function(targetObj){
//         //return true or false according to target
//     },
//
//     render: function() {
//
//         return (
//             <div>
//                 <DnDPuzzleView
//                     stageStyle           = {null}
//                     draggableColl        = {this.prepDraggableData()}
//                     stageTargetObj       = {null}
//                     targetsColl          = {this.prepTargetData()}
//                     onDraggableBeginDrag = {this.onDraggableBeginDrag}
//                     onDraggableEndDrag   = {this.onDraggableEndDrag}
//                     draggableCanDragCond = {null}
//                     onTargetDrop         = {this.onTargetDrop}
//                     onTargetHover        = {this.onTargetHover}
//                     targetCanDropCond    = {null}
//                     onPuzzleReady        = {this.onPuzzleReady}
//                 />
//             </div>
//         )
//     }
// });
//
// module.exports = PuzzleMapDnDView;