/***********************
* Adobe Edge Animate Composition Actions
*
* Edit this file with caution, being careful to preserve 
* function signatures and comments starting with 'Edge' to maintain the 
* ability to interact with these actions from within Adobe Edge Animate
*

(function($, Edge, compId){
var Composition = Edge.Composition, Symbol = Edge.Symbol; // aliases for commonly used Edge classes

   //Edge symbol: 'stage'
   (function(symbolName) {
      
      
      

      

      

      

      Symbol.bindElementAction(compId, symbolName, "document", "compositionReady", function(sym, e) {
         
         var compId = sym.getComposition().getCompId();
         console.log(compId);
         symArray = [];
         var symdex=0;
         var videx= 0;
         var sym_Name = new Array;
         var vid_Name = new Array;
         charArray1= new Array;
         charArray2= new Array;
         function loadTxt(){
         	console.log("start loadTxt...");
         	return $.ajax({
         		url:'data/content/Scenario_Info.txt',
         		dataType:'text',
         		success:function(data){
         			//alert('load success');
         			//console.log("here is the file "+data);
         			var lines = data.split("\n");
         			for(var i=0; i<lines.length;i++){
         				if(lines[i]!=" "){
         					firstWord = lines[i].slice(0, lines[i].indexOf(" "));
         					if(sym.getSymbol(firstWord)){
         						sym_Name.push(firstWord);
         						console.log(sym_Name[symdex]+" is a symbol!");
         					}
         					if(sym.getSymbol(sym_Name[symdex])){
         						if(sym.getSymbol(sym_Name[symdex]).$(firstWord)[0]){
         							vid_Name.push(firstWord);
         							//console.log("symdex = "+symdex);
         							symdex++;
         							console.log(vid_Name[videx]+" is a video!");
         							videx++;
         						}
         					}else if (firstWord!=""){
         							var after1stWord =  lines[i].slice(firstWord.length+1);
         							if(symdex==1){
         								charArray1[firstWord] = after1stWord.slice(0, after1stWord.indexOf(" "));
         								var after2ndWord =  after1stWord.slice(charArray1[firstWord].length+1);
         								charArray1[firstWord] = [charArray1[firstWord], after2ndWord.slice(0, after2ndWord.indexOf(" "))];
         								console.log(firstWord+": "+charArray1[firstWord][0]+" "+charArray1[firstWord][1]);
         							}
         							if(symdex==2){
         								charArray2[firstWord] = after1stWord.slice(0, after1stWord.indexOf(" "));
         								var after2ndWord =  after1stWord.slice(charArray2[firstWord].length+1);
         								charArray2[firstWord] = [charArray2[firstWord], after2ndWord.slice(0, after2ndWord.indexOf(" "))];
         								console.log(firstWord+": "+charArray2[firstWord][0]+" "+charArray2[firstWord][1]);
         							}		
         					}
         				}
         
         			}
         			//console.log(lines);
         			firstSymbol = data.slice(0, data.indexOf(" "));
         		},
         	error:function(e){
         		alert('txt load error')
         	}
         });
         };
         
         //loadTxt();
         
         $.when(loadTxt()).done(function(){  //hmm this not working unless "return" line 12

         //charArray1 = {
         //	"Soraya_No":["Soraya1","Soraya2"],
         //	"Soraya_Idle":["Soraya2","Soraya3"],
         //	"Soraya_Nod":["Soraya3","Soraya4"],
         //	"Soraya_Yes":["Soraya4","Soraya5"]
         //}
         //charArray2 = {
         //	"Zhang_Yes":["Zhang1","Zhang2"],
         //	"Zhang_No":["Zhang2","Zhang3"],
         //	"Zhang_Idle":["Zhang3","Zhang4"],
         //	"Zhang_Beat":["Zhang4","Zhang5"]
         //}
         console.log(Object.keys(charArray1).length);
         
         for(var i=0;i<Object.keys(charArray1).length;i++){
         	var aKey = Object.keys(charArray1)[i];
         	console.log(charArray1[aKey][0]);
         	var dButton_sym = sym.createChildSymbol("Z_btn_1","Stage");
         	symArray.push(dButton_sym);
         	var b_sym = sym.getSymbol("dButton_sym");
         	dButton_sym.getSymbolElement().css({
         		 "top": 30+(i*25)+"px",
         		 "position":"absolute",
         		 "left": 20+"px",
         		 "cursor":"hand",
         		 "cursor":"pointer"
         	});
         
         	dButton_sym.$("Text").html(Object.keys(charArray1)[i]);
         	sym.$(dButton_sym.getSymbolElement()).attr('id',aKey);
         	var symId = sym.$(symArray[i].getSymbolElement()).attr('id');
         
         	console.log(symArray[i].name+" is sym.name");
         	console.log(symId+" is id");
         	console.log(sym.lookupSelector(sym.getSymbolTypeName(dButton_sym[i])));
         	console.log(dButton_sym.getSymbolElement());
         
         	console.log(symId);
         
         }
         for(var i=0;i<Object.keys(charArray2).length;i++){
         	var aKey = Object.keys(charArray2)[i];
         	var dButton_sym = sym.createChildSymbol("Z_btn_1","Stage");
         	symArray.push(dButton_sym);
         	var b_sym = sym.getSymbol("dButton_sym");
         	dButton_sym.getSymbolElement().css({
         		 "top": 30+(i*25)+"px",
         		 "position":"absolute",
         		 "right": 20+"px",
         		 "cursor":"hand",
         		 "cursor":"pointer"
         	});
         	dButton_sym.$("Text").html(Object.keys(charArray2)[i]);
         	sym.$(dButton_sym.getSymbolElement()).attr('id',aKey);
         	var symId = sym.$(symArray[i].getSymbolElement()).attr('id');
         }
         
         Symbol.bindElementAction(compId, "Z_btn_1", "clickable", "click", function(sym, e){
         		console.log("it click "+sym.getSymbolElement().attr('id'));
         		var animKey = sym.getSymbolElement().attr('id');
         		if(animKey in charArray1){
         			console.log(charArray1[animKey][0]);
         			var pos = sym.getComposition().getStage().getSymbol(sym_Name[0]).getLabelPosition(charArray1[animKey][0])/1000;
         			pauseLabel = sym.getComposition().getStage().getSymbol(sym_Name[0]).getLabelPosition(charArray1[animKey][1])/1000;
         			sym.getComposition().getStage().getSymbol(sym_Name[0]).$(vid_Name[0])[0].currentTime = pos;
         			sym.getComposition().getStage().getSymbol(sym_Name[0]).$(vid_Name[0])[0].play();
         		}else if(animKey in charArray2){
         			console.log(charArray2[animKey][0]);
         			var pos = sym.getComposition().getStage().getSymbol(sym_Name[1]).getLabelPosition(charArray2[animKey][0])/1000;
         			pauseLabel = sym.getComposition().getStage().getSymbol(sym_Name[1]).getLabelPosition(charArray2[animKey][1])/1000;
         			sym.getComposition().getStage().getSymbol(sym_Name[1]).$(vid_Name[1])[0].currentTime = pos;
         			sym.getComposition().getStage().getSymbol(sym_Name[1]).$(vid_Name[1])[0].play();
         		}
         	});
         console.log("name values "+sym_Name[0]+" "+sym_Name[1]+" "+vid_Name[0]+" "+vid_Name[1]);
         video1 = sym.getSymbol(sym_Name[0]).$(vid_Name[0])[0];
         video2 = sym.getSymbol(sym_Name[1]).$(vid_Name[1])[0];
         
         pauseLabel = 0.5;
         
         video1.addEventListener("timeupdate", function() { 
         	if(video1.currentTime>=pauseLabel) { 
         		video1.pause();
         	 } 
         });
         video2.addEventListener("timeupdate", function() { 
         	if(video2.currentTime>=pauseLabel) { 
         		video2.pause();
         	 } 
         });
         });

      });
      //Edge binding end

      

      

      

      

      

      

      Symbol.bindTriggerAction(compId, symbolName, "Default Timeline", 0, function(sym, e) {
         // insert code here
      });
      //Edge binding end

   })("stage");
   //Edge symbol end:'stage'

   //=========================================================
   
      //Edge symbol: 'BgSymbol'
   (function(symbolName) {   
   
      

   })("BgSymbol");
   //Edge symbol end:'BgSymbol'

   //=========================================================
   
   //Edge symbol: 'ZhangSymbol'
   (function(symbolName) {   
   
      

   })("ZhangSymbol");
   //Edge symbol end:'ZhangSymbol'

   //=========================================================
   
   //Edge symbol: 'SorayaSymbol'
   (function(symbolName) {   
   
   })("SorayaSymbol");
   //Edge symbol end:'SorayaSymbol'

   //=========================================================
   
   //Edge symbol: 'Yes_btn_4'
   (function(symbolName) {   
   
      Symbol.bindTriggerAction(compId, symbolName, "Default Timeline", 0, function(sym, e) {
         // insert code here
      });
      //Edge binding end

      })("Z_btn_1");
   //Edge symbol end:'Z_btn_1'

})(window.jQuery || AdobeEdge.$, AdobeEdge, "EDGE-20743566");

 ***********************/