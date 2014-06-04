var PlayerSettingsView = new KONtx.Class({
    ClassName: 'PlayerSettingsView',

        Extends: KONtx.system.SidebarView,
        
        _base: 'PlayerSettings.',
        
        //This is a hack to work around a framework limitation that causes views
        //to not be refreshed correctly if the exit button on the remote is used to exit
        //to the dock. The only event called when the view is re-displayed is onFocus.
        _stale: false,

        createView: function() {
            Logger.debug( 'Creating Player Settings View' );
            var ctrls, emptySpaceTop, rwffHeader, emptyRemote, remoteHeader, emptyLocal, localHeader, emptySpaceEnd;
            
            ctrls = this.controls;
    
            ctrls.backButton = new KONtx.control.BackButton({
                label: $_('back_to_main_settings')
            }).appendTo(this);
    
            emptySpaceTop = new KONtx.control.EmptySpace({
                styles: {
                    height: KONtx.utility.scale(10),
                    vOffset: ctrls.backButton.outerHeight
                }
            }).appendTo(this);
            
            rwffHeader = new KONtx.control.Header({
                label: $_('rw_ff_header'),
                styles: {
                    vOffset: emptySpaceTop.outerHeight
                }
            }).appendTo(this);

            ctrls.activerwff = new KONtx.control.ToggleButton({
                id: 'activerwff',
                label: $_('rw_ff_active'),
                options: [
                    { value: '1', label: $_('on') },
                    { value: '0', label: $_('off') }
                ],
                events: {
                    onSelect: function(event) {
                        if ( this.getValue() === '1' ) {
                            Config.set( 'activerwff', true );
                        }
                        else {
                            Config.set( 'activerwff', false );
                        }
                   }
                },
                styles: {
                    width: this.width,
                    vOffset: rwffHeader.outerHeight
                }
            }).appendTo(this);


            ctrls.rwffSpeed = new KONtx.control.ToggleButton({
                id: 'rwffSpeed',
                label: $_('rw_ff_speed'),
                options: [
                                    { value: '1', label: '1' },
                                    { value: '2', label: '2' },
                                    { value: '3', label: '3' },
                                    { value: '4', label: '4' },
                                    { value: '5', label: '5' },
                                    { value: '6', label: '6' }
                            ],
                            events: {
                                onSelect: function(event) {
                                    Config.set( 'rwffSpeed', this.getValue() );
                           }
                },
                styles: {
                    width: this.width,
                    vOffset: ctrls.activerwff.outerHeight
                }
            }).appendTo(this);

            ctrls.instantReplay = new KONtx.control.ToggleButton({
                id: 'instantReplay',
                label: $_('instant_replay'),
                options: [
                                    { value: '5', label: '5' },
                                    { value: '6', label: '6' },
                                    { value: '7', label: '7' },
                                    { value: '8', label: '8' },
                                    { value: '9', label: '9' },
                                    { value: '10', label: '10' },
                                    { value: '15', label: '15' },
                                    { value: '20', label: '20' },
                                    { value: '25', label: '25' },
                                    { value: '30', label: '30' }
                            ],
                            events: {
                                onSelect: function(event) {
                                    Config.set( 'instantReplay', this.getValue() );
                           }
                },
                styles: {
                    width: this.width,
                    vOffset: ctrls.rwffSpeed.outerHeight
                }
            }).appendTo(this);


            emptyLocal = new KONtx.control.EmptySpace({
                styles: {
                    height: KONtx.utility.scale(10),
                    vOffset: ctrls.instantReplay.outerHeight
                }
            }).appendTo(this);

            localHeader = new KONtx.control.Header({
                label: $_('local_playback_settings'),
                styles: {
                    vOffset: emptyLocal.outerHeight
                }
            }).appendTo(this);

            ctrls.localQuality = new KONtx.control.ToggleButton({
                id: 'localQuality',
                label: $_('playback_select_quality'),
                options: [
                    { value: Config.QUALITYAUTO, label: $_('auto') },
                    { value: Config.QUALITYMANUAL, label: $_('manual') }
                ],
                events: {
                    onSelect: function(event) {
                        Config.set( 'localQuality', this.getValue() );
                   }
                },
                styles: {
                    width: this.width,
                    vOffset: localHeader.outerHeight
                }
            }).appendTo(this);
            
            ctrls.localResolution = new customControls.SelectButton({
                id: 'localResolution',
                guid: 'local-resolution',
                label: $_('preferred_resolution'),
                optionGridRows: 12,
                options: Config.AVAILABLERESOLUTIONS,
                events: {
                    onOptionSelected: function (event) {
                        Config.set( 'localResolution', event.payload.value);
                    }
                },
                styles: {
                    vOffset: ctrls.localQuality.outerHeight
                }
            }).appendTo(this);
            
            emptyRemote = new KONtx.control.EmptySpace({
                styles: {
                    height: KONtx.utility.scale(10),
                    vOffset: ctrls.localResolution.outerHeight
                }
            }).appendTo(this);

            remoteHeader = new KONtx.control.Header({
                label: $_('remote_playback_settings'),
                styles: {
                    vOffset: emptyRemote.outerHeight
                }
            }).appendTo(this);

            ctrls.remoteQuality = new KONtx.control.ToggleButton({
                id: 'remoteQuality',
                label: $_('playback_select_quality'),
                options: [
                    { value: Config.QUALITYAUTO, label: $_('auto') },
                    { value: Config.QUALITYMANUAL, label: $_('manual') }
                ],
                events: {
                    onSelect: function(event) {
                        Config.set( 'remoteQuality', this.getValue() );
                   }
                },
                styles: {
                    width: this.width,
                    vOffset: remoteHeader.outerHeight
                }
            }).appendTo(this);

            ctrls.remoteResolution = new customControls.SelectButton({
                id: 'remoteResolution',
                guid: 'remote-resolution',
                label: $_('preferred_resolution'),
                optionGridRows: 12,
                options: Config.AVAILABLERESOLUTIONS,
                events: {
                    onOptionSelected: function (event) {
                        Config.set( 'remoteResolution', event.payload.value);
                    }
                },
                styles: {
                    vOffset: ctrls.remoteQuality.outerHeight
                }
            }).appendTo(this);
            
            
            ctrls.resolutionNote = new KONtx.element.Text({
                label: $_('auto_mode_description'),
                truncation: 'end',
                styles: {
                    fontSize: '13px',
                    wrap: true,
                    color: '#FFFFFF',
                    textAlign: 'center',
                    height: KONtx.utility.scale(60),
                    width: this.width,
                    vOffset: ctrls.remoteResolution.outerHeight
                }
            }).appendTo(this);


            emptySpaceEnd = new KONtx.control.EmptySpace({
                styles: {
                    height: this.height - ctrls.remoteResolution.outerHeight,
                    vOffset: ctrls.resolutionNote.outerHeight
                }
            }).appendTo(this);
            
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
            Logger.debug( 'FocusView' );
            if ( this._stale ) {
                KONtx.HostEventManager.send("simulateFakeLoadView");
                return;
            }
        },
        
        _resetView: function() {
            var ctrls;
            
            ctrls = this.controls;
            //For Settings view, we do this only once at the view loading because we don't actively check the plex server while on the settings screen
            if ( PlexService.state === Config.STATE_READY || PlexService.state === Config.STATE_INIT ) {
                ctrls.networkError.hide();
            }
            else {
                ctrls.networkError.show();
            }
        },

        updateView: function() {
            Logger.debug( 'Updating Settings View' );
            
            var ctrls;
            
            ctrls = this.controls;

            this._stale = false;

            this._resetView();
//            this._registerHandlers();

//            ctrls.videoResolution.setValue(  Config.get( 'videoResolution' ) || Config.DEFAULTVIDEORESOLUTIONINDEX );
//            ctrls.videoQuality.setValue(     Config.get( 'videoQuality' )    || Config.DEFAULTVIDEOQUALITY);
            ctrls.rwffSpeed.setValue(        Config.get( 'rwffSpeed' )       || Config.DEFAULTRWFFSPEED);
            ctrls.instantReplay.setValue(    Config.get( 'instantReplay' )   || Config.DEFAULTINSTANTREPLAY);
            ctrls.activerwff.setValue(       Config.get( 'activerwff' )     ? '1' : '0' );
            ctrls.localQuality.setValue(    (Config.get( 'localQuality' ) == Config.QUALITYAUTO)  ? Config.QUALITYAUTO : Config.QUALITYMANUAL );
            ctrls.localResolution.setValue( Config.get( 'localResolution' ) || Config.DEFAULTVIDEORESOLUTIONINDEX );
            ctrls.remoteQuality.setValue(    (Config.get( 'remoteQuality' ) == Config.QUALITYAUTO)  ? Config.QUALITYAUTO : Config.QUALITYMANUAL );
            ctrls.remoteResolution.setValue( Config.get( 'remoteResolution' ) || Config.DEFAULTREMOTERESOLUTIONINDEX );

        },

        selectView: function() {
            this._registerHandlers();
        },

        hideView: function() {

        },

        unselectView: function() {
            this._resetView();
            this._unregisterHandlers();

            this._stale = true;
        },
        
        _registerHandlers: function() {
            if( this._boundApplicationHandler ) {
                    this._unregisterHandlers();
            }
            this._boundApplicationHandler = this._applicationDispatcher.subscribeTo(KONtx.application, [ 'onWidgetKeyPress' ], this);
        },

        _unregisterHandlers: function() {
            if( this._boundApplicationHandler ) {
                    this._boundApplicationHandler.unsubscribeFrom(KONtx.application, [ 'onWidgetKeyPress' ] );
                    this._boundApplicationHandler = null;
            }
        },

        _applicationDispatcher: function(event) {
            var map;

            switch(event.type) {
                case 'onWidgetKeyPress':
                    map = KONtx.utility.KeyHandler.map;
   
                    if ( event.payload.eventPhase == 3 && Array.contains(event.payload.keyCode, [map.STOP, map.PAUSE, map.REWIND, map.FORWARD] ) ) {
                        event.preventDefault();
                    }
                    else if ( event.payload.eventPhase == 3 && event.payload.keyCode === map.PLAY ) {        
                        event.preventDefault();
                    }

                    break;
                default:
                    
                    break;
            }
        }
        
    
});