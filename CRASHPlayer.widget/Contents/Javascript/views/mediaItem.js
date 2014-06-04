var MediaItemView = new KONtx.Class({
    ClassName: 'MediaItemView',
    
    Extends: KONtx.system.FullscreenView,
    
    initView: function() {
        Logger.debug('Init MediaItem view');
    },
    
    _base: 'mediaItem.',

    //This is hack to work around a framework limitation that causes views
    //to not be refreshed correctly if the exit button on the remote is used to exit
    //to the dock.
    _stale: false,

    
    createView: function() {
        
        var ctrls = this.controls;
        
        ctrls.background = new KONtx.element.Container({  
            guid: this._base + 'ctrls.background',
            id: this._base + 'ctrls.background',
            styles: {  
                width: this.width,
                height: this.height,
                vOffset: 0,
                hOffset: 0,
                backgroundColor: '#111111',
                opacity: 1
            }
        }).appendTo(this);

        ctrls.backdropImage = new KONtx.element.Image({
//            loadingSrc: 'Assets/960x540/SectionLoading.png',
            missingSrc: 'Assets/960x540/empty.png',
            guid: this._base + 'ctrls.backdropImage',
            id: this._base + 'ctrls.backdropImage',
            styles: {
                width:  ctrls.background.width - 40,
                height: ctrls.background.height -40,
                vAlign: 'center',
                hAlign: 'center',
                opacity: 0.9
            }
        }).appendTo(ctrls.background);

        ctrls.detailBackground = new KONtx.element.Container({
            guid: this._base + 'ctrls.detailBackground',
            id: this._base + 'ctrls.detailBackground',
            styles: {
                width: 850,
                height: 450,
                vAlign: 'center',
                hAlign: 'center',
                backgroundColor: '#111111',
                opacity: 0.8
            }
        }).appendTo(ctrls.background);

        ctrls.thumb = new KONtx.element.Image({
            guid: this._base + 'ctrls.thumb',
            id: this._base + 'ctrls.thumb',
            loadingSrc: 'Assets/960x540/ThumbLoading.png',
            missingSrc: 'Assets/960x540/ThumbMissing.png',
            styles: {
                width: Config.THUMBWIDTH,
                vOffset: 65,
                hOffset: 75
            }
        }).appendTo(ctrls.background);

        
        ctrls.progressBack = new KONtx.element.Container({
            guid: this._base + 'ctrls.progressBack',
            id: this._base + 'ctrls.progressBack',
            styles: {  
                width: Config.THUMBWIDTH,
                height: 9,
                vOffset: 56 + Config.THUMBHEIGHT,
                hOffset: 75,
                backgroundColor: '#111111',
                opacity: 0.6,
                visible: false
            }
        }).appendTo(ctrls.background);

        ctrls.progressBar = new KONtx.element.Image({
            styles: {
                width: Config.THUMBWIDTH,
                vOffset: 56 + Config.THUMBHEIGHT + 2,
                height: 5,
                hOffset: 75,
                src: 'Assets/960x540/Progress.png',
                visible: false,
                fillMode: 'tile'
            }
        }).appendTo(ctrls.background);

        ctrls.seasonEpisodeBack = new KONtx.element.Container({
            guid: this._base + 'ctrls.progressBack',
            id: this._base + 'ctrls.progressBack',
            styles: {
                width: Config.THUMBWIDTH + 10,
                height: 30,
                vOffset: 36 + Config.THUMBHEIGHT - 10,
                hOffset: 70,
                backgroundColor: '#111111',
                opacity: 0.4,
                visible: false
            }
        }).appendTo(ctrls.background);

        ctrls.seasonEpisode = new KONtx.element.Text({
            styles: {
                vOffset: 36 + Config.THUMBHEIGHT - 10,
                hOffset: 70,
                padding: 4,
                height: 30,
                fontSize: 16,
                fontFamily:'Helvetica',
                fontWeight: 'Bold',
                opacity: 0.9,
                color: 'white',
                width: Config.THUMBWIDTH + 10,
                visible: false,
                textAlign: 'left'
            }
        }).appendTo(ctrls.background);

        
        ctrls.mediaTitle = new KONtx.element.Text({
            guid: this._base + 'ctrls.mediaTitle',
            id: this._base + 'ctrls.mediaTitle',
            truncation: 'end',
            styles: {
                fontSize: 26,
                fontFamily:'Helvetica',
                fontWeight: 'Bold',
                opacity: 0.8,
                color: 'white',
                hAlign: 'left',
                vOffset: 65,
                hOffset: 245,
                width: 640
            }
        }).appendTo(ctrls.background);

        ctrls.mediaDuration = new KONtx.element.Text({
            guid: this._base + 'ctrls.mediaDuration',
            id: this._base + 'ctrls.mediaDuration',
            styles: {
                fontSize: 16,
                fontFamily:'Helvetica',
                opacity: 0.8,
                color: 'white',
                hAlign: 'left',
                vOffset: 100,
                hOffset: 245,
                width: 300
            }
        }).appendTo(ctrls.background);

        ctrls.mediaTagline = new KONtx.element.Text({
            guid: this._base + 'ctrls.mediaTagLine',
            id: this._base + 'ctrls.mediaTagLine',
            styles: {
                fontSize: 18,
                fontFamily:'Helvetica',
                fontWeight: 'Bold',
                opacity: 0.8,
                color: '#BBBBBB',
                hAlign: 'left',
                vOffset: 150,
                hOffset: 245,
                width: 500
            }
        }).appendTo(ctrls.background);
        
        ctrls.mediaSummary = new KONtx.element.Text({
            guid: this._base + 'ctrls.mediaSummary',
            id: this._base + 'ctrls.mediaSummary',
            wrap: true,
            truncation: 'end',
            styles: {
                fontSize: 18,
                fontFamily:'Helvetica',
                opacity: 0.8,
                color: 'white',
                hAlign: 'left',
                vOffset: 310,
                hOffset: 75,
                width: 800,
                height: 100
            }
        }).appendTo(ctrls.background);
        

        ctrls.contentRating = new KONtx.element.Image({
            guid: this._base + 'contentRating',
            id: this._base + 'contentRating',
//            loadingSrc: 'Assets/960x540/SmallLoading.png',
            missingSrc: 'Assets/960x540/empty.png',
            styles: {
                vOffset: 65,
                hOffset: ctrls.detailBackground.width - 5,
                opacity: 1
            }
        }).appendTo(ctrls.background);
        
        ctrls.videoResolution = new KONtx.element.Image({
            guid: this._base + 'videoResolution',
            id: this._base + 'videoResolution',
//            loadingSrc: 'Assets/960x540/SmallLoading.png',
            missingSrc: 'Assets/960x540/empty.png',
            styles: {
                vOffset: 260,
                hOffset: ctrls.thumb.outerWidth + 10,
                opacity: 1
            }
        }).appendTo(ctrls.background);

        ctrls.videoCodec = new KONtx.element.Image({
            guid: this._base + 'videoCodec',
            id: this._base + 'videoCodec',
//            loadingSrc: 'Assets/960x540/SmallLoading.png',
            missingSrc: 'Assets/960x540/empty.png',
            styles: {
                vOffset: 260,
                hOffset: ctrls.thumb.outerWidth + 65,
                opacity: 1
            }
        }).appendTo(ctrls.background);

        ctrls.videoFramerate = new KONtx.element.Image({
            guid: this._base + 'videoFramerate',
            id: this._base + 'videoFramerate',
//            loadingSrc: 'Assets/960x540/SmallLoading.png',
            missingSrc: 'Assets/960x540/empty.png',
            styles: {
                vOffset: 260,
                hOffset: ctrls.thumb.outerWidth + 120,
                opacity: 1
            }
        }).appendTo(ctrls.background);

        ctrls.audioCodec = new KONtx.element.Image({
            guid: this._base + 'audioFramerate',
            id: this._base + 'audioFramerate',
//            loadingSrc: 'Assets/960x540/SmallLoading.png',
            missingSrc: 'Assets/960x540/empty.png',
            styles: {
                vOffset: 260,
                hOffset: ctrls.thumb.outerWidth + 175,
                opacity: 1
            }
        }).appendTo(ctrls.background);

        ctrls.audioChannels = new KONtx.element.Image({
            guid: this._base + 'audioChannels',
            id: this._base + 'audioChannels',
//            loadingSrc: 'Assets/960x540/SmallLoading.png',
            missingSrc: 'Assets/960x540/empty.png',
            styles: {
                vOffset: 260,
                hOffset: ctrls.thumb.outerWidth + 230,
                opacity: 1
            }
        }).appendTo(ctrls.background);
        
        ctrls.backButton = new KONtx.control.TextButton({
            label: $_('back_button_label'),
            guid: this._base + 'ctrls.backButton',
            id: this._base + 'ctrls.backButton',
            events: {
                onSelect: function() { KONtx.application.previousView(); }
            },
            styles: {
                width: KONtx.utility.scale(45),
                height: KONtx.utility.scale(45),
                vOffset: 410,
                hOffset: 75,
                fontSize: 16,
                fontFamily:'Helvetica',
                fontWeight: 'Bold',
                opacity: 0.8,
                color: 'white',
                backgroundColor: 'black',
                truncation: 'end'
            },
            textStyles: {
                hAlign: 'center',
                vAlign: 'center'
            }
        }).appendTo(ctrls.background);

        ctrls.playMedia = new KONtx.control.TextButton({
            label: $_('play_button_label'),
            guid: this._base + 'playMedia',
            id: this._base + 'playMedia',
            events: {
                onSelect: (this._onSelectPlayButton).bindTo(this)
            },
            styles: {
                width: KONtx.utility.scale(100),
                height: KONtx.utility.scale(40),
                vOffset: 410,
                fontSize: 16,
                fontFamily:'Helvetica',
                fontWeight: 'Bold',
                opacity: 0.8,
                color: 'white',
                backgroundColor: 'black',
                truncation: 'end',
                hAlign: 'center'
            },
            textStyles: {
                hAlign: 'center',
                vAlign: 'center'
            }
        }).appendTo(ctrls.background);


        ctrls.markWatched = new KONtx.control.TextButton({
            label: $_('mark_watched_label'),
            guid: this._base + 'markWatched',
            id: this._base + 'markWatched',
            events: {
                onSelect: (this._onSelectMarkWatchedButton).bindTo(this)
            },
            styles: {
                width: KONtx.utility.scale(120),
                height: KONtx.utility.scale(40),
                vOffset: 410,
                fontSize: 14,
                fontFamily:'Helvetica',
//                fontWeight: 'Bold',
                opacity: 0.8,
                color: 'white',
                backgroundColor: 'black',
                truncation: 'end',
                hOffset: 620
            },
            textStyles: {
                hAlign: 'center',
                vAlign: 'center'
            }
        }).appendTo(ctrls.background);

        ctrls.markUnwatched = new KONtx.control.TextButton({
            label: $_('mark_unwatched_label'),
            guid: this._base + 'markUnwatched',
            id: this._base + 'markUnwatched',
            events: {
                onSelect: (this._onSelectMarkUnwatchedButton).bindTo(this)
            },
            styles: {
                width: KONtx.utility.scale(120),
                height: KONtx.utility.scale(40),
                vOffset: 410,
                fontSize: 14,
                fontFamily:'Helvetica',
//                fontWeight: 'Bold',
                opacity: 0.8,
                color: 'white',
                backgroundColor: 'black',
                truncation: 'end',
                hOffset: 760
            },
            textStyles: {
                hAlign: 'center',
                vAlign: 'center'
            }
        }).appendTo(ctrls.background);
        
        this.controls.networkError = new KONtx.element.Image({
            styles: {
                visible: false,
                src: 'Assets/960x540/serverError.png',
                hOffset: this.width - 80,
                vOffset: 10
            }
        }).appendTo(this);

    },

    
    focusView: function() {
        Logger.debug( 'Setting Focus' );
        var timer1;

        //Hack to work around bug that keeps focus from working for the first load
        timer1 = KONtx.utility.timer.setTimeout( (function(){
            KONtx.utility.timer.clearTimeout(timer1);

            this.controls.playMedia.focus();
        }).bindTo(this), 1);

    },
    
    _resetView: function() {
        this.controls.background.hide();
        this.controls.networkError.hide();
        this.controls.markWatched.hide();
        this.controls.markUnwatched.hide();
        this.controls.playMedia.focus();
        
    },

    updateView: function() {
        Logger.debug( 'Updating Media Item View' );
        var checkFiles;

        KONtx.utility.LoadingOverlay.on();
        this._stale = false;
        
        this._resetView();
        PlexService.abortRequest();
        this._registerHandlers();

        
        //If type = clip, don't check files
        checkFiles = this.persist.type !== 'clip';
        
        PlexService.getMediaMetadata({
            mediaKey: this.persist.mediaKey,
            callback: (this._updateMediaItem).bindTo(this),
            checkFiles: checkFiles,
            makeCurrentMedia: true,
            errorCallback: (this._errorMediaItem).bindTo(this)
        });

    },

    _errorMediaItem: function() {
        //This hack is in case PMS is down when we try to PLAY from this screen. When we return, we don't want it to go back a second time when the lookup fails.
        if ( this.persist.mediaKey === this.persist.holdMediaKey) {
            this.controls.background.show();
            return;
        }
        if (!this.controls.background.visible) {
            KONtx.application.previousView();
        }
    },

    _updateMediaItem: function() {
        Logger.debug( 'UpdateMediaItem');
        var ctrls, media, thumbImage, artImage, videoResolution, videoCodec, videoFramerate, audioCodec, audioChannels,
            contentRating, mediaChild, mediaTagPrefix, mediaTagVersion, progressWidth, seasonEpisode;
        
        ctrls = this.controls;
        media = PlexService.getCurrentMediaVideoTag();
        mediaChild = PlexService.getCurrentMediaMediaTag(0);
        mediaTagPrefix = PlexService.getCurrentMedia().mediaTagPrefix;
        mediaTagVersion = PlexService.getCurrentMedia().mediaTagVersion;

        this.persist.holdMediaKey = this.persist.mediaKey;

        if ( media.art ) {
            artImage = PlexService.generateImageURL(media.art, ctrls.background.width - 40, ctrls.background.height - 40, 'jpg' );
        }
        else if ( PlexService.getCurrentMedia().art) {
            artImage = PlexService.generateImageURL(PlexService.getCurrentMedia().art, ctrls.background.width - 40, ctrls.background.height - 40, 'jpg' );
        }
        else {
            artImage = null;
        }

        if (artImage !== ctrls.backdropImage.src) {
            ctrls.backdropImage.src = artImage;
        }
        
        thumbImage = PlexService.generateImageURL(media.thumb, Config.THUMBWIDTH, Config.THUMBHEIGHT, 'jpg' );
        if (ctrls.thumb.src !== thumbImage){
            ctrls.thumb.src = thumbImage;
        }

        ctrls.mediaTitle.data = media.grandparentTitle
            ? media.grandparentTitle + ': ' + media.title
            : media.title;

        ctrls.mediaDuration.data = media.viewOffset
            ? $_('played_duration', Utility.millisecondsToTime(media.viewOffset, true), Utility.millisecondsToTime(media.duration, true))
            : Utility.millisecondsToTime(media.duration, true);

        ctrls.mediaTagline.data = media.tagline;
        ctrls.mediaSummary.data = media.summary;
        
        
        //Wrapping in a timer with a 1 ms delay. This forces this to drop to the back of javascript
        //  thread/process queue so that GC jobs get a chance to run in the middle of some more
        //  processor intensive operations to avoid overrunning memory and crashing the app. 
        KONtx.utility.timer.setTimeout( function(){

            if (media.viewOffset) {
                progressWidth = (media.viewOffset / media.duration) * Config.THUMBWIDTH;
                ctrls.progressBar.setStyle('width', progressWidth);
                ctrls.progressBar.setStyle('opacity', 1);
                ctrls.progressBar.show();
                ctrls.progressBack.show();
            }
            else if (media.viewCount && parseInt(media.viewCount, 10) > 0 ) {
                ctrls.progressBar.setStyle('width', Config.THUMBWIDTH);
                ctrls.progressBar.setStyle('opacity', 0.3);
                ctrls.progressBar.show();
                ctrls.progressBack.show();
            }
            else {
                ctrls.progressBar.hide();
                ctrls.progressBack.hide();
            }
        }, 1);
        
        if (media.index && $contains( media.type, Config.VIDEOMEDIATYPES) ) {
            seasonEpisode = $_('episode_letter') + media.index;
            if (media.parentIndex) {
                seasonEpisode = $_('season_letter') + media.parentIndex + seasonEpisode;
            }
            ctrls.seasonEpisode.setText(seasonEpisode);
            ctrls.seasonEpisode.show();
            ctrls.seasonEpisodeBack.show();
        }
        else {
            ctrls.seasonEpisode.hide();
            ctrls.seasonEpisodeBack.hide();
        }
        
        
        contentRating = null;
        videoResolution = null;
        videoCodec = null;
        videoFramerate = null;
        audioCodec = null;
        audioChannels = null;

        if (media.contentRating){
            contentRating = PlexService.generateImageURL(mediaTagPrefix + 'contentRating/' + media.contentRating + '?t=' + mediaTagVersion, 40,  40, 'png' );
        }

        if (mediaChild.videoResolution) {
            videoResolution = PlexService.generateImageURL(mediaTagPrefix + 'videoResolution/' + mediaChild.videoResolution + '?t=' + mediaTagVersion, 40,  40, 'png' );
        }

        if (mediaChild.videoCodec) {
            videoCodec = PlexService.generateImageURL(mediaTagPrefix + 'videoCodec/' + mediaChild.videoCodec + '?t=' + mediaTagVersion, 40,  40, 'png' );
        }

        if (mediaChild.videoFrameRate) {
            videoFramerate = PlexService.generateImageURL(mediaTagPrefix + 'videoFrameRate/' + mediaChild.videoFrameRate + '?t=' + mediaTagVersion, 40,  40, 'png' );
        }

        if (mediaChild.audioCodec) {
            audioCodec = PlexService.generateImageURL(mediaTagPrefix + 'audioCodec/' + mediaChild.audioCodec + '?t=' + mediaTagVersion, 40,  40, 'png' );
        }

        if (mediaChild.audioChannels) {
            audioChannels = PlexService.generateImageURL(mediaTagPrefix + 'audioChannels/' + mediaChild.audioChannels + '?t=' + mediaTagVersion, 40,  40, 'png' );
        }

        //Wrapping in a timer with a 1 ms delay. This forces this to drop to the back of javascript
        //  thread/process queue so that GC jobs get a chance to run in the middle of some more
        //  processor intensive operations to avoid overrunning memory and crashing the app. 
        KONtx.utility.timer.setTimeout( function(){
            ctrls.contentRating.src = contentRating;
            ctrls.videoResolution.src = videoResolution;
            ctrls.videoCodec.src = videoCodec;
            ctrls.videoFramerate.src = videoFramerate;
            ctrls.audioCodec.src = audioCodec;
            ctrls.audioChannels.src = audioChannels;
        }, 1);

        if (!PlexService.useChannels) {
            if (media.viewOffset) {
                ctrls.markUnwatched.show();
                ctrls.markWatched.show();
            }
            else if (media.viewCount && parseInt(media.viewCount, 10) > 0 ) {
                ctrls.markUnwatched.show();
            }
            else {
                ctrls.markWatched.show();
            }
        }

        ctrls.playMedia.focus();
        ctrls.background.show();

        KONtx.utility.LoadingOverlay.off();

    },

    
    _registerHandlers: function() {
        if( this._boundApplicationHandler ) {
            this._unregisterHandlers();
        }
        this._boundApplicationHandler = this._applicationDispatcher.subscribeTo(KONtx.application, [ 'onWidgetKeyPress' ], this);
        
        PlexService.addStateChangeListener( (this._onPlexServiceStateChange).bindTo(this), this.ClassName );
    },

    _unregisterHandlers: function() {
        if( this._boundApplicationHandler ) {
            this._boundApplicationHandler.unsubscribeFrom(KONtx.application, [ 'onWidgetKeyPress' ] );
            this._boundApplicationHandler = null;
        }
        PlexService.removeStateChangeListener( this.ClassName );
    },

    _onPlexServiceStateChange: function(event) {
        Logger.debug( 'Caught PlexService state change: ' + event.newState );
        var ctrls;
        
        ctrls = this.controls;

        switch (event.newState) {
            case Config.STATE_READY:
                ctrls.networkError.hide();
                break;

            case Config.STATE_ERR:

            case Config.STATE_TIMEOUT:

            default:
                ctrls.networkError.show();
                break;
        }
    },

    _applicationDispatcher: function(event) {
        var map, keyCode, payload;

        payload = event.payload;

        switch(event.type) {
            case 'onWidgetKeyPress':
                map = KONtx.utility.KeyHandler.map;
                keyCode = payload.keyCode;

                if ( payload.eventPhase == 3 && Array.contains(keyCode, [map.STOP, map.PAUSE, map.REWIND, map.FORWARD] ) ) {
                    event.preventDefault();
                }
                else if ( payload.eventPhase == 3 && (keyCode === map.PLAY || keyCode === 406 ) ) {
                    event.preventDefault();
                    if (keyCode === 406) {
                        Utility.skipAuto = true;
                    }
                    this._onSelectPlayButton();
                }
                break;
            }
    },

    selectView: function() {
        this._registerHandlers();

        if ( PlexService.state !== Config.STATE_READY ) {
            this.controls.networkError.show();
        }
        else {
            this.controls.networkError.hide();
        }

        if ( this._stale ) {
            KONtx.HostEventManager.send("simulateFakeLoadView");
            return;
        }
    },


    unselectView: function() {
        this._unregisterHandlers();
    },

    hideView: function() {
        this._resetView();
        this._unregisterHandlers();

        this._stale = true;
    },
    
    _onSelectPlayButton: function() {
        Utility.prePlayMovie();
    },

    _onSelectMarkUnwatchedButton: function() {
        PlexService.scrobble(PlexService.getCurrentMediaVideoTag().ratingKey, false, (this._scrobbleDone).bindTo(this));
    },
    
    _onSelectMarkWatchedButton: function() {
        PlexService.scrobble(PlexService.getCurrentMediaVideoTag().ratingKey, true, (this._scrobbleDone).bindTo(this));
    },

    _scrobbleDone: function() {
        Logger.debug('Finished Scrobble. Reloading');
//        KONtx.HostEventManager.send("simulateFakeLoadView");

        PlexService.getMediaMetadata({
            mediaKey: this.persist.mediaKey,
            callback: (this._updateScrobbleButtons).bindTo(this),
            checkFiles: true,
            makeCurrentMedia: true,
        });
        
    },
    
    _updateScrobbleButtons: function() {
        var ctrls, media;
        
        ctrls = this.controls;
        ctrls.markUnwatched.hide();
        ctrls.markWatched.hide();
        
        media = PlexService.getCurrentMediaVideoTag();

        
        ctrls.mediaDuration.data = media.viewOffset
            ? $_('played_duration', Utility.millisecondsToTime(media.viewOffset, true), Utility.millisecondsToTime(media.duration, true))
            : Utility.millisecondsToTime(media.duration, true);

        if (media.viewOffset) {
            ctrls.markUnwatched.show();
            ctrls.markWatched.show();
        }
        else if (media.viewCount && parseInt(media.viewCount, 10) > 0 ) {
            ctrls.markUnwatched.show();
        }
        else {
            ctrls.markWatched.show();
        }

//TODO: This should be combined with the above if block
        //Wrapping in a timer with a 1 ms delay. This forces this to drop to the back of javascript
        //  thread/process queue so that GC jobs get a chance to run in the middle of some more
        //  processor intensive operations to avoid overrunning memory and crashing the app. 
        KONtx.utility.timer.setTimeout( function(){
            if (media.viewOffset) {
                progressWidth = (media.viewOffset / media.duration) * Config.THUMBWIDTH;
                ctrls.progressBar.setStyle('width', progressWidth);
                ctrls.progressBar.setStyle('opacity', 1);
                ctrls.progressBar.show();
                ctrls.progressBack.show();
            }
            else if (media.viewCount && parseInt(media.viewCount, 10) > 0 ) {
                ctrls.progressBar.setStyle('width', Config.THUMBWIDTH);
                ctrls.progressBar.setStyle('opacity', 0.3);
                ctrls.progressBar.show();
                ctrls.progressBack.show();
    
            }
            else {
                ctrls.progressBar.hide();
                ctrls.progressBack.hide();
            }
        }, 1);
        ctrls.playMedia.focus();
//
    }
    
    
});
