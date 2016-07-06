
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
            dropStatus:"",
            originalPointer:{left:0, top:0}
        }
    },

    propTypes: {
        
        puzzlePiecesObj: PropTypes.object.isRequired,
        scoreObj: PropTypes.object.isRequired,
        renderHUD: PropTypes.func.isRequired,
        updateHUDView: PropTypes.func.isRequired,
        updatePhase: PropTypes.func.isRequired
    },

    componentDidMount: function(){
        var self = this;

        var canvas = document.getElementById('puzzleMapDragCanvas');
        var context = canvas.getContext('2d');

        self.setState({context:context, canvas:canvas}, function(){
            this.prepDraggableData();
            this.prepBottomCanvas();
        });

        $("#puzzleMapDragCanvas").mousedown(function(e){self.handleMouseDown(e);});
        $("#puzzleMapDragCanvas").mousemove(function(e){self.handleMouseMove(e);});
        $("#puzzleMapDragCanvas").mouseup(function(e){self.handleMouseUp(e);});
        $("#puzzleMapDragCanvas").mouseout(function(e){self.handleMouseOut(e);});
    },

    prepDraggableData: function(){

        var self = this;
        var canvas = self.state.canvas;
        var context = self.state.context;
        var puzzlePiecesObj = self.props.puzzlePiecesObj;
        var imgUrl = self.state.mediaPath + puzzlePiecesObj.correctUrl;

        context.clearRect(0,0, parseInt(canvas.width), parseInt(canvas.height));

        var imageObj = new Image();

        imageObj.onload = function() {

            //get original map dim
            context.drawImage(imageObj,0,0);
            var imgBounds = {};
            imgBounds.width = self.getBounds().width;
            imgBounds.height = self.getBounds().height;

            context.clearRect(0,0, parseInt(canvas.width), parseInt(canvas.height));

            context.drawImage(imageObj,
                              puzzlePiecesObj.offsetX,
                              puzzlePiecesObj.offsetY,
                              parseInt(canvas.width) * puzzlePiecesObj.scaleAmount,
                              parseInt(canvas.height) * puzzlePiecesObj.scaleAmount
            );
        };

        imageObj.src = imgUrl;

        self.setState({dragImg:imageObj});
    },

    prepBottomCanvas: function(){

        var self = this;
            var canvas = document.getElementById('puzzleMapViewBottomCanvas');
            var context = canvas.getContext('2d');
            self.setState({bottomCanvas:canvas, bottomCanvasContext:context});
    },

    handleMouseDown: function(e){
        this.props.updateHUDView(false);
        this.setState({isDragging:true});
    },

    handleMouseUp: function(e){

        this.setState({isDragging:false});

        var self = this;
        var imgBounds = self.state.imgBounds;
        var canvasOffset=$("#puzzleMapDragCanvas").offset();
        var canMouseX=parseInt(e.clientX-canvasOffset.left);
        var canMouseY=parseInt(e.clientY-canvasOffset.top);
        var imgOffsetX = (canMouseX - imgBounds.left) - (parseInt(self.state.imgBounds.width)/2);
        var imgOffsetY = (canMouseY - imgBounds.top) - (parseInt(self.state.imgBounds.height)/2);
        if ((imgOffsetX >= -50 && imgOffsetX <= 50) && (imgOffsetY >= -50 && imgOffsetY <= 50)){
            self.updateBottomCanvas("labeled");
        }else self.updateBottomCanvas("hint");
    },

    handleMouseOut: function(e){
    },

    handleMouseMove: function(e){

        var self = this;
        var canvasOffset=$("#puzzleMapDragCanvas").offset();
        var canMouseX=parseInt(e.clientX-canvasOffset.left);
        var canMouseY=parseInt(e.clientY-canvasOffset.top);
        var imgBounds = self.state.imgBounds;

        var canvasWidth = parseInt(self.state.canvas.width);
        var canvasHeight = parseInt(self.state.canvas.height);

        if (self.state.isDragging){

            self.state.context.clearRect(0,0, canvasWidth, canvasHeight);
            self.state.context.drawImage(self.state.dragImg,
                (canMouseX - imgBounds.left) - (parseInt(self.state.imgBounds.width)/2),
                (canMouseY - imgBounds.top) - (parseInt(self.state.imgBounds.height)/2));
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

        var imgBounds = {width: x2-x1, height: y2-y1, top: y1, left: x1};
        this.setState({imgBounds:imgBounds});
        return imgBounds;
    },

    updateBottomCanvas: function(mode){

        var self = this;
        var imageObj = new Image();

        imageObj.onload = function() {
            self.state.bottomCanvasContext.drawImage(imageObj, 0, 0);
        };

        if (mode === "labeled"){
            imageObj.src = self.props.puzzlePiecesObj.labeled.src;
            self.state.dropStatus = "correct";

            if (parseInt(self.props.scoreObj.currentIndex) < parseInt(self.props.scoreObj.totalPieces) - 1) {
                self.props.renderHUD();
                self.prepDraggableData();
            }else{
                self.props.updatePhase("finished");
            }
            
        } else {
            if (self.state.dropStatus !== "hint") {
                imageObj.src = self.props.puzzlePiecesObj.hint.src;
                self.state.dropStatus = "hint";
            }
        }
    },

    render: function() {

        {this.props.resetBottomCanvas ? this.resetBottomCanvas():null}

        var canvasStyle = {position:'absolute', top:0, left:0, zIndex:'20'};
        return (
            <canvas width="768px" height="504px" id="puzzleMapDragCanvas" style={canvasStyle}>
            </canvas>
        )
    }
});

module.exports = PuzzleMapDnDView;