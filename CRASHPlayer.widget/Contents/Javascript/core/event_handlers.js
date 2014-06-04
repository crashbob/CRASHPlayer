
var EventHandlers = {
    
    timelineUpdateInterval: 0,
    playAtOffset: true,
    firstTimeIndexUpdate: true,
    
    onApplicationStartup: function(event) {
            Logger.info( $_( 'starting', $_('app_title') ) );
            PlexService.init();
    },
    
/*    onNetworkConnectionStillDisconnected: function(event) {
        Logger.debug( 'We are still disconnected' );
        
        
    },
*/

    handleHostEvent: function(event) {
        var currentProfile, newVersion, oldVersion, newInstall, upgrade, appMjV, appMnV, appBlV, deviceInfo;
        
        switch(event.type) {
            
            case 'onActivateSnippet':
                if (! Config.get('ranOnce') ) {
                    event.preventDefault();
                    event.stopPropagation();
                    KONtx.application.setHostResultToViewId(event, 'view-Welcome', {} );
                }
                else if ( ! Config.ready() ) {
                    event.preventDefault();
                    event.stopPropagation();
                    KONtx.application.setHostResultToViewId(event, 'view-Settings', {} );
                }

                appMjV = Config.get('appMajorVersion');
                appMnV = Config.get('appMinorVersion');
                appBlV = Config.get('appBuildVersion');

                if (   ( appMjV === undefined )
                    || ( Config.appMajorVersion > appMjV )
                    || ( Config.appMajorVersion >= appMjV && Config.appMinorVersion > appMnV )
                    || ( Config.appMajorVersion >= appMjV && Config.appMinorVersion > appMnV && Config.appBuildVersion >= appBlV )
                ){
                    Logger.debug('New Version');
                    newVersion = Config.appMajorVersion + '.' + Config.appMinorVersion + '.' + Config.appBuildVersion;
                    newInstall = (Config.get('appMajorVersion') === undefined ) || false;
                    upgrade = true;
                }
                oldVersion = appMjV + '.' + appMnV + '.' + appBlV;

                Logger.debug('New Version: ' + newVersion + ' Old Version: ' + oldVersion);
                Config.set('appMajorVersion', Config.appMajorVersion);
                Config.set('appMinorVersion', Config.appMinorVersion);
                Config.set('appBuildVersion', Config.appBuildVersion);


                currentProfile = profile.getCurrentProfile();

                deviceInfo  = "|Version=";
                deviceInfo += newVersion || oldVersion;
//                deviceInfo += "|YahooID=" + encodeURIComponent(Config.get( 'yahooID' ));
                deviceInfo += "|YahooID=Production";
                deviceInfo += "|ProfileName=" + encodeURIComponent(currentProfile.name);
                deviceInfo += "|DevicePartner=" + encodeURIComponent(tv.system.OEM);
                deviceInfo += "|DeviceDescription=" + encodeURIComponent(tv.system.deviceDescription);
                deviceInfo += "|DeviceId=" + encodeURIComponent(tv.system.deviceId);
                deviceInfo += "|DeviceVersion=" + encodeURIComponent(tv.system.deviceVersion);
                deviceInfo += "|DeviceSoftwareVersion=" + encodeURIComponent(tv.system.deviceSoftwareVersion);
                deviceInfo += "|Clock=" + encodeURIComponent(tv.system.clock);
                deviceInfo += "|AspectRatio=" + encodeURIComponent(tv.system.aspectRatio);
                deviceInfo += "|MenuLanguage=" + encodeURIComponent(tv.system.menuLanguage);
                deviceInfo += "|Country=" + encodeURIComponent(tv.system.country);
                deviceInfo += "|DeviceModel=" + encodeURIComponent(tv.system.deviceModel);
                deviceInfo += "|DeviceClass=" + encodeURIComponent(tv.system.deviceClass);
                deviceInfo += "|DeviceBrand=" + encodeURIComponent(tv.system.deviceBrand);  
                deviceInfo += "|NetworkType=" + encodeURIComponent(tv.system.networkType);
                deviceInfo += "|WirelessSignalStrength=" + encodeURIComponent(tv.system.wirelessSignalStrength);
                deviceInfo += "|DeviceDisplayType=" + encodeURIComponent(tv.system.deviceDisplayType);
                deviceInfo += "|VChipStatus=" + encodeURIComponent(tv.system.vChipStatus);
                deviceInfo += "|VChipRatingSystem=" + encodeURIComponent(tv.system.vChipRatingSystem);
                deviceInfo += "|LocationCode=" + encodeURIComponent(tv.system.locationCode);
                deviceInfo += "|DeviceInfo=" + encodeURIComponent(tv.system.deviceInfo);
                deviceInfo += "|Power=" + encodeURIComponent($dump(tv.system.power).replace(/(\r\n|\n|\r)/gm," "));
                deviceInfo += "|Locale=" + encodeURIComponent(widget.locale);
                deviceInfo += upgrade ? '|Upgrade=true' : '';
                deviceInfo += newInstall ? '|newInstall=true' : '';
                
                
                
                Logger.info( deviceInfo, Logger.LOGTOSERVER, 'deviceInfo' );
                
                
                break;
            default:
                
                
                break;
        }
        
    },
    
    onNetworkHideDialog: function(event) {
//TODO: Reload current screen here. Maybe just use a fakeloadview
        Logger.debug('Hiding Network Dialog');

        if(event.payload.type == 1) {




        }
        else {

//            KONtx.application.reloadView( {}, false );
 
        }

    },

    handlerPlayerEvent: function(event) {
        switch(event.type) {
            case 'onStateChange':
                switch(event.payload.newState) {
                case KONtx.mediaplayer.constants.states.PLAY:
                    if(!this._snippetAdded) {
                    KONtx.application.addViewConfig( { id: 'snippet-nowplaying', viewClass: NowPlayingSnippetView } );
                        this._snippetAdded = true;
                    }

                                //This seems to be the best way to start a movie in the middle for Direct Play
                                //At least the best I can find.
                                //It is a hack. We try to play the movie and when we change state to PLAY, 
                                //we seek to the correct location.
                                //TODO: Move this to player.js
                                if ( this.firstTimeIndexUpdate && PlexService.getCurrentMediaPlayFromOffset() && PlexService.getTranscoder() === Config.TRANSCODEDIRECT ) {
                                    Logger.debug( 'Jumping to new starting offset' );
                                    var offset = PlexService.getCurrentMediaOffset() / 1000;
                                    KONtx.mediaplayer.control.seek(offset, true);
                
                                    this.firstTimeIndexUpdate = false;
                                }

                break;
                                case KONtx.mediaplayer.constants.states.UNKNOWN:
                                case KONtx.mediaplayer.constants.states.ERROR:
                                case KONtx.mediaplayer.constants.states.STOP:
                                case KONtx.mediaplayer.constants.states.EOF:
                                        KONtx.application.removeView( 'snippet-nowplaying' );
                                        this._snippetAdded = false;
                                        break;
                }
                break;
            case 'onTimeIndexChanged':
                
                //TODO: Move this to player.js
                if ( this.timelineUpdateInterval >= 5 ) {
                    PlexService.playState(event.payload.rawTimeIndex, event.payload.rawDuration, event.payload.player.tvapi.control.state);
                    this.timelineUpdateInterval = 0;
                }
                else {
                    this.timelineUpdateInterval++;
                }
                break;
            case 'onStartStreamPlayback':
                Logger.debug( 'onStartStreamPlayback' );
                this.firstTimeIndexUpdate = true;
                this.timelineUpdateInterval = 0;
                break;
/*
 *
 *This doesn't work with Plex Media Server really.
 *Ether that, or it just doesn't work. 
 *The server doesn't seem to respect a timeIndex offset on the initial request
 *Neither with transcoding or with direct play. 
 *If we skip the preventDefault line below, then it tries to start playback
 *but immediately tries again at the offset.
 *This seems to do something different, at least while transcoding, but seeking doesn't seem to work great on
 *transcoded video. Doesn't seem to do anything discernable on Direct Play. 
 *Possibly would work better on a high-powered Plex server, but this doesn't
 *seem to be a good solution at this point. Unless I uncover a better transcoding
 *function in the server, then for now, we will just use an Offset on the URL to
 *start playback in the middle of the movie and will have to pursue a custom MediaTransportOverlay
 *So that I can set the timeline as I like it.
 *For Direct Play, we will probably have to wait until the movie starts to play and then seek to the position. 

            case 'onStartStreamPlayback':
                log('About to start playing: ' + event.payload.selectedURL + " at offset " + event.payload.startIndex);
                Config.PMSLog(3, 'onStartStreamPlayback');
                this.timelineUpdateInterval = 0;
                
                log('we are supposed to playAtOffset');
                var offset = PlexService.getCurrentMediaOffset();
                log('Found new offset of: ' + offset);
                if ( offset > 0 ) {
                    this.playAtOffset = false;
                    log('we have an offset. We will play from there');
                    event.preventDefault();
                    event.payload.callbackHandler(event.payload.selectedURL, 1000);
                }
                break;
                
*/                
        }
    }    
};
