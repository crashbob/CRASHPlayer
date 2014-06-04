//Need to override a few bits of this internal class to fix the progress bar for how we have to start
//media that is already in progress
//We have to add an offset to the progress to account for starting at an offset.
var MediaTransportOverlay = new KONtx.Class({
    ClassName: 'ControlVideoTransportOverlay',
    
    Extends: KONtx.control.MediaTransportOverlay,
    
    //TODO: Put these in a datastructure
    _rwff: false,
    _rwfftimer: {},
    _rwffOffset: 0,
    _rwffMultiplier: 1,
    _rwffDone: false,
    _rwffLoop: 0,
    _rwffStep: 0,
    
    //There is a bug in the framework's mediaplayer code caused by a "fix" on or around line 323. As a result
    //various situations cause the framework to not fire the onChangeEvent when the player stops.
    //This is used to workaround one of those conditions. 
    _didNext: false,
    
    _textStyle: 1,
    STYLETIMEREMAINING: 1,
    STYLETIMEPROGRESS: 2,
    STYLETIMETOTAL: 3,
    
        
    transportOffset: 0,
    
    
    _updateTimeIndexDisplay: function () {        
        var timeIndex, timeDisplay;
        
        timeIndex = KONtx.mediaplayer.tvapi.currentTimeIndex + this._rwffOffset + this.transportOffset;
        
        if ( timeIndex  <= KONtx.mediaplayer.tvapi.currentMediaDuration ) {
                
            switch (this._textStyle) {
                case this.STYLETIMEPROGRESS:
                    timeDisplay = (Utility.millisecondsToTime( timeIndex ) || Config.DEFAULTTIMETEXT ) + '>';
                    break;
                case this.STYLETIMETOTAL:
                    timeDisplay = '<' + ( Utility.millisecondsToTime( KONtx.mediaplayer.tvapi.currentMediaDuration )  || Config.DEFAULTTIMETEXT ) + '>';
                    break;
                case this.STYLETIMEREMAINING:
                
                default: 
                    timeDisplay = '<' + ( Utility.millisecondsToTime( KONtx.mediaplayer.tvapi.currentMediaDuration - timeIndex )  || Config.DEFAULTTIMETEXT );
                    break;
            }
                
            this._controls.intervalText.setText(timeDisplay || Config.DEFAULTTIMETEXT );
        }
        
    },
        


	_registerPlayerHandlers: function () {

		if (!this._boundOnSourceUpdated) {
			
			this._boundOnSourceUpdated = this._onSourceUpdated.subscribeTo(KONtx.mediaplayer, ["onTimeIndexChanged", "onStateChange", "onPlayPlaylistEntry", "onStartPlaylist"], this);
			
		}
		
	},
	//
	_unregisterPlayerHandlers: function () {
		
		if (this._boundOnSourceUpdated) {
			
			this._boundOnSourceUpdated.unsubscribeFrom(KONtx.mediaplayer, ["onTimeIndexChanged", "onStateChange", "onPlayPlaylistEntry", "onStartPlaylist"], this);
			
			this._boundOnSourceUpdated = false;
			
		}
		
	},
        
    /***
        Most of this is copied from the original class.
    ***/
    _onSourceUpdated: function (event) {
            switch (event.type) {
            
                case 'onTimeIndexChanged':                
                //TODO: Move this to onStateChange? 
                    if ( KONtx.mediaplayer.tvapi.currentMediaDuration < ( 5 * 60 * 1000 ) ) {
                                    
                        this._steps = 120;
                                    
                    }

                    if ( Config.get( 'activerwff' ) && (!PlexService.useChannels) ) {
                        //Need to do this here AND in OnStateChange. OnStateChange isn't called when doing active rw/ff because
                        //we don't pause playback.
                        if ( this._rwffJustFinished ) {
                            this._rwffJustFinished = false;
                            if ( this._rwffOffset == 0 ) {
                                KONtx.mediaplayer.control.seek(0, true);
                                this._resetFadeTimer();
                            }
                            this._rwffOffset = 0;
                        }
                    }

                    if ( !this._rwff) {
                    
                        if ( $contains( KONtx.mediaplayer.tvapi.currentPlayerState, [
                            KONtx.mediaplayer.constants.states.PLAY,
                            KONtx.mediaplayer.constants.states.FORWARD,
                            KONtx.mediaplayer.constants.states.REWIND
                        ] ) ) {

                            this._updateTimeIndexDisplay();

                            this._moveProgressBar( Math.round( ( (KONtx.mediaplayer.tvapi.currentTimeIndex + this.transportOffset + this._rwffOffset ) / KONtx.mediaplayer.tvapi.currentMediaDuration) * this._steps) );
                        }
                    }

                    break;

                case 'onStateChange':
                // HACK! Working around a framework bug. 
                // If we try to seek when in PAUSE, it starts playback but stays in a buffering state
                // So after a FF or RW, we just play it and tell the state change to do the seek once we are playing again. 
                if ( event.payload.newState == KONtx.mediaplayer.constants.states.PLAY ) {

                    if ( this._rwffJustFinished && ((!Config.get( 'activerwff' )) || PlexService.useChannels) ) {
                        this._rwffJustFinished = false;

                        if ( this._rwffOffset == 0 ) {
                            KONtx.mediaplayer.control.seek(0, true);

                        }
                        else {
                            KONtx.mediaplayer.control.seek(this._rwffOffset/1000);
                        }
                        this._rwffOffset = 0;
                    }
                }
                
                this._updateState();
                
                this._resetFadeTimer();
                
                break;
            
            case 'onPlayPlaylistEntry':

                this.resetState();
                
                break;
            
            case 'onStartPlaylist':

                this._didNext = false;
                
                break;
            
        }
        
        this._updateRemoteDevice(true);
        
    },

    /***
	  * @method _overlayControlOnFade
      * @event onTransportOverlayHide
	  * @description
			This method is called when we want to hide the overlay
      * @end
      * @access protected
     ***/
	_overlayControlOnFade: function () {
		
		// this is the callback which hides the onscreen controls when the timer fires
		this._overlayControlFadeTimer.ticking = false;
		
		if (this.fire("onTransportOverlayHide")) {
            this._controls.playpausebutton.focus();
			this.visible = false;
			
		}
		
	},

    
    /***
	  * @method _createIntervalText
	  * @description
			This method creates the text element used to display the current time index
      * @end
      * @access protected
     ***/
	_createIntervalText: function () {
		
		// Create the interval text obj and set the default to all 00"s
		this._controls.intervalText = new KONtx.control.TextButton({
			label: Config.DEFAULTTIMETEXT,
            focus: true,
			styles: {
                width: 75,
                hAlign: 'right',
                vAlign: 'center',
                KonShadow: '0px -1px black'
            },
            textStyles: {
                vAlign: "center",
                hAlign: "center",
                color: "#ffffff",
                fontWeight: 'bold',
                fontSize: '14px'
            },
            events: {
                onSelect: (this._changeOverlayTextStyle).bindTo(this)
            }
		}).appendTo(this._progressbody);

		this._controls.intervalText.hOffset = this._progressbody.width - 10;

	},

    
    _createProgressBar: function() {
            this.parent();
            
            this._controls.rwff = new KONtx.element.Text({
            label: null,
            truncation: 'end',
            styles: {
                visible: false,
                fontSize: '20px',
                color: '#FFFFFF',
                textAlign: 'center',
                fontWeight: 'bold',
                width: 100,
                height: 28,
                hAlign: 'center',
                backgroundColor: 'black',
                opacity: 0.5,
                vOffset: 3
            }
        }).appendTo(this._progressbody);
        
    },
    
        /***
      * @method _createStopButton
      * @event onTransportButtonPress
      * @description
            This method creates the onscreen stop button with the appropriate event handlers.
      * @end
      * @access protected
     ***/
    _createStopButton: function () {
        
        this._controls.stopbutton = new KONtx.control.Button({
            ClassName: this.ClassName + "Button",
            content: new KONtx.element.Image(Theme.storage.get(this.ClassName + "StopButtonImage")),
            styles: {
                hOffset: this._leftButtonCount * (Theme.storage.get(this.ClassName + "Button").styles.width + 1)
            },
            events: {
                onSelect: function (event) {
                    log("Onscreen Stop Pressed");
                    if (this.fire("onTransportButtonPress", { button: "stop", action: "stop" })) {

                        if (this._rwff) {
                            KONtx.utility.timer.clearInterval(this._rwfftimer);
                            this._controls.rwff.hide();
                            this._registerPlayerHandlers();
                            this._rwffOffset = 0;
                            this._rwffMultiplier = 1;
                            this._rwff = false;
                        }
                        KONtx.mediaplayer.control.stop();

                        if (this._didNext) {

                            this._didNext = false;
                            KONtx.application.previousView();
                        }
                    }
                }.bindTo(this)
            }
        }).appendTo(this);
        
    },

        /***
      * @method _createPlayButton
      * @event onTransportButtonPress
      * @description
            This method creates the onscreen play/pause button with the appropriate event handlers.
      * @end
      * @access protected
     ***/
    _createPlayButton: function () {
        var currentState;
        
        this._controls.playpausebutton = new KONtx.control.Button({
            ClassName: this.ClassName + "Button",
            content: new KONtx.element.Image(Theme.storage.get(this.ClassName + "PlayButtonImage")),
            styles: {
                hOffset: this._leftButtonCount * (Theme.storage.get(this.ClassName + "Button").styles.width + 1)
            },
            events: {
                onSelect: function (event) {
                    currentState = KONtx.mediaplayer.tvapi.currentPlayerStatus || KONtx.mediaplayer.tvapi.currentPlayerState;
                    switch (currentState) {
                        case KONtx.mediaplayer.constants.states.PAUSE:
                            log("fixing to tell the player to play");
                            if (this.fire("onTransportButtonPress", { button: "playpause", action: "play" })) {
                                if (!this._rwff) {
                                    KONtx.mediaplayer.control.play();
                                }
                                else {
                                    this._finishrwff(event);
                                }
                            }
                            break;
                        case KONtx.mediaplayer.constants.states.PLAY:
                        default:
                            log("fixing to tell the player to pause");
                            if (this.fire("onTransportButtonPress", { button: "playpause", action: "pause" })) {
                                if (!this._rwff) {
                                    KONtx.mediaplayer.control.pause();
                                }
                                else {
                                    this._finishrwff(event);
                                }
                            }
                            break;
                    }
                }.bindTo(this)
            }
        }).appendTo(this);
        
    },
    
        /***
      * @method _createRewindButton
      * @event onTransportButtonPress
      * @description
            This method creates the onscreen rewind button with the appropriate event handlers.
      * @end
      * @access protected
     ***/
    _createRewindButton: function () {
        
        this._controls.rewindbutton = new KONtx.control.Button({
            ClassName: this.ClassName + "Button",
            content: new KONtx.element.Image(Theme.storage.get(this.ClassName + "RewindButtonImage")),
            styles: {
                hOffset: this._leftButtonCount * (Theme.storage.get(this.ClassName + "Button").styles.width + 1)
            },
            events: {
                onSelect: function (event) {
                    log("Onscreen Rewind Pressed");
                    if (this.fire("onTransportButtonPress", { button: "rewind", action: "rewind" })) {
                        KONtx.mediaplayer.control.rewind();
                    }
                    event.payload.keyCode = KONtx.utility.KeyHandler.map.REWIND;
                    event.payload.eventPhase = 3;
                    this._triggerrwff(event);
                }.bindTo(this)
            }
        }).appendTo(this);
        
    },
    /***
      * @method _createFastForwardButton
      * @event onTransportButtonPress
      * @description
            This method creates the onscreen fastforward button with the appropriate event handlers.
      * @end
      * @access protected
     ***/
    _createFastForwardButton: function () {
        
        this._controls.fastforwardbutton = new KONtx.control.Button({
            ClassName: this.ClassName + "Button",
            content: new KONtx.element.Image(Theme.storage.get(this.ClassName + "FastForwardButtonImage")),
            styles: {
                hOffset: this._leftButtonCount * (Theme.storage.get(this.ClassName + "Button").styles.width + 1)
            },
            events: {
                onSelect: function (event) {
                    log("Onscreen Fast Forward Pressed");
                    if (this.fire("onTransportButtonPress", { button: "fastforward", action: "fastforward" })) {
                        KONtx.mediaplayer.control.fastforward();
                    }
                    event.payload.keyCode = KONtx.utility.KeyHandler.map.FORWARD;
                    event.payload.eventPhase = 3;
                    this._triggerrwff(event);
                }.bindTo(this)
            }
        }).appendTo(this);
        
    },
    
    
    _changeOverlayTextStyle: function() {
        Logger.debug( '_changeOverlyTextStyle' );
        
        this._textStyle ++;
        this._textStyle = this._textStyle > 3 ? 1 : this._textStyle;
        
        this._updateTimeIndexDisplay();
    },
    
    
    resetState: function () {

        Logger.debug( 'RESETTING OVERLAY STATE' );
        this.transportOffset = 0;
            
        if (this.fire("onTransportOverlayShow")) {
            
            this.visible = true;
            
        }
        
        //Failsafe in case we don't come out of rw/ff properly (surely that can never happen, but...), at least a reset will re-register handlers
        this._registerPlayerHandlers();

        this._controls.rwff.hide();

        this._updateState();
        
        this._controls.intervalText.setText(Config.DEFAULTTIMETEXT);

        this._moveProgressBar(0);
        
        this.focus();

    },
    
    _moveProgressBar: function (step) {
        this._rwffstep = step;
        
        this.parent(step);
        
    },
    
    //TODO: Need some refactoring here. Lots of duplication
    _goForward: function() {
        Logger.debug( 'Stepping Forward' );
        var timeIndex, speed, step;
        
        speed = parseInt(Config.get('rwffSpeed'), 10) * 1000;

        timeIndex = KONtx.mediaplayer.tvapi.currentTimeIndex + this.transportOffset + ( this._rwffOffset + ( speed * this._rwffMultiplier ) );

        if ( timeIndex  <= KONtx.mediaplayer.tvapi.currentMediaDuration ) {

            this._rwffOffset += speed * this._rwffMultiplier;

            timeIndex = KONtx.mediaplayer.tvapi.currentTimeIndex + this.transportOffset + this._rwffOffset;

            step = Math.round(( timeIndex / KONtx.mediaplayer.tvapi.currentMediaDuration ) * this._steps);
            step = step > this._rwffstep ? step : this._rwffstep;

            this._updateTimeIndexDisplay();
            this._moveProgressBar(step);

            if (  Config.get( 'activerwff' ) && (!PlexService.useChannels) ) {
                if ( this._rwffLoop === 4 ) {
                    KONtx.mediaplayer.control.seek(timeIndex/1000, true);
                    //We need to set this to NON zero so we don't restart to
                    //0 in onStateChange when the planets align
                    this._rwffOffset = 1;
                    this._rwffLoop = 0;
                }
                else {
                    this._rwffLoop++;
                }
            }
        }
        else {
            KONtx.utility.timer.clearInterval(this._rwfftimer);
            //Not too sure if this is the best place to do this. Seems like the overlay should be a little more contained and this should be handled
            //in the player view. Maybe the right way to do this is to play the movie but seek to the end, let it finish playing, then catch that event in the player.
            PlexService.playState(KONtx.mediaplayer.tvapi.currentMediaDuration, KONtx.mediaplayer.tvapi.currentMediaDuration, KONtx.mediaplayer.tvapi.currentPlayerState );
            this._rwff = false;
            this._rwffMultiplier = 1;
            this._rwffOffset = 0;
            this._registerPlayerHandlers();
            this._rwffLoop = 0;
            this._controls.rwff.hide();

            if ( (KONtx.mediaplayer.playlist.get()._playlist.entries.length - 1 ) > KONtx.mediaplayer.playlist.currentIndex.entry) {
                Logger.debug('We still have another entry. Go to it.');

                this._didNext = true;
                KONtx.mediaplayer.playlist.nextEntry();
                KONtx.mediaplayer.control.play();
            }
            else {
                Logger.debug('We are out of entries. Stop playback');
                KONtx.mediaplayer.control.stop();
                
                if (this._didNext) {
                    this._didNext = false;
                    KONtx.application.previousView();
                }
            }
            
//            KONtx.mediaplayer.playlist.nextEntry();
        }
    },
    
    _goRewind: function() {
        Logger.debug( 'Stepping Backward' );
        var speed,  timeIndex, step;
        
        speed = parseInt(Config.get('rwffSpeed'), 10) * 1000;
        
        timeIndex = KONtx.mediaplayer.tvapi.currentTimeIndex + this.transportOffset + ( this._rwffOffset - ( speed * this._rwffMultiplier ) );

        if ( timeIndex >= 0 ) {
            
            this._rwffOffset -= speed * this._rwffMultiplier;

            timeIndex = KONtx.mediaplayer.tvapi.currentTimeIndex + this.transportOffset + this._rwffOffset;
            
            step = Math.round(( timeIndex / KONtx.mediaplayer.tvapi.currentMediaDuration ) * this._steps);
            step = step < this._rwffstep ? step : this._rwffstep;

            this._updateTimeIndexDisplay();
            this._moveProgressBar(step);
            
            if ( Config.get( 'activerwff' ) && (!PlexService.useChannels) ) {
                if ( this._rwffLoop === 4 ) {
                    KONtx.mediaplayer.control.seek(timeIndex/1000, true);
                    //We need to set this to NON zero so we don't restart to
                    //0 in onStateChange when the planets align
                    this._rwffOffset = 1;
                    this._rwffLoop = 0;
                }
                else {
                    this._rwffLoop++;
                }
            }            

        }
        else {
            KONtx.utility.timer.clearInterval(this._rwfftimer);
            this._rwff = false;
            this._rwffMultiplier = 1;
            this._rwffJustFinished = true;
            this._registerPlayerHandlers();
            this._rwffLoop = 0;
            this._controls.rwff.hide();
            this._rwffOffset = 0;
            KONtx.mediaplayer.control.play();
        }

    },

    
    _finishrwff: function(event) {
        if (this._rwff) {

            Logger.debug( 'Finishing RW/FF' );
    
            KONtx.utility.timer.clearInterval(this._rwfftimer);
            this._registerPlayerHandlers();
    
            this._resetFadeTimer();
    
            this._rwffJustFinished = true;
            this._controls.playpausebutton.content.setSources(Theme.storage.get(this.ClassName + "PauseButtonImage"));
            KONtx.mediaplayer.control.play();
            this._controls.rwff.hide();
            this._rwffMultiplier = 1;
            this._rwff = false;
            this._rwffLoop = 0;
            }
    },
    
    
    _triggerrwff: function(event) {

        var states = KONtx.mediaplayer.constants.states;
    
        if ( $contains( KONtx.mediaplayer.tvapi.currentPlayerState, [states.PLAY, states.FORWARD, states.REWIND, states.PAUSE] ) ) {
    
            if ( event.payload.eventPhase == 3 ) {
                Logger.debug( 'Pressed FastFoward or Rewind' );
                
                this._unregisterPlayerHandlers();
                
                this._overlayControlFadeTimer.ticking = false;
                if (this.fire("onTransportOverlayShow")) {
                    this.visible = true;                
                }

                this._controls.playpausebutton.content.setSources(Theme.storage.get(this.ClassName + "PlayButtonImage"));

                if ( (!Config.get( 'activerwff' )) || PlexService.useChannels ) {    
                    KONtx.mediaplayer.control.pause();
                }
    
                KONtx.utility.timer.clearInterval(this._rwfftimer);
    
                //If we haven't started rw/ff before now
                if ( !this._rwff ) {
                    this._rwffMultiplier = 2;
                }
                //otherwise, if we are still going in the same direction
                else if ( this._rwff === event.payload.keyCode ) {
                    this._rwffMultiplier *= 2;
                }
                //otherwise, we have changed direction
                else {
                    this._rwffMultiplier = 2;
                }
                
                if (this._rwffMultiplier > 32 ) {
                    this._rwffMultiplier = 2;
                }
    
                this._rwff = event.payload.keyCode;
    
    
                if ( event.payload.keyCode == KONtx.utility.KeyHandler.map.FORWARD ) {
                    this._controls.rwff.setText(this._rwffMultiplier + 'x >>');
                    this._rwfftimer = KONtx.utility.timer.setInterval( (this._goForward).bindTo(this), 250 );
                }
                else {
                    this._controls.rwff.setText(this._rwffMultiplier + 'x <<');
                    this._rwfftimer = KONtx.utility.timer.setInterval( (this._goRewind).bindTo(this), 250 );
                }
    
                this._controls.rwff.show();
    
                //TODO: Config parameter for time
            }
        }
    },
    
    _onKeyPressHandler: function (event) {
        Logger.debug( 'Pressed: ' + event.payload.keyCode );
    
        //TODO: Do we need to check eventPhase here? 
        switch (event.payload.keyCode) {
            
            case 404:
                return;
                
                break;
            case KONtx.utility.KeyHandler.map.FORWARD:
                
                this._controls.fastforwardbutton.focus();

                this._triggerrwff(event);
                break;
            case KONtx.utility.KeyHandler.map.REWIND:

                this._controls.rewindbutton.focus();

                this._triggerrwff(event);
                break;
            case KONtx.utility.KeyHandler.map.ENTER:
                
                
                break;
            case KONtx.utility.KeyHandler.map.PLAY:

                if (this._rwff) {
                    event.preventDefault();
                }

                this._controls.playpausebutton.focus();

                this._finishrwff(event);
                
                break;
            case KONtx.utility.KeyHandler.map.STOP:
                if (this._rwff) {
                    KONtx.utility.timer.clearInterval(this._rwfftimer);
                    this._controls.stopbutton.focus();
                    this._registerPlayerHandlers();
                    this._controls.rwff.hide();
                    this._rwffOffset = 0;
                    this._rwffMultiplier = 1;
                    this._rwff = false;
                }
                if (this._didNext) {
                    this._didNext = false;
                    KONtx.application.previousView();
                }
                break;
            case 457:
                if ( event.payload.eventPhase == 3 ) {
                    if ( KONtx.mediaplayer.tvapi.currentTimeIndex - Config.get('instantReplay') * 1000 < 0 ) {
                        KONtx.mediaplayer.control.seek(0, true);
                    }
                    else {
                        KONtx.mediaplayer.control.seek( - parseInt(Config.get('instantReplay'), 10));
                    }
                }
                break;
            default:

                break;

        }

        if (!this.visible) {
            
            if (KONtx.mediaplayer.tvapi.currentPlayerState == KONtx.mediaplayer.constants.states.PLAY) {
                
                if ($contains(event.payload.keyCode, KONtx.mediaplayer.constants.keys) === false) {
                    
                    if (event.payload.keyCode != KONtx.utility.KeyHandler.map.BACK) {
                        
                        if (event.payload.keyCode != KONtx.utility.KeyHandler.map.F10 && event.payload.keyCode != KONtx.utility.KeyHandler.map.DOWN ) {
                            
                                event.preventDefault();
                            
                                event.stopPropagation();                            
                        }
                        
                    }
                    
                }
                
            }
            
            if (this.fire("onTransportOverlayShow")) {
                
                this.visible = true;

            }
            
            if (this._controls && this._controls.playpausebutton) {
                
                this._controls.playpausebutton.focus();
                
            }
            
        }
        else {
            if ( event.payload.eventPhase == 3 && event.payload.keyCode == KONtx.utility.KeyHandler.map.DOWN ) {
                this._controls.playpausebutton.focus();
                this.visible = false;
            }
        }
        
        if (!this._rwff) {
            this._resetFadeTimer();
        }
    },

    _updateState: function () {
        
        switch (KONtx.mediaplayer.tvapi.currentPlayerState) {
            
            case KONtx.mediaplayer.constants.states.PAUSE:
                if ( this._controls && this._controls.playpausebutton) {
                    
                    this._controls.playpausebutton.content.setSources(Theme.storage.get(this.ClassName + "PlayButtonImage"));
                    
                }
                
                this._overlayControlFadeTimer.ticking = false;
                
                if (!this.visible) {
                    
                    if (this.fire("onTransportOverlayShow")) {
                        
                        this.visible = true;
                        
                    }
                    
                }
                
                break;

            case KONtx.mediaplayer.constants.states.PLAY:
                
            case KONtx.mediaplayer.constants.states.BUFFERING:
                
                if ( !this._rwff && this._controls && this._controls.playpausebutton ) {
                    
                    this._controls.playpausebutton.content.setSources(Theme.storage.get(this.ClassName + "PauseButtonImage"));
                    
                }
                
                break;
            
            default:
                
                if (this._controls && this._controls.playpausebutton) {
                    
                    this._controls.playpausebutton.content.setSources(Theme.storage.get(this.ClassName + "PlayButtonImage"));
                    
                }
                
                break;
            
        }
        
        this._updateRemoteDevice(true);
        
    }
});
    