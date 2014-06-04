var Utility = {
    initialize: function() {
        Logger.debug( 'Initializing Utility' );
    },
    
    //Probably not the best way to do this, but for now... 
    skipAuto: false,
    
    millisecondsToTime: function(secs, pretty) {
        var timeText, milliseconds, seconds, minutes, hours;
        
        if (!secs) {
//            secs = 0;
            return null;
        }
        
        milliseconds = parseInt( (secs%1000) / 100, 10 );
        seconds = parseInt( (secs/1000) % 60, 10 );
        minutes = parseInt( (secs / (1000*60) ) % 60, 10 );
        hours = parseInt( ( secs / (1000*60*60) ) % 24, 10 );

        //TODO: Should probably sprintf this or something...
        if (pretty) {
            timeText = (hours > 0) ? $_('hours_minutes', hours, minutes)
                : (minutes > 0 ) ? $_('minutes_seconds', minutes, seconds)
                : $_('seconds', seconds);
        }
        else {
            minutes = ( minutes < 10 ) ? '0' + minutes : minutes;
            seconds = ( seconds < 10 ) ? '0' + seconds : seconds;

            timeText = hours + ":" + minutes + ":" + seconds; // + "." + milliseconds;
        }
        
        return timeText;
    },
    


    requestFailDialog: function( retryCallback, noExitButton ) {
        Logger.debug('Building error dialog');

        var mediaUnavailableDialog, buttons;
        
        buttons = [
            {
                label: $_('return_to_app', $_('app_title')),
                callback: function() {
                    KONtx.utility.LoadingOverlay.off();
                    PlexService._serverPingCheck.ticking = true;
                }
            }
        ];

        if (!noExitButton) {
            buttons.push({
                label: $_('exit_to_dock'),
                callback: function() {
                    KONtx.utility.LoadingOverlay.off();
                    PlexService._serverPingCheck.ticking = true;
                    KONtx.HostEventManager.send("exitToDock");
                }
            });
        }

        if ( retryCallback && retryCallback.onRetry ) {
            //Stick it on the front
            buttons.unshift({
                label: retryCallback.buttonText || $_('dialog_retry_button'),
                callback: function() {
                    KONtx.utility.LoadingOverlay.on();
                    retryCallback.onRetry(retryCallback.params);
                }
            });
        }

        mediaUnavailableDialog = new KONtx.dialogs.Alert( {
            title: retryCallback.title || $_('request_error_dialog_title'),
            message: retryCallback.message || $_('request_error_message'),
            buttons: buttons,
            cancelCallback: function() {
                KONtx.utility.LoadingOverlay.off();
                PlexService._serverPingCheck.ticking = true;
            }

        });

        return mediaUnavailableDialog;
    
    },

//Move to CONFIG???
    serverErrorRefetch: {
        title: $_('plexservice_unavail'),
        message: $_('plexservice_unavail_message')
    },

    emptyDialog: new KONtx.dialogs.Alert({
        title: $_('empty_section_title'),
        message: $_('empty_section_message'),
        buttons: [
            {
                label: $_('dialog_ok_button'),
            }
        ]  
    }),


    plexServiceDownDialog: new KONtx.dialogs.Alert({
        title: $_('plexservice_unavail'),
        message: $_('plexservice_unavail_message'),
        buttons: [
            {
                label: $_('dialog_ok_button'),
                callback: function() {
                    KONtx.application.previousView();
                }
            }
        ],
        cancelCallback: function() {
            KONtx.application.previousView();
        }
    }),
    
    //TODO: A better way to share some of these methods would be to create a base class and inherit it. 
    updateMediaGrid: function(mediaResp) {
        Logger.debug( 'Updating MediaGrid' );
        var arr, fade, focus, page;
        
        arr = (Utility.buildMediaArray).bindTo(this)(mediaResp);
        
        //If this is true, then we likely didn't get a paged response (probably a Channel), so we'll
        //    hang the array off the side of the pager so we can get at it later to avoid trying to refetch.

        if (mediaResp.totalSize === undefined || mediaResp.offset === undefined ) {
            this.controls._mediaGridPager.dataArray = arr;
        }
        else {
            delete this.controls._mediaGridPager.dataArray;
        }
        
        if (!arr.length) {
            KONtx.utility.LoadingOverlay.off();            
            Utility.emptyDialog.show();
            return;
        }

        this.controls._mediaGridPager.initItems(arr, (mediaResp.totalSize || arr.length ));

        this.controls.mediaGrid.focus();

        fade = Config.get( 'animate' ) ? 'fade' : 'none';
        focus = (this.persist.mediaState && this.persist.mediaState.focus) || { row: 0, column: 0 };
        page = (this.persist.mediaState && this.persist.mediaState.page) || 0;
        this.controls.mediaGrid.changePage(page, {refresh:true, transition: fade, focus: focus });

        this.controls.mediaGrid.show();

        this.controls.mediaPages.show();

        KONtx.utility.LoadingOverlay.off();            

    },
    
    buildMediaArray: function(mediaResp) {
    
        var arr, mediaInfo, mediaItems, mediaChild, mediaTitle, image, i, imageFormat, imageURL, parentTitle, index;


        arr = [];
        if (!this.persist.mediaInfo) {
            this.persist.mediaInfo = [];
        }


        mediaItems = mediaResp._children;
        if (mediaItems) {
            for ( i = 0; i < mediaItems.length; i++ ) {
                mediaChild = mediaItems[i];
                
                //Ignore Prefs in channels
                if (mediaChild.settings == '1') {
                    continue;
                }
                //Ignore Search in channels
                if (mediaChild.search == '1') {
                    continue;
                }


                parentTitle = mediaChild.parentTitle || mediaChild.grandparentTitle;
                mediaTitle = parentTitle
                    ? (parentTitle + ': ' + mediaChild.title || mediaChild.title2)
                    : mediaChild.title || mediaChild.title2;

                image = mediaChild.thumb || mediaResp.thumb;
                imageFormat = image ? Config.THUMBFORMAT : Config.SECTIONTHUMBFORMAT;

                imageURL = PlexService.generateImageURL(image, Config.THUMBWIDTH, Config.THUMBHEIGHT, imageFormat);

                //The grids perform much better if we don't store this information in the grid array, but access it later
                mediaInfo = {};
                mediaInfo.label = mediaTitle;
                mediaInfo.title1 = mediaResp.title1;
                mediaInfo.title2 = mediaResp.title2;
                mediaInfo.mediaThumb = imageURL;
                mediaInfo.mediaTagPrefix = mediaResp.mediaTagPrefix;
                mediaInfo.mediaTagVersion = mediaResp.mediaTagVersion;
                mediaInfo.urlPrefix = mediaResp.urlPrefix;
                mediaInfo.viewOffset = mediaChild.viewOffset;
                mediaInfo.duration = mediaChild.duration;
                mediaInfo.viewCount = mediaChild.viewCount;
                mediaInfo.key = mediaChild.key;
                mediaInfo.viewGroup = mediaResp.viewGroup;
                mediaInfo.type = mediaChild.type;
                mediaInfo.index = mediaChild.index;
                mediaInfo.parentIndex = mediaChild.parentIndex;
                mediaInfo.contentRating = mediaChild.contentRating || mediaResp.grandparentContentRating;
                mediaInfo.art = mediaChild.art || mediaResp.art;
                mediaInfo.summary = mediaChild.summary;
                mediaInfo.parentSummary = mediaChild.parentSummary;
                mediaInfo.leafCount = mediaChild.leafCount;
                mediaInfo.viewedLeafCount = mediaChild.viewedLeafCount;
                mediaInfo.contenttype = mediaResp.contenttype;
                
                if (mediaChild._children && mediaChild._children[0]) {
                    mediaInfo.videoResolution = mediaChild._children[0].videoResolution;
                    mediaInfo.videoCodec = mediaChild._children[0].videoCodec;
                    mediaInfo.videoFrameRate = mediaChild._children[0].videoFrameRate;
                    mediaInfo.audioCodec = mediaChild._children[0].audioCodec;
                    mediaInfo.audioChannels = mediaChild._children[0].audioChannels;
                }
                
                index = mediaResp.offset ? parseInt(mediaResp.offset, 10) + i : i;
                
                arr.push({
                    index: index,
                    mediaThumb: imageURL
                });
                //If too much data is in the array in the grid, it performs slowly.
                //We use an external array and do a lookup when we need it. 
                this.persist.mediaInfo[index] = mediaInfo;
            }
        }
        
        return arr;
    },

    updateMediaMetadata: function (gridData) {

        var artImage, seasonEpisode, contentRating, videoResolution, videoCodec, videoFramerate, audioCodec, audioChannels, mediaInfo, duration;

        mediaInfo = this.getView().persist && this.getView().persist.mediaInfo[gridData.index];


        duration = mediaInfo.viewOffset
            ? $_('played_duration', Utility.millisecondsToTime(mediaInfo.viewOffset, true) ,Utility.millisecondsToTime(mediaInfo.duration, true))
            : Utility.millisecondsToTime(mediaInfo.duration, true);

        if (mediaInfo.index && $contains( mediaInfo.type, Config.VIDEOMEDIATYPES) ) {
            seasonEpisode = $_('episode_label', mediaInfo.index);
            if (mediaInfo.parentIndex) {
                seasonEpisode = $_('season_episode_label', mediaInfo.parentIndex, mediaInfo.index);
            }
        } else if ( mediaInfo.index && $contains(mediaInfo.type, Config.SEASONMEDIATYPES) ) {
            seasonEpisode = $_('season_label', mediaInfo.index);
        }
        if (mediaInfo.contentRating) {
            contentRating = PlexService.generateImageURL(mediaInfo.mediaTagPrefix + 'contentRating/' + mediaInfo.contentRating + '?t=' + mediaInfo.mediaTagVersion, 40,  40, 'png' );
        }

        videoResolution = null;
        videoCodec = null;
        videoFramerate = null;
        audioCodec = null;
        audioChannels = null;
                
        if ($contains( mediaInfo.type, Config.VIDEOMEDIATYPES)) {
            if (mediaInfo.videoResolution) {
                videoResolution = PlexService.generateImageURL(mediaInfo.mediaTagPrefix + 'videoResolution/' + mediaInfo.videoResolution + '?t=' + mediaInfo.mediaTagVersion, 40,  40, 'png' );
            }
    
            if (mediaInfo.videoCodec) {
                videoCodec = PlexService.generateImageURL(mediaInfo.mediaTagPrefix + 'videoCodec/' + mediaInfo.videoCodec + '?t=' + mediaInfo.mediaTagVersion, 40,  40, 'png' );
            }
    
            if (mediaInfo.videoFrameRate) {
                videoFramerate = PlexService.generateImageURL(mediaInfo.mediaTagPrefix + 'videoFrameRate/' + mediaInfo.videoFrameRate + '?t=' + mediaInfo.mediaTagVersion, 40,  40, 'png' );
            }
    
            if (mediaInfo.audioCodec) {
                audioCodec = PlexService.generateImageURL(mediaInfo.mediaTagPrefix + 'audioCodec/' + mediaInfo.audioCodec + '?t=' + mediaInfo.mediaTagVersion, 40,  40, 'png' );
            }
    
            if (mediaInfo.audioChannels) {
                audioChannels = PlexService.generateImageURL(mediaInfo.mediaTagPrefix + 'audioChannels/' + mediaInfo.audioChannels + '?t=' + mediaInfo.mediaTagVersion, 40,  40, 'png' );
            }
        }

        //TODO: Need to calculate height better. Can we find it from the PMS? At LEAST, put it in config.
        if (mediaInfo.art) {
            artImage = PlexService.generateImageURL(mediaInfo.art, this.width - 10,  parseInt(((this.width/3)*2) - 10, 10), 'jpg' );
        }
        else {
            artImage = null;
        }

        //Wrapping in a timer with a 1 ms delay. This forces this to drop to the back of javascript
        //  thread/process queue so that GC jobs get a chance to run in the middle of some more
        //  processor intensive operations to avoid overrunning memory and crashing the app. 
        KONtx.utility.timer.setTimeout( (function(){
            this.setTitle(mediaInfo.label);
            this.setSummary(mediaInfo.summary || mediaInfo.parentSummary || '' );
            this.setMediaDuration(duration);
            this.setSeasonEpisode(seasonEpisode);
            this.setContentRating(contentRating);
            this.setVideoResolution(videoResolution);
            this.setVideoCodec(videoCodec);
            this.setVideoFramerate(videoFramerate);
            this.setAudioCodec(audioCodec);
            this.setAudioChannels(audioChannels);
            this.setBGImage(artImage);
        }).bindTo(this), 1);
    },
    
    
    mediaTypeDispatcher: function(mediaInfo) {

        //Wrapping in a timer with a 1 ms delay. This forces this to drop to the back of javascript
        //  thread/process queue so that GC jobs get a chance to run in the middle of some more
        //  processor intensive operations to avoid overrunning memory and crashing the app. 
        KONtx.utility.timer.setTimeout( (function(){
            Logger.debug( 'Selected Media Item' );
            var dialog;
    
            if(mediaInfo) {
                //VIDEO
                if ( $contains(mediaInfo.type, Config.VIDEOMEDIATYPES) ) {
                    if ( this._videoHandler && this._videoHandler.call ) {
                        this._videoHandler(mediaInfo);
                    }
                    //default
                    else {
                        Logger.debug( 'Selected a video' );
                        this.persist.selectedDataItem = mediaInfo;
                        
                        KONtx.application.loadView( 'view-MediaItem', { mediaKey: mediaInfo.key, type: mediaInfo.type } );
                    }
                }
                //SHOWS
                else if ( $contains(mediaInfo.type, Config.SHOWMEDIATYPES) ) {
                    if ( this._showHandler && this._showHandler.call ) {
                        this._showHandler(mediaInfo);
                    }
                    //default
                    else {
                        Logger.debug( 'Selected a show' );
        
                        KONtx.application.loadView( 'view-Show', { showData: mediaInfo } );
                    }
                }
                //SEASONS
                else if ( $contains(mediaInfo.type, Config.SEASONMEDIATYPES ) ) {
                    Logger.debug( 'Selected a Season' );
    
                    if ( this._seasonHandler && this._seasonHandler.call ) {
                        this._seasonHandler(mediaInfo);
                    }
                    //default
                    else {
        
                        if( mediaInfo.key.substring( mediaInfo.key.length - Config.PLEX_MEDIACHILDRENSUFFIX.length ) === Config.PLEX_MEDIACHILDRENSUFFIX )
                        {
                            mediaInfo.key = mediaInfo.key.substring( 0, mediaInfo.key.length - Config.PLEX_MEDIACHILDRENSUFFIX.length );
                        }
                        
    
                        KONtx.application.loadView( 'view-Show', { showData: mediaInfo } );
                    }
                }
                else if ( (!mediaInfo.type) && ( $contains(mediaInfo.viewGroup, Config.SEASONMEDIATYPES) || PlexService.useChannels ) ) {
                    Logger.debug( 'Selected a Season Type 2' );
    
                    if ( this._seasonHandler && this._seasonHandler.call ) {
                        this._seasonHandler(mediaInfo);
                    }
                    //default
                    else {
        
                        if( mediaInfo.key.substring( mediaInfo.key.length - Config.PLEX_MEDIACHILDRENSUFFIX.length ) === Config.PLEX_MEDIACHILDRENSUFFIX )
                        {
                            mediaInfo.key = mediaInfo.key.substring( 0, mediaInfo.key.length - Config.PLEX_MEDIACHILDRENSUFFIX.length );
                        }
                        
                        KONtx.application.loadView( 'view-Show', { showData: mediaInfo } );
                    }
    
                }
                else {
                    Logger.debug('Unsupported type: ' + mediaInfo.type);
    
                    dialog = new KONtx.dialogs.Alert({
                        title: $_('not_supported_dialog_title'),
                        message: $_('not_supported_dialog_message', $_('app_title'), Config.SUPPORTEMAIL),
    
                        buttons: [
                            { label: $_('dialog_ok_button') }
                        ]  
                    });
                    
                    dialog.show();
    
                    return;
                }
    
            }
        }).bindTo(this), 1);
    },
    
    
    
    _offsetDialog: function() {

        return {
            title: $_('resume_dialog_title'),
            message: $_('resume_dialog_message'),
//            focusOnCompletion: this.controls.pageIndicator,
            buttons: [
                {
                    label: $_('resume_time_label', Utility.millisecondsToTime( PlexService.getCurrentMediaOffset() )),
                    callback: (function() {
                        Logger.debug( 'Playing movie starting with offset.' );
                        this.playMovie(Config.WITHOFFSET);
                    }).bindTo(this),
                },
                {
                    label: $_('play_from_start'),
                    callback: (function() {
                        Logger.debug( 'Playing movie from the beginning.' );
                        this.playMovie(Config.WITHOUTOFFSET);
                    }).bindTo(this),
                },
                {
                    label: $_('dialog_cancel_button')
                }
            ]
        };
    },


    _mediaUnavailableDialog: function(message) {        
        return {
            title: $_('media_unavailable_dialog_title'),
            message: message || $_('media_unavailable_dialog_message'),
            buttons: [
                {
                    label: $_('dialog_ok_button')
                }
            ]
        };
    },
    
    
    
    prePlayMovie: function() {
        Logger.debug( 'Prepping to Playing Movie' );
        var mediaUnavailableDialog, offsetDialog;
        
        if ( ! PlexService.getCurrentMediaAvailable() ) {
            mediaUnavailableDialog = new KONtx.dialogs.Alert( this._mediaUnavailableDialog() );
            mediaUnavailableDialog.show();
            return;
        }

        if ( PlexService.getCurrentMediaOffset() ) {
            Logger.debug( 'Showing Offset Dialog' );
            offsetDialog = new KONtx.dialogs.Alert( this._offsetDialog() );
            offsetDialog.show();
        }
        else {
            this.playMovie(false);
        }
        
        KONtx.utility.LoadingOverlay.off();

    },

    playMovie: function(withOffset) {
        Logger.debug( 'playMovie' );

        KONtx.utility.LoadingOverlay.on();

        PlexService.getCurrentMediaPlaylist(withOffset, (this.onGotPlaylist).bindTo(this), (this.onGotPlaylistError).bindTo(this) );
    },


    onGotPlaylist: function(playlist) {

        KONtx.utility.LoadingOverlay.off();

        KONtx.application.loadView( 'view-Player', { playlist: playlist });
    },

    onGotPlaylistError: function(message, status) {
        var mediaUnavailableDialog;
        
        mediaUnavailableDialog = new KONtx.dialogs.Alert( this._mediaUnavailableDialog( $_('error_string', + status + ' : ' + message )) );
        mediaUnavailableDialog.show();
    },

    xmlToJson: function(xml) {
        return this._xmlToJson(xml)._children[0];
    },

    // Changes XML to JSON
//DELAY: If I can find a way to embed a bunch of delays in here, I might be able to unpack large objects
    _xmlToJson: function (xml) {
        // Create the return object
        var obj, j, i, item, nodeName, tmpObj, attribute;
        
        obj = {};

        if (xml.nodeType == 1) { // element
            // do attributes
            if (xml.attributes.length > 0) {
                for ( j = 0; j < xml.attributes.length; j++) {
                    attribute = xml.attributes.item(j);
                    obj[attribute.nodeName] = attribute.nodeValue;
                }
            }
        } else if (xml.nodeType == 3) { // text
            obj = xml.nodeValue;
        }

        // do children
        if (xml.hasChildNodes()) {
            obj._children = [];
            for( i = 0; i < xml.childNodes.length; i++) {
                item = xml.childNodes.item(i);
                nodeName = item.nodeName;
                tmpObj = {};
                tmpObj._elementType = nodeName;
                tmpObj = this._xmlToJson(item);
                tmpObj._elementType = nodeName;
                obj._children[i] = tmpObj;
            }
        }
        return obj;
    }

};

Utility.initialize();