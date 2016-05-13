
var PreloadImagesMixin = {

    preloadImages: function(imagesColl){

        this.setState({loadCounter:0, totalImages:imagesColl.length, loadedImageColl:[]});

        for (var i=0 ; i < imagesColl.length; i++){
             this.state.loadedImageColl[i] = new Image();
             this.state.loadedImageColl[i].src = imagesColl[i];
             this.state.loadedImageColl[i].onload = this.loadCounter;
        }
    },

    loadCounter: function(){
        this.state.loadCounter++;
        if (this.state.loadCounter == this.state.totalImages){
            this.onImagesPreloaded();
        }
    }
};