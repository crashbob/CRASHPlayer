
var PlayerView = new KONtx.Class({
    ClassName: 'PlayerView',
    
    Extends: KONtx.system.FullscreenView,

    _base: 'player.',
    _playlist: {},
    
    //This is hack to work around a framework limitation that causes views
    //to not be refreshed correctly if the exit button on the remote is used to exit
    //to the dock. 
    _stale: false,
    
    initView: function() {
        KONtx.mediaplayer.initialize();

        if ( Logger.logMediaplayerInternals ) {
//            KONtx.mediaplayer.debugInternals.log = (function(message) {Logger.debug(message, Logger.LOGTOSERVER, Config.get('yahooID'))});
            KONtx.mediaplayer.debugInternals.log = (Logger.debug).bindTo(Logger);
        }

        this.dialogs = {};

        this.dialogs.customError = function(message) {

            return new KONtx.dialogs.Alert({
                title: $_( 'video_error_dialog_title' ),
                message: message,
                buttons: [
                    { label: $_( 'dialog_retry_button' ), callback: function() {
                        KONtx.mediaplayer.playlist.start();
                    } },
                    { label: $_( 'dialog_cancel_button' ), callback: function() {
                        KONtx.mediaplayer.control.stop();
                        KONtx.application.previousView();
                    } }
                ],
                cancelCallback: function() {
                    log("Dialog was canceled by the user by hitting the back button");
                    KONtx.mediaplayer.control.stop();
                    KONtx.application.previousView();
                }
            });
        };
        
        this.dialogs.error = new KONtx.dialogs.Alert({
            title: $_( 'video_error_dialog_title' ),
            message: $_( 'video_error_dialog_message' ),
            buttons: [
                { label: $_( 'dialog_retry_button' ), callback: function() {
                        KONtx.mediaplayer.control.stop();
                        KONtx.mediaplayer.playlist.start();
                    }
                },
                {
                    label: $_( 'dialog_cancel_button' ), callback: function() {
                        KONtx.application.previousView();
                    }
                }
            ],
            cancelCallback: function() {
                log("Dialog was canceled by the user by hitting the back button");
                KONtx.mediaplayer.control.stop();
                KONtx.application.previousView();
                }
        });
        
        this.dialogs.networkError = new KONtx.dialogs.Alert({
            title: $_('network_error_dialog_title'),
            message: $_('network_error_dialog_message'),
            buttons: [
                { label: $_('dialog_ok_button'), callback: function() {
                    KONtx.application.previousView();
                } }
            ],
            cancelCallback: function() {
                log("Dialog was canceled by the user by hitting the back button");
                KONtx.mediaplayer.control.stop();
                KONtx.application.previousView();
            }
        });

    },
    
    createView: function() {
        var ctrls;
        
        ctrls = this.controls;
        
        
    //TODO: This really belongs in the Overlay, but until I get around to customizing that completely, it is
    //      easier to put it here, because I don't have to stay within the bounds of the exising overlay. 
        ctrls.dimmer = new KONtx.element.Container({
            guid: this._base + 'ctrls.dimmer',
            styles: {
                vOffset: 0,
                hOffset: 0,
                height: this.height,
                width: this.width,
                backgroundColor: 'black',
                opacity: 0.5
            }
        }).appendTo(this);

        
        ctrls.overlay = new MediaTransportOverlay({
            guid: this._base + 'ctrls.overlay',
            fastforwardButton: true,
            rewindButton: true,
            events: {
                onTransportButtonPress: function(event) {
                    if( event.payload.button == 'fastforward' ) {
//                        event.preventDefault();
//                        KONtx.mediaplayer.control.seek(10);
//                                KONtx.mediaplayer.control.fastforward(2);
                    } else if( event.payload.button == 'rewind' ) {
//                        event.preventDefault();
//                        KONtx.mediaplayer.control.seek(-10);
//                        KONtx.mediaplayer.control.rewind(2);
                    }
                }
            }
        }).appendTo(this);
        
        ctrls.infoBar = new KONtx.element.Container({  
            guid: this._base + 'ctrls.infoBar',
            styles: {  
                visible: false,
                width: this.width,
                height: 20,
                vOffset: 0,
                hOffset: 0,
                backgroundColor: 'black',
                opacity: 0.9
            }
        }).appendTo(this);
        
        ctrls.transcoder = new KONtx.element.Text({
            guid: this._base + 'ctrls.transcoder',
            wrap: true,
            truncation: 'end',
            styles: {
                visible: true,
                fontSize: '14px',
                color: '#FFFFFF',
                textAlign: 'left',
                width: 140,
                height: 20,
                hOffset: 5,
                vOffset: 2,
                opacity: 1
            }
        }).appendTo(ctrls.infoBar);
        
        ctrls.resolution = new KONtx.element.Text({
            guid: this._base + 'ctrls.resolution',
            wrap: true,
            truncation: 'end',
            styles: {
                visible: true,
                fontSize: '14px',
                color: '#FFFFFF',
                textAlign: 'left',
                width: 100,
                height: 20,
                hOffset: ctrls.transcoder.outerWidth,
                vOffset: 2
            }
        }).appendTo(ctrls.infoBar);  
                
        ctrls.quality = new KONtx.element.Text({
            guid: this._base + 'ctrls.quality',
            wrap: true,
            truncation: 'end',
            styles: {
                visible: true,
                fontSize: '14px',
                color: '#FFFFFF',
                textAlign: 'left',
                width: 100,
                height: 20,
                hOffset: ctrls.resolution.outerWidth,
                vOffset: 2
            }
        }).appendTo(ctrls.infoBar);
        
        ctrls.buffer = new KONtx.element.Text({
            guid: this._base + 'ctrls.buffer',
            wrap: true,
            truncation: 'end',
            styles: {
                visible: true,
                fontSize: '14px',
                color: '#FFFFFF',
                textAlign: 'left',
                width: 100,
                height: 20,
                hOffset: ctrls.quality.outerWidth,
                vOffset: 2
            }
        }).appendTo(ctrls.infoBar);

        ctrls.bufferingCount = new KONtx.element.Text({
            guid: this._base + 'ctrls.bufferingCount',
            wrap: true,
            truncation: 'end',
            styles: {
                visible: true,
                fontSize: '14px',
                color: '#FFFFFF',
                textAlign: 'left',
                width: 120,
                height: 20,
                hOffset: ctrls.buffer.outerWidth,
                vOffset: 2
            }
        }).appendTo(ctrls.infoBar);
        
        ctrls.formats = new KONtx.element.Text({
            guid: this._base + 'ctrls.formats',
            wrap: true,
            truncation: 'end',
            styles: {
                visible: true,
                fontSize: '14px',
                color: '#FFFFFF',
                textAlign: 'left',
                width: 150,
                height: 20,
                hOffset: ctrls.bufferingCount.outerWidth,
                vOffset: 2
            }
        }).appendTo(ctrls.infoBar);
        
        ctrls.frameRate = new KONtx.element.Text({
            guid: this._base + 'ctrls.frameRate',
            wrap: true,
            truncation: 'end',
            styles: {
                visible: true,
                fontSize: '14px',
                color: '#FFFFFF',
                textAlign: 'left',
                width: 150,
                height: 20,
                hOffset: ctrls.formats.outerWidth,
                vOffset: 2
            }
        }).appendTo(ctrls.infoBar);

        
        ctrls.buttonImage = new KONtx.element.Image({
            guid: this._base + 'ctrls.buttonImage',
            styles: {
                src: 'Assets/960x540/greenbutton.png',
                width:   32,
                height: 16,
                hOffset: ctrls.infoBar.outerWidth - 40,
                vAlign: 'center'
            }
        }).appendTo(ctrls.infoBar);

        /*
        ctrls.keyCode = new KONtx.element.Text({
            truncation: 'end',
            styles: {
                vAlign: 'center',
                padding: 4,
                fontSize: 13,
                fontFamily:'Helvetica',
                fontWeight: 'Bold',
                opacity: 1,
                color: 'white',
                hOffset: ctrls.infoBar.outerWidth - 60,
                width: 55,
                textAlign: 'center'
            }
        }).appendTo(ctrls.infoBar);
        */
        
        ctrls.networkError = new KONtx.element.Image({
            styles: {
                visible: false,
                src: 'Assets/960x540/serverError.png',
                hOffset: this.width - 80,
                vOffset: 10
            }
        }).appendTo(this);

    },
    
    focusView: function() {

        this.controls.overlay.focus();

    },
    
    _resetView: function() {
        this._resetViewport();

        this.controls.networkError.hide();

        this.controls.overlay.resetState();
    },
    
    updateView: function() {
        Logger.debug( 'updateView' );
        var ctrls;

        ctrls = this.controls;

        this._registerHandlers();
        this._stale = false;

        //If we didn't get a new playlist, we are probably just re-entering this view from a VIA button press or something. 
        if ( this.persist.playlist === this.persist.holdPlaylist ) {
            return;
        }

        this.persist.holdPlaylist = this.persist.playlist;
        KONtx.utility.LoadingOverlay.on();


        this._resetView();
        PlexService.pausePingTimer();

        ctrls.transcoder.setText(PlexService.getTranscoder() || '');
        ctrls.dimmer.hide();

        if (PlexService.getTranscoder() !== Config.TRANSCODEDIRECT ) {
            ctrls.quality.setText( $_('infobar_quality', Config.get( 'videoQuality' )) );
        }
        else {
            if (PlexService.getCurrentMediaMediaTag(0).bitrate){
                ctrls.quality.setText( $_('infobar_bitrate', PlexService.getCurrentMediaMediaTag(0).bitrate));
            }
            else {
                ctrls.quality.setText( '' );
            }
        }

        ctrls.buffer.setText( $_('initializing') );
        ctrls.bufferingCount.setText( $_('infobar_buffer_count', 0) );


        Logger.debug( 'Set overlay on offset unless DIRECT. We are: ' + PlexService.getTranscoder() );
        if ( PlexService.getCurrentMediaPlayFromOffset() && PlexService.getTranscoder() !== Config.TRANSCODEDIRECT ) {
            Logger.debug( 'Setting transportOffset on overlay.' );
            ctrls.overlay.transportOffset = PlexService.getCurrentMediaOffset();
        }

        if ( PlexService.state === Config.STATE_READY ) {
            //Wrapping in a timer with a 1 ms delay. This forces this to drop to the back of javascript
            //  thread/process queue so that GC jobs get a chance to run in the middle of some more
            //  processor intensive operations to avoid overrunning memory and crashing the app. 
            KONtx.utility.timer.setTimeout( (function(){
                this._preStartPlaylist(this.persist.playlist);
            }).bindTo(this), 1);
        }
        else {
            Logger.warn( $_('plexservice_unavail') );
            ctrls.networkError.show();
            KONtx.utility.LoadingOverlay.off();
            Utility.plexServiceDownDialog.show();
        }
    },
    
    selectView: function() {
        this._registerHandlers();
        
        if ( this._stale ) {
            KONtx.HostEventManager.send("simulateFakeLoadView");
            return;
        }

    },

    
    hideView: function() {
        Logger.debug('hideView');
        KONtx.mediaplayer.control.stop();
        this._resetView();
        this._unregisterHandlers();
        PlexService.unpausePingTimer();
        Utility.skipAuto = false;
//        this.persist.holdPlaylist = null;
        this._stale = true;
    },

    _selectStreamDialog: function(streams, playlist) {
        Logger.debug('Building Streams Dialog');

        var streamsDialog, buttons, i, haveBitrates, buttonLabel, thisStream;

        haveBitrates = false;
        buttons = [];
        for ( i = 0; i < streams.length; i++ ){
            thisStream = streams[i];
            
            if ( thisStream.bitrate ) {
                haveBitrates = true;
            }
            
            buttonLabel = (thisStream.resolution || $_('infobar_missing')) + "/" + (thisStream.bitrate || $_('infobar_missing')) + "/" + (thisStream.container || $_('infobar_missing')) + "/" + (thisStream.videoCodec || $_('infobar_missing')) + "/" + (thisStream.audioCodec || $_('infobar_missing'));
            buttons.push({
                stream: thisStream,
                label: buttonLabel,
                callback: (function(event) {
                    playlist.entries[0].streams = [event.selected.stream];
                    this._startPlaylist(playlist);
                }).bindTo(this)
            });
        }
        
        buttons.push({
            label: $_('dialog_cancel_button'),
            callback: function() {
                KONtx.utility.LoadingOverlay.off();
                KONtx.application.previousView();
            }
        });
        
        if ( !Utility.skipAuto &&  ((PlexService.useChannels && Config.get( 'remoteQuality' ) === Config.QUALITYAUTO)
            || (!PlexService.useChannels && Config.get( 'localQuality' ) === Config.QUALITYAUTO))
        ) {
            //We need to auto-decide on a stream
            if (haveBitrates) {
                //Bitrates are specified, so we'll let the player figure out the best stream
                this._startPlaylist(playlist);
                return;
            }
            else {
                this._autoPickStream(playlist);
                return;
            }
        }
        else {
            if ( haveBitrates ){
                //Stick it on the front
                buttons.unshift({
                    label: $_('playback_auto_dialog_button'),
                    callback: (function() {
                        this._startPlaylist(playlist);
                    }).bindTo(this),
                });
            }
        }

        streamsDialog = new KONtx.dialogs.Alert( {
            title: $_('streams_dialog_available_title'),
            message: $_('streams_dialog_available_message'),
            buttons: buttons,
            cancelCallback: function() {
                KONtx.utility.LoadingOverlay.off();
                KONtx.application.previousView();
            }

        });

        streamsDialog.show();
    
    },
    
    _autoPickStream: function(playlist) {
        Logger.debug( 'Attempting to pick a stream' );
        var streams, i, bestStream, stream, lowestStream, maxResolution;

        bestStream = undefined;
        streams = playlist.entries[0].streams;
        lowestStream = streams[0];
        for ( i = 0; i < streams.length; i++ ) {
            stream = streams[i];

            if (parseInt(lowestStream.resolution, 10) > parseInt(stream.resolution, 10)) {                
                lowestStream = stream;
            }
            
            maxResolution = PlexService.useChannels ? (Config.AVAILABLERESOLUTIONS[Config.get( 'remoteResolution' )].height) : Config.AVAILABLERESOLUTIONS[Config.get( 'localResolution' )].height;

            maxResolution = parseInt(maxResolution, 10);
            
            if ( stream && stream.resolution && (parseInt(stream.resolution, 10) <= maxResolution) ) {
                if (!bestStream) {
                    bestStream = stream;
                }

                if (parseInt(bestStream.resolution, 10) < parseInt(stream.resolution, 10)) {
                    bestStream = stream;
                }

            }
        }

        if (!bestStream) {
            Logger.debug( 'We could not find an appropriate stream. Giving the player the lowest resolution stream.' );
            bestStream = lowestStream;
        }

        playlist.entries[0].streams = [bestStream];
        this._startPlaylist(playlist);
        
    },

    _preStartPlaylist: function(playlist) {
        Logger.debug( 'Prestarting Playlist' );
        this.controls.overlay.resetState();
        
        if (playlist.entries[0].streams.length > 1 ) {
            this._selectStreamDialog(playlist.entries[0].streams, playlist);
        }
        else {
            this._startPlaylist(playlist);
        }
        
    },

    
    _startPlaylist: function(playlist) {
        Utility.skipAuto = false;

        this._playlist = playlist;
Logger.debug(JSON.stringify(playlist));
        KONtx.mediaplayer.playlist.set( this._createPlaylist(playlist) );

        KONtx.mediaplayer.setConnectionBandwidth(Config.get('bandwidth') || 1);

        //One final check of the network before we try to play              
        if ( KONtx.application.isPhysicalNetworkDown() ) {
            Logger.fatal( $_('network_down') );
            this.dialogs.networkError.show();
            return;
        }

        KONtx.mediaplayer.playlist.start();
        KONtx.utility.LoadingOverlay.off();

    },
    
    _createPlaylist: function(playlistObj) {
        var playlist, entry, playlistEntry;
        
        playlist = new KONtx.media.Playlist();
        
        for each( entry in playlistObj.entries ) {
            playlistEntry = new KONtx.media.PlaylistEntry(entry);
            playlistEntry.entryID = entry.entryID; 
            playlist.addEntry(playlistEntry);
        }
        
        return playlist;
    },
    
    _resetViewport: function() {
        var bounds = KONtx.mediaplayer.getDefaultViewportBounds();
        KONtx.mediaplayer.setViewportBounds(bounds);
    },
    
    _registerHandlers: function() {
        if( this._boundPlayerHandler || this._boundApplicationHandler ) {
            this._unregisterHandlers();
        }
        this._boundPlayerHandler = this._playerDispatcher.subscribeTo(KONtx.mediaplayer, [ 'onTimeIndexChanged', 'onStateChange', 'onPlaylistEnd', 'onStreamLoadError', 'onNewStreamSelected' ], this);
        this._boundApplicationHandler = this._applicationDispatcher.subscribeTo(KONtx.application, [ 'onActivateSettingsButton', 'onNetworkConnectionDisconnect', 'onWidgetKeyPress' ], this);
        PlexService.addStateChangeListener( (this._onPlexServiceStateChange).bindTo(this), this.ClassName );
    },

    _unregisterHandlers: function() {
        if (this._boundPlayerHandler) {
            this._boundPlayerHandler.unsubscribeFrom(KONtx.mediaplayer, [ 'onTimeIndexChanged', 'onStateChange', 'onPlaylistEnd', 'onStreamLoadError' ] );
            this._boundPlayerHandler = null;
        }
        if (this._boundApplicationHandler) {
            this._boundApplicationHandler.unsubscribeFrom(KONtx.application, [ 'onActivateSettingsButton', 'onNetworkConnectionDisconnect', 'onWidgetKeyPress' ] );
            this._boundApplicationHandler = null;
        }
        PlexService.removeStateChangeListener( this.ClassName );
    },

    _onPlexServiceStateChange: function(event) {
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

        switch(event.type) {
            case 'onNetworkConnectionDisconnect':
                KONtx.application.previousView();
                
                break;
            case 'onActivateSettingsButton':

                this._toggleInfoBarVisibility();
                break;
            case 'onWidgetKeyPress':
//this.controls.keyCode.setText('- ' + event.payload.keyCode + ' -');
                //Green button
                if ( event.payload.eventPhase == 3 && event.payload.keyCode == 404 ) {
                    this._toggleInfoBarVisibility();
                }
                else if ( event.payload.eventPhase == 3
                       && (   event.payload.keyCode == KONtx.utility.KeyHandler.map.BACK
                           || event.payload.keyCode == KONtx.utility.KeyHandler.map.F10 )
                ) {
                    //Stop the playing media before we leave
                    KONtx.mediaplayer.control.stop();
                }
                break;
        }
    },
    
    _toggleInfoBarVisibility: function() {
        var infoBar = this.controls.infoBar;
        
        if ( infoBar.visible ) {
            infoBar.hide();
        }
        else {
            infoBar.show();
        }
    },
    
    _playerDispatcher: function(event) {
        var mediaEntry, container, videoCodec, audioCodec;
        
        switch(event.type) {
            case 'onTimeIndexChanged':
                if (event.payload.player.tvapi.control.bufferedPercentage !== undefined ) {
                    this.controls.buffer.setText( $_('infobar_buffer_percent', event.payload.player.tvapi.control.bufferedPercentage) );
                }
                break;
            case 'onStateChange':
                if (event.payload.player.media.buffering_count !== undefined ) {
                    this.controls.bufferingCount.setText( $_('infobar_buffer_count', event.payload.player.media.buffering_count + 1) );
                }

                //TODO: Would be nice if we looked to see if the pause state was because the overlay
                // was FF or RW and only dim then, instead of always when paused.
                //Will be easy when this is in the overlay code.
                if ( event.payload.newState == KONtx.mediaplayer.constants.states.PAUSE ) {
                    this.controls.dimmer.show();
                }
                if ( event.payload.newState == KONtx.mediaplayer.constants.states.PLAY ) {
                    this.controls.dimmer.hide();
                }
                if ( event.payload.newState == KONtx.mediaplayer.constants.states.STOP ) {
                    KONtx.application.previousView();
                }
                if ( event.payload.newState == KONtx.mediaplayer.constants.states.ERROR || event.payload.newState == KONtx.mediaplayer.constants.states.UNKNOWN ) {
                    if ( PlexService.getTranscoder() == Config.TRANSCODEDIRECT ) {
                        this.dialogs.customError( $_('direct_play_error_message') ).show();
                    }
                    else {
                        this.dialogs.customError( $_('media_play_error_message') ).show();
                    }
                }
                break;
            case 'onPlaylistEnd':
                KONtx.application.previousView();
                break;
            case 'onStreamLoadError':
                Logger.error( 'Error loading video stream.' );
                this.dialogs.error.show();
                break;
            case 'onNewStreamSelected':
                Logger.debug( 'Selected a stream');

                mediaEntry = this._playlist.entries[0].streams[event.payload.player.media.stream_index];
                
                if (!mediaEntry) return;
                
                if (mediaEntry.bitrate) {
                    this.controls.quality.setText( $_('infobar_bitrate', + mediaEntry.bitrate));
                }
                
                container = mediaEntry.container || '';
                videoCodec = mediaEntry.videoCodec || '';
                audioCodec = mediaEntry.audioCodec || '';

                this.controls.formats.setText( container + ':' + videoCodec + ':' + audioCodec);

                if ( mediaEntry.width || mediaEntry.height ) {
                    this.controls.resolution.setText(mediaEntry.width + 'x' + mediaEntry.height);
                }
                else {
                    this.controls.resolution.setText('');
                }
    
                if ( mediaEntry.frameRate ) {
                    this.controls.frameRate.setText( $_('infobar_framerate', mediaEntry.frameRate) );
                }
                else {
                    this.controls.frameRate.setText( $_('infobar_framerate', 'unknown' ) );
                }

                break;
            default:
                break;
        }
    }
});
