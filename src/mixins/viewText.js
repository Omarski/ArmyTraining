var viewTextMixin = {
    parseBullets: function(str) {
        var hasBullet = (str.indexOf('-') === 0);

        if (hasBullet) {
            str = str.replace('-', '<span class="info-view-bullet-item"></span>'); // first dash
            str = str.replace(new RegExp('- ', 'g'), '<br/><span class="info-view-bullet-item"></span>');
        }
        return str;
    }
};