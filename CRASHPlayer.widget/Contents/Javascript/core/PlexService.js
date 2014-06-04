var PlexService = {
    init: function() {
        Logger.info( $_('init', $_('media_service')));
        
        this.state = Config.STATE_INIT;

        this._XHRObj = new XMLHttpRequest();

        if ( ! Config.ready() ) {
            Logger.error( $_('no_config', $_('app_title'), $_('media_service')));
            return;
        }

        //Check Connectivity
        this._pingServer();

	KONtx.speedtest.profileConnection(this._saveBandwidth.bindTo(this), null, this._speedTestError.bindTo(this));

        this.startPingTimer();

    },
    
    resetPlexService: function() {
        this.state = Config.STATE_INIT;
        this.abortRequest();
        this.stopPingTimer();
    },

    state: Config.STATE_INIT,
    _adjustedMediaOffset: 0,
    _transcoder: 'DIRECT',

    _serverPingCheck: {},
    _stateChangeListeners: {},
    _XHRObj: {},
    serverName: null,
    serverData: {},
    _currentMedia: {},
    sessionID: null,
    _playFromOffset: false,
    
    useChannels: false,


    _saveBandwidth: function(speed) {
        Logger.debug('Detected Connection Speed: ' + speed);
        Config.set('bandwidth', speed);
    },
	
    _speedTestError: function(xhr) {
        Logger.debug('Bandwidth detection error: ', $dump(xhr,3));
        Config.set('bandwidth', 1);
    },

    
    _getConnectString: function() {
        return Config.PLEX_PROTOCOL + Config.get( 'serverIP' ) + ':' + Config.get( 'serverPort' );
    },

    _getTranscodeConnectString: function() {
        return Config.PLEX_PROTOCOL + Config.PLEX_TRANSCODEIP + ':' + Config.get( 'serverPort' );
    },

    _getQueryParams: function() {
        var url;
        
        //If we specify some of these for Channels, it disables some things that we have no problems supporting. 
//        if (this.useChannels) return '';

        //X-Plex-Client-Identifier=Config.get( 'sessionID' );
        //X-Plex-Client-Platform='YahooCTV'
        //X-Plex-Device-Name='CRASHPlayer'

        url =  'X-Plex-Device=' + encodeURIComponent(tv.system.deviceBrand);
        url += '&X-Plex-Version=' + encodeURIComponent(widget.version);
//url += '&X-Plex-Version=' + '1.2.24';
        url += '&X-Plex-Model=' + encodeURIComponent(tv.system.deviceModel + '-' + tv.system.deviceClass);
//url += '&X-Plex-Platform=Chrome';
        url += '&X-Plex-Platform=YahooCTV';
        url += '&X-Plex-Product=CRASHPlayer';
//url += '&X-Plex-Product=Web Client';
        url += '&X-Plex-Platform-Version=' + encodeURIComponent(tv.system.deviceVersion);
        url += '&X-Plex-Client-Capabilities=' + encodeURIComponent(Config.CLIENTCAPABILITIES);

        return url;
    },

    resetPing: function() {
        Logger.debug( 'Resetting Ping' );

        this.pausePingTimer();  //If ping succeeds, we'll restart it.
        this.abortRequest();
        this.state = Config.STATE_INIT;
        this._pingServer();
    },

    startPingTimer: function() {
        Logger.debug( 'Starting Ping Timer' );
        this.stopPingTimer(); //Make sure we don't already have one
        this._serverPingCheck = KONtx.utility.timer.setInterval( (this._pingServer).bindTo(this), Config.SERVERPINGINTERVALTIER1 );
    },
    
    stopPingTimer: function() {
        Logger.debug( 'Stopping Ping Timer');
        if (this._serverPingCheck && this._serverPingCheck.ticking ) {
            KONtx.utility.timer.clearInterval(this._serverPingCheck);
        }
    },
    
    pausePingTimer: function() {
        Logger.debug( 'Pausing Ping Timer' );
        if (this._serverPingCheck ) {
            this._serverPingCheck.ticking = false;
        }
    },
    
    unpausePingTimer: function() {
        Logger.debug( 'unPausing Ping Timer' );
        if (this._serverPingCheck ) {
            this._serverPingCheck.ticking = true;
        }
    },
    
    //implement a simple event listener
    addStateChangeListener: function(callback, objectKey) {
        Logger.debug( 'Registering for State Change' );

        if (callback && callback.call) {
            this._stateChangeListeners[objectKey] = callback;
        }

        Logger.debug( $dump(this._stateChangeListeners) );
    },
    
    removeStateChangeListener: function(objectKey) {
        Logger.debug( 'UNRegistering for State Change' );
        var property;

        //This doesn't seem to work in this version of JS
//        delete this._stateChangeListeners[objectKey];

        //To minimize garbage creation, let's just set anything matching to undefined
        for ( property in this._stateChangeListeners ) {
            if ( this._stateChangeListeners.hasOwnProperty(property) ) {
                if ( property === objectKey ) {
                    this._stateChangeListeners[property]  = undefined;
                }
            }
        }

        Logger.debug( $dump(this._stateChangeListeners) );

    },

    resetStateChangeListener: function() {
        var property;
        
        for ( property in this._stateChangeListeners ) {
            if ( this._stateChangeListeners.hasOwnProperty(property) ) {
                this._stateChangeListeners[property]  = undefined;
            }
        }
    },

    _fireOnStateChange: function(event) {
        Logger.debug('Firing State Change Callbacks');
        var key;

        for ( key in this._stateChangeListeners ) {
            if (this._stateChangeListeners.hasOwnProperty(key)) {
                if ( this._stateChangeListeners[key] && this._stateChangeListeners[key].call) {
                    this._stateChangeListeners[key](event);
                }
            }
        }
        
    },

    _pingServer: function(callback) {

        var pingUrl, handleResponse, eventPayload;

        eventPayload = {
            oldState: PlexService.state,
            serverURL: PlexService._getConnectString(),
            serverIP: Config.get( 'serverIP' ),
            serverPort: Config.get( 'serverPort' )
        };

        handleResponse = {

            onSuccess: function(response) {
                Logger.info( $_('plex_alive'));

                //Only fire this if we changed status.
                if ( PlexService.state !== Config.STATE_READY ) {

                    PlexService.serverData = response;
                    PlexService.serverName = response.friendlyName;
                    Logger.debug( 'FriendlyName: ' + PlexService.serverName);

                    eventPayload.newState = Config.STATE_READY;
                    eventPayload.serverName = response.friendlyName;

                    Logger.debug( 'Throwing onStateChange - READY' );
                    PlexService._fireOnStateChange( eventPayload );

                    Logger.debug( 'Plex Server is now available' );
                    PlexService.state = Config.STATE_READY;
                    
                }

                PlexService.unpausePingTimer();

                if (callback && callback.onSuccess && callback.onSuccess.call ) {
                    callback.onSuccess();
                }
            },
            onError: function(message, status) {
                Logger.error( $_('ping_error') );

                //Only fire this if we changed status.
                if ( PlexService.state !== Config.STATE_ERR ) {

                    PlexService.serverData = {};
                    PlexService.serverName = null;

                    eventPayload.newState = Config.STATE_ERR;
                    eventPayload.serverName = null;
                    eventPayload.message = message;
                    eventPayload.statusCode = status;

                    Logger.debug( 'Throwing onStateChange - ERROR' );
                    PlexService._fireOnStateChange( eventPayload );
                    PlexService.state = Config.STATE_ERR;
                }

                PlexService.unpausePingTimer();

                if (callback && callback.onError && callback.onError.call ) {
                    callback.onError();
                }

            },
            onTimeout: function(message, status) {
                Logger.error( $_('ping_timeout') );

                //Only fire this if we changed status.
                if ( PlexService.state !== Config.STATE_TIMEOUT ) {

                    PlexService.serverData = {};
                    PlexService.serverName = null;

                    eventPayload.newState = Config.STATE_TIMEOUT;
                    eventPayload.serverName = null;
                    eventPayload.message = message;
                    eventPayload.statusCode = status;

                    Logger.debug( 'Throwing onStateChange - TIMEOUT' );
                    PlexService._fireOnStateChange( eventPayload );
                    PlexService.state = Config.STATE_TIMEOUT;
                }
                
                PlexService.unpausePingTimer();

                if (callback && callback.onTimeout && callback.onTimeout.call) {
                    callback.onTimeout();
                }
                else if (callback && callback.onError && callback.onError) {
                    callback.onError();
                }

            }
        };

        pingUrl = this._getConnectString();
        pingUrl += '?' + this._getQueryParams();

        Logger.debug( 'Attempting to ping Plex server: ' + pingUrl );

        this._makeIsolatedCall({
            url: pingUrl,
            timeout: Config.PINGTIMEOUT,
            callbackObj: handleResponse
        });
    },

    generateImageURL: function(thumbKey, width, height, format) {
        var url;

        format = format || Config.THUMBFORMAT;
        
        url =  this._getConnectString() + Config.PLEX_PHOTOTRANSCODE;

        if (thumbKey && (thumbKey.startsWith( 'http://' ) || thumbKey.startsWith( 'https://' ) ) ) {
            url += 'url=' + encodeURIComponent(thumbKey);
        }
        else {
            url += 'url=' + encodeURIComponent( this._getTranscodeConnectString() + thumbKey);
        }

        url += '&width=' + width + '&height=' + height;
        url += '&format=' + format + '&background=' + Config.PHOTOBGCOLOR;

        return url;
    },
    
    //checkFiles tells PMS to validate that the file is available. Only makes sense for metadata keys that refer to actual media files.
    getMediaMetadata: function(params) {
        var handleResponse, url, timeout, startIndex;
        
//    getMediaMetadata: function(mediaKey, callback, checkFiles, makeCurrentMedia, errorCallback, noTrack) {
        Logger.debug( 'Loading MediaMetadata for ' + params.mediaKey );
        

        this._adjustedMediaOffset = params.makeCurrentMedia ? 0 : this._adjustedMediaOffset;

        handleResponse = {
                onSuccess: function(response) {
                    response.urlPrefix = params.mediaKey;
                    PlexService._currentMedia = params.makeCurrentMedia ? response : PlexService._currentMedia;
                    if (params.callback && params.callback.call){
                        params.callback(response);
                    }
                },
                onError: function(message, status) {
                    Logger.error( $_('load_error', params.mediaKey ));
                    if ( params.errorCallback && params.errorCallback.call ) {
                        params.errorCallback(message, status);
                    }
                }
        };

        url = this._getConnectString() + params.mediaKey;

        if (params.page >=0 && params.perPage ) {
            url += ((url.indexOf('?') > 0 ) ? '&' : '?');

            startIndex = params.page * params.perPage;
            url += Config.PLEX_STARTINDEX + startIndex;
            url += '&' + Config.PLEX_PAGESIZE + params.perPage;
        }

        if (params.checkFiles && !this.useChannels) {
            url += ((url.indexOf('?') > 0 ) ? '&' : '?');
            url += 'checkFiles=1';
        }
        
        url += ((url.indexOf('?') > 0 ) ? '&' : '?');
        url += this._getQueryParams();
        
        timeout = this.useChannels ? Config.CHANNELCONNECTTIMEOUT : Config.SERVERCONNECTTIMEOUT;

        if (params.isolated) {
            this._makeCall({
                url: url,
                timeout: timeout,
                callbackObj: handleResponse,
            });
        }
        else {
            this._makeCall({
                url: url,
                timeout: timeout,
                callbackObj: handleResponse,
            });
        }
    },
    
    getCurrentMedia: function() {
        return this._currentMedia;
    },
    
    getCurrentMediaVideoTag: function() {
        var i;

        for ( i = 0; i < (this._currentMedia._children.length); i++ ) {
            if ( this._currentMedia._children[i]._elementType === 'Video' ) {
                return this._currentMedia._children[i];
            }
        }

        return false;
    },
    
    getCurrentMediaMediaTags: function() {
        var video, i, mediaTags;
        
        video = this.getCurrentMediaVideoTag();
        mediaTags = [];
        
        for ( i = 0; i < video._children.length; i++ ) {
            if ( video._children[i]._elementType === 'Media' ) {
                mediaTags.push(video._children[i]);
            }
        }
        
        return mediaTags;
        
    },
    
    getCurrentMediaMediaTag: function(index) {
        return this.getCurrentMediaMediaTags()[index];
    },
    
    
    getCurrentMediaParts: function(index) {
        var media, i, parts;
        
        media = this.getCurrentMediaMediaTag(index);
        parts = [];
        
        for ( i = 0; i < media._children.length; i++ ) {
            if ( media._children[i]._elementType === 'Part' ) {
                parts.push(media._children[i]);
            }
        }

        return parts;
    },
    
    getCurrentMediaPart: function(mediaIndex, partIndex) {
        var parts;
        
        parts = this.getCurrentMediaParts(mediaIndex);
        
        return parts[partIndex];
        
    },
    
    
    getCurrentMediaPartStreams: function(mediaIndex, partIndex, streamType ) {
        var part, streams, i;

        part = this.getCurrentMediaPart( mediaIndex, partIndex );
        streams = [];
        for ( i = 0; i < part._children.length; i++ ) {
            if ( part._children[i]._elementType === 'Stream' ) {
                if (!streamType) {
                    streams.push(part._children[i]);
                }
                else if ( parseInt(part._children[i].streamType, 10) === streamType ) {
                    streams.push(part._children[i]);
                }
            }
        }

        return streams;
    },
    
    getCurrentMediaPartStream: function(mediaIndex, partIndex, streamIndex, streamType ) {
        return this.getCurrentMediaPartStreams(mediaIndex, partIndex, streamType )[streamIndex];
    },

/* Might need this again when we get to transcoding. 
    getCurrentMediaResolution: function() {
        var width, height;
        
        width = Config.AVAILABLERESOLUTIONS[ Config.get( 'videoResolution' ) ].width;
        height = Config.AVAILABLERESOLUTIONS[ Config.get( 'videoResolution' )].height;
        
        if ( this.getCurrentMediaMediaTag(0).width < width || this._transcoder === Config.TRANSCODEDIRECT ) {
            width = this.getCurrentMediaMediaTag(0).width;
            Logger.debug( 'media width is lower than max. Setting width to: ' + width);
        }
        if ( this.getCurrentMediaMediaTag(0).height < height || this._transcoder === Config.TRANSCODEDIRECT ) {
            height = this.getCurrentMediaMediaTag(0).height;
            Logger.debug( 'media height is lower than max. Setting height to: ' + height);
        }

        Logger.debug( 'max resolution is: ' + height + 'x' + width );

        return { width: width, height: height };

    },
*/    
    getTranscoder: function() {
        return this._transcoder;
    },
    
    //Pass TRUE to use the media's saved progress offset. Pass a number to specify an offset.
    getCurrentMediaURL: function(mediaOffset, stream, part) {
        Logger.debug( 'Getting Current Media URL' );
        var url, transcoder;

        stream = stream || 0;
        part = part || 0;

        transcoder = Config.get( 'transcoder' );

        if ( transcoder === Config.TRANSCODEAUTO ) {
            if ( this._currentMediaCanDirectPlay() ) {
                Logger.debug( 'We can direct play.' );
                transcoder = Config.TRANSCODEDIRECT;
            }
            else {
                Logger.debug( 'Unable to direct play.' );
                transcoder = Config.TRANSCODEFORCE;
            }
        }
        this._transcoder = transcoder;

//        resolution = this.getCurrentMediaResolution();    // Might need this when we get back to transcoding

        if ( transcoder === Config.TRANSCODEDIRECT ) {
            Logger.debug( 'Trying to direct play' );

            url = this._getConnectString() + this.getCurrentMediaPart(stream, part).key;

            if (mediaOffset) {
                Logger.debug( 'mediaOffset = ' + mediaOffset);
                if ( mediaOffset !== true && mediaOffset > 0 ) {
                    this._adjustedMediaOffset = mediaOffset;
                }
            }
            else {
                this._adjustedMediaOffset = 0;
            }

        }
        //This will probably all go away
/*        else if ( transcoder === Config.TRANSCODEFORCE ) {
            Logger.debug( 'Trying to transcode' );
            url =  this._getConnectString() + Config.PLEX_GENERICVIDEOTRANSCODEURL;
            url += 'url=' + encodeURIComponent( this._getTranscodeConnectString() + this.getCurrentMediaPart(0, 0).key);
            url += '&session=' + Config.get( 'sessionID' );
            url += Config.PLEX_GENERICTRANSCODEVIDEOFORMAT;
            //This doesn't seem to do anything with generic transcoder. See QUALITY
            //url += Config.PLEX_GENERICTRANSCODEVIDEOBITRATE;
            url += Config.PLEX_GENERICTRANSCODEAUDIOFORMAT + Config.PLEX_GENERICTRANSCODEAUDIOBITRATE;
            url += '&width=' + resolution.width + '&height=' + resolution.height;
            url += '&quality=' + Config.get( 'videoQuality' );
            if (mediaOffset) {
                if ( mediaOffset !== true && mediaOffset > 0 ) {
                    this._adjustedMediaOffset = mediaOffset;
                    url += '&offset=' + mediaOffset;
                }
                else {
                    this._adjustedMediaOffset = 0;
                    url += '&offset=' + ( this.getCurrentMediaOffset() / 1000);
                }
            }

        }
        */
        //This will surely all go away
/*        else if ( transcoder === Config.TRANSCODEHLS ) {
            Logger.debug( 'Trying to transcode to HLS' );
            url =  this._getConnectString() + Config.PLEX_UNIVERSALVIDEOTRANSCODEURL;
            url += 'protocol=hls';
            url += '&path=' + encodeURIComponent( this._getTranscodeConnectString() + this.getCurrentMediaVideoTag().key);
            url += '&session=' + Config.get( 'sessionID' );
            url += '&waitForSegments=1';
            url += '&directPLay=0&directStream=1';
            url += '&videoQuality=100&videoResolution=' + Config.AVAILABLERESOLUTIONS[ Config.get( 'videoResolution' ) ].width + 'x' + Config.AVAILABLERESOLUTIONS[ Config.get( 'videoResolution' )].height;
            url += '&maxVideoBitrate=20000&subtitleSize=125&audioBoost=100&partIndex=0';
            url += '&X-Plex-Platform=Roku&X-Plex-Product=Plex%20for%20Roku&X-Plex-Device=Roku%202%20XS';            
            if (mediaOffset) {
                if ( mediaOffset !== true && mediaOffset > 0 ) {
                    url += '&offset=' + mediaOffset;
                    this._adjustedMediaOffset = mediaOffset;
                }
                else {
                    this._adjustedMediaOffset = 0;
                    url += '&offset=' + ( this.getCurrentMediaOffset() / 1000);
                }
            }
        }
*/
        this._playFromOffset = mediaOffset ? true : false;
        
        Logger.debug( 'returning URL: ' + url );
        
        return url;

    },

    getCurrentMediaPlaylist: function(withOffset, callback, errorCallback) {
        var playlist, handleResponse, mediaTagsCount, i, streams, timeout, gotStreamsCount, _addStream, j, newEntries, x;
        
        gotStreamsCount = 0;

        _addStream = function(media, arrayPosition) {
            var mediaURL, mediaKey;
            gotStreamsCount++;

            for ( j = 0; j < media._children.length; j++ ) {
                mediaKey = media._children[j].key;
                
                if (!newEntries[j]) {
                    newEntries[j] = {};
                    newEntries[j].streams = [];
                }

    
                if ( mediaKey.startsWith('http://') || mediaKey.startsWith('https://') || mediaKey.startsWith('rtmp://') || mediaKey.startsWith('rtmpe://') ) {
                    mediaURL = mediaKey;
                }
                else {
                    mediaURL = PlexService.getCurrentMediaURL(withOffset, arrayPosition, j);
                }
    
/*                streams[arrayPosition] = {
                    url: mediaURL,
                    bitrate: media.bitrate,
                    resolution: media.videoResolution,
                    container: media.container,
                    videoCodec: media.videoCodec,
                    audioCodec: media.audioCodec,
                    frameRate: media.videoFrameRate,
                    width: media.width,
                    height: media.height
                };
*/

                newEntries[j].streams[arrayPosition] = {
                    url: mediaURL,
                    bitrate: media.bitrate,
                    resolution: media.videoResolution,
                    container: media.container,
                    videoCodec: media.videoCodec,
                    audioCodec: media.audioCodec,
                    frameRate: media.videoFrameRate,
                    width: media.width,
                    height: media.height
                };

            }
            
            if ( gotStreamsCount === mediaTagsCount ) {
                //Got them all.
                for ( x = 0; x < newEntries.length; x++ ) {
                    playlist.entries.push({ entryID: x, streams: newEntries[x].streams})
                }
//                playlist.entries.push({ entryID: j, streams: streams});
                callback(playlist);
            }

        };

        //arrayPosition is passed so we keep the streams in the same order
        handleResponse = function(arrayPosition) {
            return {
                onSuccess: function(response) {
                    Logger.debug( 'Got Channel Media' );
                    _addStream(response._children[0]._children[0], arrayPosition);
                },
                onError: function(message, status) {
                    //TODO: Only fail completely if we have no streams but we are done loading everything
                    Logger.error( $_('error_string', + status + ' : ' + message ));
                    errorCallback(message, status);
                }
            };
        };


        mediaTagsCount = this.getCurrentMediaMediaTags().length;
        playlist = { entries: [] };
        streams = [];
        newEntries = [];
        
        timeout = this.useChannels ? Config.CHANNELCONNECTTIMEOUT : Config.SERVERCONNECTTIMEOUT;

        
        for ( i = 0; i < mediaTagsCount; i++ ) {

            if ( this.getCurrentMediaMediaTag(i).indirect ) {
                this._makeIsolatedCall({
                    url: this._getConnectString() + this.getCurrentMediaPart(i, 0).key,
                    timeout: timeout,
                    callbackObj: handleResponse(i),
                });
            }
            else {
                
                _addStream(this.getCurrentMediaMediaTag(i), i);
            }
        }
    
    },
        
    getCurrentMediaPlayFromOffset: function() {
        return this._playFromOffset;
    },
    
    getCurrentMediaOffset: function() {
        Logger.debug( 'Getting media offset' );

        if (this._adjustedMediaOffset) {
            return this._adjustedMediaOffset;
        }
        
        if ( this.getCurrentMediaVideoTag().viewOffset ) {
            return ( this.getCurrentMediaVideoTag().viewOffset );
        }

        return 0;

    },

    getCurrentMediaAvailable: function() {
        
        //If it's a channel, assume available...
        if ( this.useChannels ) {
            return true;
        }
        
        if ( this.getCurrentMediaPart(0, 0).accessible && this.getCurrentMediaPart(0, 0).accessible == 1 ) {
            Logger.debug( 'Media is available' );
            return true;
        }
        Logger.debug( 'Media is NOT available' );
        return false;
    },

    //This function is irrelevant right now
    _currentMediaCanDirectPlay: function() {
        Logger.debug( 'Checking to see if current media can direct play' );
        var mediaTag;
        
        mediaTag = this.getCurrentMediaMediaTag(0);

        Logger.debug( 'Container: ' + mediaTag.container + ', Video Codec: ' + mediaTag.videoCodec + ', Audio Codec: ' + mediaTag.audioCodec);
        
        if ( Config.SUPPORTEDCONTAINERS.indexOf( mediaTag.container ) < 0 ) {
            Logger.debug( 'container: ' + mediaTag.container + ' is not in the list of supported containers' );
            return false;
        }
        
        if ( Config.SUPPORTEDVIDEOCODECS.indexOf( mediaTag.videoCodec ) < 0 ) {
            Logger.debug( 'video codec: ' + mediaTag.videoCodec + ' is not in the list of supported video codecs' );
            return false;
        }
        
        if ( Config.SUPPORTEDAUDIOCODECS.indexOf( mediaTag.audioCodec ) < 0 ) {
            Logger.debug( 'container: ' + mediaTag.audioCodec + ' is not in the list of supported audio codecs' );
            return false;
        }
        
        if ( mediaTag.resolution > Config.AVAILABLERESOLUTIONS[ Config.get( 'videoResolution' ) ].width ) {
            Logger.debug( 'video resolution: ' + mediaTag.resolution + ' is is lower than our max resolution of ' + Config.AVAILABLERESOLUTIONS[ Config.get( 'videoResolution' ) ].width );
            return false;
        }
        
        return true;
    },

    log: function (logLevel, message) {
        log( 'Sending log to server' );
        var url, handleResponse;

        handleResponse  =  {
            onSuccess: function() {
                log( 'Successfully Logged Message: ' + message );
                log( 'LogLevel: ' + logLevel );
            },
            onError: function() {
                log( 'Error sending log message to server' );
            }
        };

        url = this._getConnectString() + Config.PLEX_LOGGER + '&level=' + logLevel + '&message=' + encodeURIComponent(message);

        this._makeIsolatedCall({
            url: url,
            timeout: Config.SERVERCONNECTTIMEOUT,
            callbackObj: handleResponse,
        });

    },

    //http://192.168.1.31:32400/:/timeline?time=0&duration=10689439&state=buffering&ratingKey=323&key=%2Flibrary%2Fmetadata%2F323&containerKey=http%3A%2F%2F192.168.1.31%3A32400%2Flibrary%2Fsections%2F1%2Fall
    playState: function(currentProgress, mediaDuration, playState, callback) {
        var url, handleResponse;

        //Don't do this if playing a Channel
        if (this.useChannels) {
            return;
        }

        Logger.debug( 'Reporting play progress and state' );

        handleResponse  =  {
            onSuccess: function(response) {
                Logger.debug( 'Successfully updated progress');
                if ( callback && callback.call ) {
                    callback(response);
                }
            },
            onError: function() {
                Logger.error( $_('progress_error'));
            }
        };


        if ( this._playFromOffset && this._transcoder !== Config.TRANSCODEDIRECT ) {
            Logger.debug( 'Transcoding, so adding start offset to progress time: ' + this.getCurrentMediaOffset() );
            currentProgress += parseInt(this.getCurrentMediaOffset(), 10);
        }

        url  = this._getConnectString() + Config.PLEX_TIMELINEUPDATE;
        url += 'time=' + currentProgress;
        url += '&duration=' + mediaDuration;
        url += '&state=' + this._stateDictionary[playState];
        url += '&ratingKey=' + this.getCurrentMediaVideoTag().ratingKey;
        url += '&key=' + encodeURIComponent(this.getCurrentMediaVideoTag().key);

        url += ((url.indexOf('?') > 0 ) ? '&' : '?');
        url += this._getQueryParams();

        this._makeIsolatedCall({
            url: url,
            timeout: Config.SERVERCONNECTTIMEOUT,
            callbackObj: handleResponse,
        });

    },

    //Mark watched or unwatched
    scrobble: function(ratingKey, scrobble, callback) {
        Logger.debug('Scrobbling for key: ' + ratingKey);
        var handleResponse, url;
        
        handleResponse  =  {
            onSuccess: function(response) {
                Logger.debug( 'Successfully Scrobbled or Unscrobbled');
                if ( callback && callback.call ) {
                    callback(response);
                }
            },
            onError: function() {
                Logger.error( 'Error scrobbling' );
            }
        };

        url = this._getConnectString();
        url += scrobble ? Config.PLEX_SCROBBLE : Config.PLEX_UNSCROBBLE;
        url += '&key=' + ratingKey;
        
        url += ((url.indexOf('?') > 0 ) ? '&' : '?');
        url += this._getQueryParams();

        this._makeCall({
            url: url,
            timeout: Config.SERVERCONNECTTIMEOUT,
            callbackObj: handleResponse
        });
    },
    
    _stateDictionary: {
        '6'  :'emptybuffer',
        '5'  :'buffering',
        '8'  :'eof',
        '10' :'error',
        '2'  :'fastfowarding',
        '7'  :'infoloaded',
        '-1' :'initializing',
        '1'  :'pausing',
        '0'  :'playing',
        '3'  :'rewinding',
        '4'  :'stopping',
        '9'  :'unknown'
    },
    
    abortRequest: function() {
        if ( this.state === Config.STATE_READY ) {
            Logger.debug( 'Aborting any in-flight requests' );

            var timer;
            
            if (this._XHRObj && this._XHRObj.abort && this._XHRObj.abort.call ) {
                this._XHRObj.abort();
            }

            timer = this._XHRTimer;
            if ( timer && timer.ticking ) {
                KONtx.utility.timer.clearTimeout(timer);
            }
        }
    },

//    _makeCall: function (url, timeout, callbackObj) {
    _makeCall: function (params) {
        Logger.debug( 'Executing XHR Call to ' + params.url);
        var handleResponse, handleError, handleTimeout, XHRCall;

        //If the network is down, don't even bother
        if ( KONtx.application.isPhysicalNetworkDown() ) {
            Logger.fatal( $_('network_down') );
            return;
        }


        handleTimeout = function() {
            Logger.error( $_('call_timeout', 'XHR' ));

            //We timed out, so abort the request
            this._XHRObj.abort();

            //If we timed out, let's make sure the server is still responding
            if ( params.callbackObj && params.callbackObj.onTimeout && params.callbackObj.onTimeout.call ) {
                Logger.debug('ONTIMEOUT');
                this._pingServer(this._refetchPing( (params.callbackObj.onTimeout).bindTo(this), 'Request Timed Out' ) );
            }
            else if ( params.callbackObj && params.callbackObj.onError && params.callbackObj.onError.call ) {
                Logger.debug('ONERROR');
                this._pingServer(this._refetchPing( (params.callbackObj.onError).bindTo(this), 'Request Timed Out' ) );
            }

            //Reset the global XHRObject so we don't hold reference to stuff for too long. 
            this._XHRObj = undefined;
        };


        handleResponse = function() {
            Logger.debug( 'Recieved XHR State Change: State: ' + this._XHRObj.readyState + ' Status: ' + this._XHRObj.status);
            var status, message, responseObj, title, returnedError, contentLength;

            if ( this._XHRObj.readyState == 4 ) {
                returnedError = false;

                //Didn't timeout, so kill the timer
                KONtx.utility.timer.clearTimeout(this._XHRTimer);

                //Build an object from the response
                if (this._XHRObj.responseXML) {

                    //Channels don't give us JSON response. Converting the XML to JSON takes too much memory for really large responses.
                    //    So, we're going to cap the size and reject anything larger.
                    Logger.debug( 'CONTENT-LENGTH: ' + this._XHRObj.getResponseHeader("Content-Length")/1024);        
                    contentLength = this._XHRObj.getResponseHeader("Content-Length")/1024;
                    if ( contentLength > Config.XMLRESPONSESIZELIMITKB ) {
                        returnedError = true;
                        title = $_('huge_response');
                        message = $_('huge_response_message');
                        status = null;
                    }
                    else {
                        responseObj = Utility.xmlToJson(this._XHRObj.responseXML);
                    }
                }
                else if (this._XHRObj.responseText) {
                    responseObj = JSON.parse(this._XHRObj.responseText);
                }
                else {
                    responseObj = {};
                }


//This response can be big, so I don't want to send it through the Logger where it might get sent to the server
//TODO: Make this automatically disable when not in SIMULATOR
//log(this._XHRObj.responseText);

                if ( this._XHRObj.status == 200 && !returnedError ) {
                    Logger.debug( 'Received a valid response' );

                    if (!responseObj._children && responseObj.header ) {
                        //This looks like we probably got an error returned
                        handleError({title: responseObj.header, message: responseObj.message, status: this._XHRObj.status, callback: params.callbackObj});
                        return;
                    }
                    else if (!responseObj.code && responseObj.status ) {
                        //This looks like an error, too
                        handleError( {message: $_('error_string', responseObj.code + ": " + responseObj.status), status: responseObj.status, callback: params.callbackObj});
                        return;
                    }

                    //Looks like a valid response with good data
                    //Reset the global XHRObject so we don't hold reference to stuff for too long. 
                    this._XHRObj = undefined;
                    this.unpausePingTimer();

                    if ( params.callbackObj && params.callbackObj.onSuccess && params.callbackObj.onSuccess.call) {
                        Logger.debug( 'calling XHR callback' );
                        params.callbackObj.onSuccess(responseObj);
                    }
                    
                }
                else if ( this._XHRObj.status === 0 ) {
                    Logger.error( $_('xhr_error', + this._XHRObj.status));

                    this._pingServer(this._refetchPing( handleError.bindTo(this), {status: this._XHRObj.status, callback: params.callbackObj} ) );

                }
                else {
                    if (responseObj) {
                        title = responseObj.header || '';
                        status = responseObj.code || this._XHRObj.status;
                        message = $_('plex_error');
                        message += responseObj.message || responseObj.status || '';
                        message = $_('error_code') + status + " : " + message;
                    }
                    else {
                        status = this._XHRObj.status;
                        message = undefined;
                    }

                    handleError({title: title, message: message, status: status, callback: params.callbackObj});
                }
            }
        };

        handleError = (function(params) {
            Utility.requestFailDialog({
                title: params.title || $_('plex_error_title'),
                message: params.message || $_('plex_server_default_message')
            }, true).show();

            if ( params.callback && params.callback.onError && params.callback.onError.call) {
                params.callback.onError(params.title + " " + params.message, params.status);
            }

            //Reset the global XHRObject so we don't hold reference to stuff for too long. 
            this._XHRObj = undefined;
            this.unpausePingTimer();

        }).bindTo(this);

        //Put this in a function so that we can call it all again if the request fails and we want to refetch it
        XHRCall = (function() {

            if ( this._XHRObj ) {
                //Abort anything already in flight. Otherwise a delayed response might stomp on something fired later but finished first.
                this._XHRObj.abort();
            }
            else {
                this._XHRObj = new XMLHttpRequest();
            }
    
            //If we have a timer ticking, we need to abort it as well.
            if (this._XHRTimer && this._XHRTimer.ticking) {
                KONtx.utility.timer.clearTimeout(this._XHRTimer);
            }

            this._XHRObj.onreadystatechange = handleResponse.bindTo(this);
            this._XHRObj.open( 'GET', params.url, true);
            this._XHRObj.setRequestHeader( 'Accept', 'application/json' );
            this._XHRObj.setRequestHeader( 'X-Plex-Client-Identifier', Config.get( 'sessionID' ) );
            Logger.debug( 'Sending Request' );
            this._XHRObj.send();

            this._XHRTimer = KONtx.utility.timer.setTimeout( handleTimeout.bindTo(this), params.timeout);
        }).bindTo(this);


        this.pausePingTimer();

        if ( this.state !== Config.STATE_READY ) {
            this._pingServer( this._refetchPingCheck(XHRCall, params.callbackObj && params.callbackObj.onError ) );
        }
        else {
            XHRCall();
        }
    },
    
    
    _refetchPing: function(callback, params) {
        return {
            onSuccess: function() {
                Utility.requestFailDialog({
                    title: $_('request_error_dialog_title'),
                    message: $_('request_error_message') + " " + $_('retry_request_message'),
                }).show();
                if (callback && callback.call) {
                    callback(params);
                }
            },
            onError: function() {
                Utility.requestFailDialog({
                    title: $_('plex_error_title'),
                    message: $_('plex_server_down'),
                }).show();
                if (callback && callback.call) {
                    callback(params);
                }
            }
        };
    },
    
    _refetchPingCheck: function(onSuccess, onError) {
        return {
            onSuccess: onSuccess,
            onError: function() {
                Utility.requestFailDialog({
                    title: $_('plex_error_title'),
                    message: $_('plex_server_down'),
                }).show();
                if ( onError && onError.call ) {
                    onError();
                }
            }
        };
    },

    _makeIsolatedCall: function (params) {
        Logger.debug( 'Executing XHR Call to ' + params.url);
        var handleResponse, handleTimeout, reqObj, timer;

        //If the network is down, don't even bother
        if ( KONtx.application.isPhysicalNetworkDown() ) {
            Logger.fatal( $_('network_down') );
            return;
        }


        handleTimeout = function() {
            Logger.error( $_('call_timeout', 'XHR' ));

            //We timed out, so abort the request
            reqObj.abort();

            if ( params.callbackObj && params.callbackObj.onTimeout && params.callbackObj.onTimeout.call ) {
                Logger.debug('ONTIMEOUT');
                params.callbackObj.onTimeout( 'Request Timed Out' );
            }
            else if ( params.callbackObj && params.callbackObj.onError && params.callbackObj.onError.call ) {
                Logger.debug('ONERROR');
                params.callbackObj.onError( 'Request Timed Out' );
            }
        };

        handleResponse = function() {
            Logger.debug( 'Recieved XHR State Change: State: ' + reqObj.readyState + ' Status: ' + reqObj.status);
            var status, message, responseObj, title, returnedError;

            if ( reqObj.readyState == 4 ) {
                returnedError = false;
                
                KONtx.utility.timer.clearTimeout(timer);
                
                if (reqObj.responseXML) {
                    responseObj = Utility.xmlToJson(reqObj.responseXML);
                }
                else if (reqObj.responseText) {
                    responseObj = JSON.parse(reqObj.responseText);
                }
                else {
                    responseObj = reqObj.status;
                }

                if ( reqObj.status == 200 ) {
                    Logger.debug( 'Received a valid response' );

//This response can be big, so I don't want to send it through the Logger where it might get sent to the server
//TODO: Make this automatically disable when not in SIMULATOR
//log(reqObj.responseText);

                    if (!responseObj._children && responseObj.header ) {
                        //This looks like we probably got an error returned
                        returnedError = true;
                        title = responseObj.header;
                        message = responseObj.message;
                        status = reqObj.status;
                    }
                    else if (!responseObj.code && responseObj.status ) {
                        //This looks like an error, too
                        returnedError = true;
                        title = undefined;
                        message = $_('error_string', responseObj.code + ": " + responseObj.status);
                        status = responseObj.status;
                    }

                    if (!returnedError) {

                        //Looks like a valid response with good data
                        if ( params.callbackObj && params.callbackObj.onSuccess && params.callbackObj.onSuccess.call) {
                            Logger.debug( 'calling XHR callback' );
                            params.callbackObj.onSuccess(responseObj);
                        }
                    }
                    
                }
                else if ( reqObj.status === 0 ) {
                    Logger.error( $_('xhr_error', + reqObj.status));
                    returnedError = true;
                }
                else {
                    returnedError = true;
                    
                    if (responseObj) {
                        title = responseObj.header || '';
                        status = responseObj.code || reqObj.status;
                        message = $_('plex_error');
                        message += responseObj.message || responseObj.status || '';
                        message = $_('error_code') + status + " : " + message;
                    }
                    else {
                        status = reqObj.status;
                        message = null;
                    }
                }

                if (returnedError) {
                    
                    if ( params.callbackObj && params.callbackObj.onError && params.callbackObj.onError.call) {
                        params.callbackObj.onError(title + " " + message, status);
                    }

                }
            }
            
        };

        reqObj = new XMLHttpRequest();

        reqObj.onreadystatechange = handleResponse.bindTo(this);
        reqObj.open( 'GET', params.url, true);
        reqObj.setRequestHeader( 'Accept', 'application/json' );
        reqObj.setRequestHeader( 'X-Plex-Client-Identifier', Config.get( 'sessionID' ) );
        Logger.debug( 'Sending Request' );
        reqObj.send();

        timer = KONtx.utility.timer.setTimeout( handleTimeout.bindTo(this), params.timeout);

    }


};