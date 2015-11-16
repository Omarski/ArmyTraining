var AGeneric;
AGeneric = function () {

    // return a string after removing all escaped and special characters
    var purgeString = function(text) {
        var result = "";
        for (var i = 0; i < text.length; i++) {
            if (text.charAt(i) == "\\") {
                i++;
            }else{
                result += text.charAt(i);
            }
                    //var hex = text.charCodeAt(i).toString(16);
                    //console.log(("000"+hex).slice(-4));
        }
        return result.replace(/[!,?.\s\u3002\uFF0C]/g, "");
    };

    // return out the hexcode/unicode of each character of a string
    var strTest = function(text){
        var hex, i;

        var result = "";
        for (i=0; i<text.length; i++) {
            hex = text.charCodeAt(i).toString(16);
            result += ("000"+hex).slice(-4);
            result += " ";
        }

        return result
    };

    var incorrectResponse = function(){
        var randomNumber = Math.floor(Math.random()*5);
        var choices = ["Let's try that one again.",
                        "That's not quite right.",
                        "Keep trying.",
                        "Not quite.",
                        "I'm sorry, but that is not correct."];

        return choices[randomNumber];
    };

    var correctResponse = function(){
        var randomNumber = Math.floor(Math.random()*4);
        var choices = ["Great job!",
            "Outstanding!",
            "That's exactly right.",
            "Well done!"];

        return choices[randomNumber];
    };

    var shuffle = function(array) {
        var currentIndex = array.length, temporaryValue, randomIndex ;
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    }

    return {
        purgeString: purgeString,
        strTest: strTest,
        incorrectResponse: incorrectResponse,
        correctResponse: correctResponse,
        shuffle: shuffle
    };
};