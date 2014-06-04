var SettingsView = new KONtx.Class({
    ClassName: 'SettingsView',

        Extends: KONtx.system.SidebarView,
        
        base: 'settings.',
        
        //This is a hack to work around a framework limitation that causes views
        //to not be refreshed correctly if the exit button on the remote is used to exit
        //to the dock. The only event called when the view is re-displayed is onFocus.
        _stale: false,

        createView: function() {
            Logger.debug( 'Creating Settings View' );
            var ctrls, emptySpaceTop, serverSettingsHeader, emptySpaceVideoQuality, videoQualityHeader,
                emptySpaceTranscoder, emptySpaceActiverwff, emptySpaceEnd, emptySpaceAnimate, libraryHeader;
            
            ctrls = this.controls;
    
            ctrls.backButton = new KONtx.control.BackButton({
                label: $_('back_to_app', $_('app_title'))
            }).appendTo(this);
    
            emptySpaceTop = new KONtx.control.EmptySpace({
                styles: {
                    height: KONtx.utility.scale(10),
                    vOffset: ctrls.backButton.outerHeight
                }
            }).appendTo(this);
    
            serverSettingsHeader = new KONtx.control.Header({
                label: $_('server_settings_button'),
                styles: {
                    vOffset: emptySpaceTop.outerHeight
                }
            }).appendTo(this);

            ctrls.text_ServerIP = new KONtx.control.TextEntryButton({
                id: 'text-serverip',
                label: $_('server_IP_entry'),
                styles: {
                    vOffset: serverSettingsHeader.outerHeight
                },
                events: {
                    onSubmit: function(event) {
                        Logger.info( 'Set Server IP: ' + event.payload.value );
                        Config.set( 'serverIP', event.payload.value);
                        if (event.payload.value === Config.DEFAULTIP || !event.payload.value ) {
                            ctrls.text_ServerIP.setStyle( 'backgroundColor', '#660000');
                        }
                        else {
                            ctrls.text_ServerIP.setStyle( 'backgroundColor', '#000000');
                        }
                    },
                    onCancel: function(event) {
                        
                    }
                }
            }).appendTo(this);

            ctrls.text_ServerPort = new KONtx.control.TextEntryButton({
                id: 'text-serverport',
                label: $_('server_port_entry'),
                styles: {
                    vOffset: ctrls.text_ServerIP.outerHeight
                },
                events: {
                    onSubmit: function(event) {
                        Logger.debug( 'Set Server Port' );
                        Config.set( 'serverPort', event.payload.value);
                    },
                    onCancel: function(event) {
                        
                    }
                }
            }).appendTo(this);

/*            ctrls.yahooID = new KONtx.control.TextEntryButton({
                id: 'yahooID',
                label: 'Yahoo ID',
                styles: {
                    vOffset: ctrls.text_ServerPort.outerHeight
                },
                events: {
                    onSubmit: function(event) {
                        Logger.debug( 'Set Yahoo ID: ' + event.payload.value );
                        Config.set( 'yahooID', event.payload.value);
                        if (!event.payload.value) {
                            ctrls.yahooID.setStyle( 'backgroundColor', '#660000');
                        }
                        else {
                            ctrls.yahooID.setStyle( 'backgroundColor', '#000000');
                        }
                    },
                    onCancel: function(event) {
                        
                    }
                }
            }).appendTo(this);
*/

/*
            emptySpaceVideoQuality = new KONtx.control.EmptySpace({
                styles: {
                    height: KONtx.utility.scale(15),
                    vOffset: ctrls.text_ServerPort.outerHeight
                }
            }).appendTo(this);

    
            videoQualityHeader = new KONtx.control.Header({
                label: 'Video',
                styles: {
                vOffset: emptySpaceVideoQuality.outerHeight,
                }
            }).appendTo(this);

  
//TODO: Pull these values from the server
            ctrls.videoQuality = new KONtx.control.SelectButton({
                id: 'videoQuality',
                guid: 'setting-quality',
                label:    "Quality",
                optionGridRows: 12,
                options: [
                    { value:'1',  label:'1' },
                    { value:'2',  label:'2' },
                    { value:'3',  label:'3' },
                    { value:'4',  label:'4' },
                    { value:'5',  label:'5' },
                    { value:'6',  label:'6' },
                    { value:'7',  label:'7' },
                    { value:'8',  label:'8' },
                    { value:'9',  label:'9' },
                    { value:'10', label:'10' },
                    { value:'11', label:'11' },
                    { value:'12', label:'12' },
                ],
//              cancelDialog: {
//              config: dialogConfigs.awesomeCanceled,
//              },
                events: {
                    onOptionSelected: function (event) {
                        Logger.debug( 'You selected: ' + event.payload.value);
                        Config.set( 'videoQuality', event.payload.value);
                    }
                },
                styles: {
                    vOffset: videoQualityHeader.outerHeight
                }
            }).appendTo(this);

//TODO: Pull these values from the server
            ctrls.videoResolution = new KONtx.control.SelectButton({
                id: 'videoResolution',
                guid: 'setting-resolution',
                label:    'Resolution',
                optionGridRows: 12,
                options: Config.AVAILABLERESOLUTIONS,
//              cancelDialog: {
//              config: dialogConfigs.awesomeCanceled,
//              },
                events: {
                    onOptionSelected: function (event) {
                        Logger.debug( 'You selected: ' + event.payload.value);
                        Config.set( 'videoResolution', event.payload.value);
                    }
                },
                styles: {
                    vOffset: ctrls.videoQuality.outerHeight
                }
            }).appendTo(this);


            emptySpaceTranscoder = new KONtx.control.EmptySpace({
                styles: {
                    height: KONtx.utility.scale(15),
                    vOffset: ctrls.videoResolution.outerHeight
                }
            }).appendTo(this);

            ctrls.transcoderButton = new KONtx.control.ToggleButton({
                id: 'toggle-transcoder',
                label: 'Transcoder:',
                options: [
//                                    { value: Config.TRANSCODEAUTO, label: 'Auto (Recommended)' },
//                                    { value: Config.TRANSCODEFORCE, label: 'Force Transcode' },
                                    { value: Config.TRANSCODEDIRECT, label: 'Direct Play' },
                                    { value: Config.TRANSCODEHLS, label: 'HLS (experimental)'},
                            ],
                            events: {
                                onSelect: function(event) {

                                Config.set( 'transcoder', this.getValue() );
                           }
                },
                styles: {
                    width: this.width,
                    vOffset: emptySpaceTranscoder.outerHeight,
                }
            }).appendTo(this);
            
*/

            emptySpaceActiverwff = new KONtx.control.EmptySpace({
                styles: {
                    height: KONtx.utility.scale(10),
                    vOffset: ctrls.text_ServerPort.outerHeight
                }
            }).appendTo(this);
            
            
            ctrls.playerSettings = new KONtx.control.TextButton({
                id: 'playerSettings',
                label: $_('player_settings_button'),
                styles: {
                    vOffset: emptySpaceActiverwff.outerHeight
                },
                events: {
                    onSelect: function() {
                        KONtx.application.loadView( 'view-PlayerSettings', {} );
                    }
                }
            }).appendTo(this);

            emptySpaceAnimate = new KONtx.control.EmptySpace({
                styles: {
                    height: KONtx.utility.scale(10),
                    vOffset: ctrls.playerSettings.outerHeight
                }
            }).appendTo(this);
                        

            libraryHeader = new KONtx.control.Header({
                label: $_('library_settings_header'),
                styles: {
                    vOffset: emptySpaceAnimate.outerHeight
                }
            }).appendTo(this);

            ctrls.animate = new KONtx.control.ToggleButton({
                id: 'animate',
                label: $_('animations'),
                options: [
                    { value: '1', label: 'On' },
                    { value: '0', label: 'Off' }
                ],
                events: {
                    onSelect: function(event) {
                        if ( this.getValue() === '1' ) {
                            Config.set( 'animate', true );
                        }
                        else {
                            Config.set( 'animate', false );
                        }
                   }
                },
                styles: {
                    width: this.width,
                    vOffset: libraryHeader.outerHeight
                }
            }).appendTo(this);
            
            ctrls.animateNote = new KONtx.element.Text({
                label: $_('restart_required'),
                truncation: 'end',
                styles: {
                    fontSize: '13px',
                    color: '#FFFFFF',
                    textAlign: 'center',
                    width: this.width,
                    vOffset: ctrls.animate.outerHeight
                }
            }).appendTo(this);
            
            ctrls.textTerms = new KONtx.element.Text({
                label: $_('intro_terms', $_('app_title'), Config.TERMSLINK),
                truncation: 'end',
                wrap: 'true',
                styles: {
                    width: this.width,
                    hAlign: 'center',
                    vOffset: ctrls.animateNote.outerHeight + 20,
                    fontSize: 14,
                    fontFamily:'Helvetica',
    //                fontWeight: 'Bold',
                    opacity: 1,
                    color: 'white'
                }
            }).appendTo(this);

            ctrls.aboutButton = new KONtx.control.TextButton({
                id: 'aboutButton',
                label: $_('about_button', $_('app_title')),
                styles: {
                    vAlign: 'bottom'
                },
                events: {
                    onSelect: function() {
                        KONtx.application.loadView( 'view-About', {} );
                    }
                }
            }).appendTo(this);

            ctrls.resetButton = new KONtx.control.TextButton({
                id: 'resetButton',
                label: $_('defaults_button'),
                styles: {
                    vOffset: this.height - (ctrls.aboutButton.height*2)
                },
                events: {
                    onSelect: function() {
                        var dialog;
                        dialog = new KONtx.dialogs.Alert({
                            title: $_('defaults_dialog_title'),
                            message: $_('defaults_dialog_message'),
        
                            buttons: [
                                {
                                    label: $_('dialog_ok_button'),
                                    callback: function() {
                                        Config.reset();
                                        KONtx.HostEventManager.send("exitToDock");
                                    }
                                },
                                { label: $_('dialog_cancel_button') }
                            ]  
                        });
                        
                        dialog.show();                    }
                }
            }).appendTo(this);

            emptySpaceEnd = new KONtx.control.EmptySpace({
                styles: {
                    height: this.height - ctrls.animateNote.outerHeight - (ctrls.aboutButton.height + ctrls.resetButton.height),
                    vOffset: ctrls.animateNote.outerHeight
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
            this._registerHandlers();
            
            //Reset the PlexService so we can do a re-init on exit of this view
            PlexService.resetPlexService();

            //Load initial settings to the controls
            if (Config.get( 'serverIP' ) === Config.DEFAULTIP || !Config.get( 'serverIP' ) ) {
                ctrls.text_ServerIP.setStyle( 'backgroundColor', '#660000');
            }
//            if (!Config.get( 'yahooID' )) {
//                ctrls.yahooID.setStyle( 'backgroundColor', '#660000');
//            }
            ctrls.text_ServerIP.setValue(    Config.get( 'serverIP')         || Config.DEFAULTIP );
            ctrls.text_ServerPort.setValue(  Config.get( 'serverPort' )      || Config.DEFAULTPORT );
//            ctrls.yahooID.setValue(          Config.get( 'yahooID')          || null );
//            ctrls.videoResolution.setValue(  Config.get( 'videoResolution' ) || Config.DEFAULTVIDEORESOLUTIONINDEX );
//            ctrls.videoQuality.setValue(     Config.get( 'videoQuality' )    || Config.DEFAULTVIDEOQUALITY);
//            ctrls.transcoderButton.setValue( Config.get( 'transcoder' )      || Config.TRANSCODEDIRECT);
            ctrls.animate.setValue(          Config.get( 'animate' )    ? '1' : '0' );

        },

        selectView: function() {
            this._registerHandlers();
        },

        hideView: function() {
            this._resetView();
            this._unregisterHandlers();

            this._stale = true;
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