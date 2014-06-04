var Config = {
    initialize: function() {
        Logger.debug( 'Initializing Config' );
        this._loadStoredConfig();

        Logger.debug( JSON.stringify(this._config) );


        //Also remove potentially old options.
        if (this.get('configVersion') <= 1 ) {
            if ( this.get( 'transcoder' ) === this.TRANSCODEAUTO || this.get( 'transcoder' ) === this.TRANSCODEFORCE ) {
                Config.set( 'transcoder', this.TRANSCODEDIRECT);
            }
        }

        if (this.get('configVersion') <= 2 ) {
            if ( this.get( 'transcoder' ) === this.TRANSCODEHLS ) {
                Config.set( 'transcoder', this.TRANSCODEDIRECT);
            }
            delete this._config.cacheData;
        }

        this.set('configVersion', this.configVersion);

        //Setup defaults
        if ( ! Config.get( 'transcoder' )  ) {
            Logger.warn( 'Transcoder not set. Setting to default.' );
            Config.set( 'transcoder', this.TRANSCODEDIRECT);
        }

        if ( ! this.get( 'sessionID' ) ) {
            Logger.info( 'Generating initial Session ID' );
            this.set( 'sessionID', this.generateUniqueID());
            Logger.info( 'Generated UniqueID: ' + Config.get( 'sessionID' ));
        }

        if ( ! this.get( 'serverPort' ) ) {
            Logger.warn( 'PMS Server Port not set. Setting to default.' );
            this.set( 'serverPort', this.DEFAULTPORT);
        }

        if ( ! this.get( 'videoResolution' ) ) {
            Logger.warn( 'Video Resolution not set. Setting to default.' );
            this.set( 'videoResolution', this.DEFAULTVIDEORESOLUTIONINDEX);
        }

        if ( ! this.get( 'videoQuality' ) ) {
            Logger.warn( 'Video Quality not set. Setting to default: ' + Config.DEFAULTVIDEOQUALITY);
            this.set( 'videoQuality', this.DEFAULTVIDEOQUALITY);
        }

        if ( this._config.activerwff !== undefined ) {
            this.set('activerwff', 0);
        }

        if ( ! this._config.rwffSpeed ) {
            this.set('rwffSpeed', Config.DEFAULTRWFFSPEED);
        }

        if ( ! this._config.instantReplay ) {
            this.set('instantReplay', Config.DEFAULTINSTANTREPLAY);
        }

        if ( this._config.animate === undefined ) {
            this.set('animate', true);
        }

        if ( ! this._config.localQuality ) {
            Logger.debug( 'localQuality not set. Setting to default.');
            this.set('localQuality', this.QUALITYAUTO);
        }

        if ( ! this.get( 'localResolution' ) ) {
            Logger.warn( 'Local Resolution not set. Setting to default.' );
            this.set( 'localResolution', this.DEFAULTVIDEORESOLUTIONINDEX);
        }

        if ( ! this._config.remoteQuality ) {
            Logger.debug( 'remoteQuality not set. Setting to default.');
            this.set('remoteQuality', this.QUALITYAUTO);

        }

        if ( ! this.get( 'remoteResolution' ) ) {
            Logger.warn( 'Remote Resolution not set. Setting to default.' );
            this.set( 'remoteResolution', this.DEFAULTREMOTERESOLUTIONINDEX);
        }

    },
    
    _config: {},
    
    appMajorVersion: '1',
    appMinorVersion: '0',
    appBuildVersion: '11',
    configVersion: 2,
        
    SUPPORTEMAIL: 'support@crashplayer.com',
    TERMSLINK: 'http://crashplayer.com/termsofservice',
    
    XMLRESPONSESIZELIMITKB: 500,
    
    TRANSCODEAUTO: 'AUTO',
    TRANSCODEFORCE: 'TRANSCODING',
    TRANSCODEDIRECT: 'DIRECT',
    TRANSCODEHLS: 'TRANSCODEHLS',    

    AVAILABLERESOLUTIONS: [
        { value : '0', label : '320p',  width : '480',  height : '320'  },
        { value : '1', label : '480p',  width : '854',  height : '480'  },
        { value : '2', label : '720p',  width : '1280', height : '720'  },
        { value : '3', label : '1080p', width : '1920', height : '1080' }
    ],
    
    SUPPORTEDCONTAINERS:  [ 'mp4', 'wmv', 'rm', 'asf', 'mkv', 'avi' ],
    SUPPORTEDVIDEOCODECS: [ 'h264', 'vc1', 'rv40', 'mpeg4', 'mpeg2video'  ],
    SUPPORTEDAUDIOCODECS: [ 'aac', 'ac3', 'wma', 'wmapro', 'cook', 'mp3', 'dca'  ],
    SUPPORTEDPASSTHROUGHAUDIOCODECS: [ 'dca' ],
    
//TODO: See if comp mode can support mpeg4, mpeg2vidio, and mp3
    COMPMODECONTAINERS: [ 'mp4', 'wmv', 'rm', 'asf' ],
    COMPMODEVIDEOCODECS: [ 'h264', 'vc1', 'rv40' ],
    COMPMODEAUDIOCODECS: [ 'aac', 'ac3', 'wma', 'wmapro', 'cook' ],
    COMPMODEPASSTHROUGHAUDIOCODECS: [ 'dca' ],

    DEFAULTVIDEORESOLUTIONINDEX: 2,
    DEFAULTVIDEOQUALITY: 8,

    DEFAULTREMOTERESOLUTIONINDEX: 2,
    
    PINGTIMEOUT: 5000,
    SERVERCONNECTTIMEOUT: 20000,
    CHANNELCONNECTTIMEOUT: 40000,
    
    VIDEOMEDIATYPES: [ 'movie', 'episode', 'clip' ],
    SHOWMEDIATYPES: [ 'show', 'channel' ],
    CHANNELVIDEOTYPES: [ 'clip' ],
    SEASONMEDIATYPES: [ 'season' ],
    SECONDARYGROUPTYPES: [ 'secondary' ],
    
    DEFAULTIP: '192.168.1.xxx',
    DEFAULTPORT: 32400,
    DEFAULTRWFFSPEED: '2',
    DEFAULTINSTANTREPLAY: '6',
    
    THUMBWIDTH: 130,
    THUMBHEIGHT: 200,
    THUMBFORMAT: 'jpeg',
    PHOTOBGCOLOR: '363636',
    SECTIONTHUMBWIDTH: 80,
    SECTIONTHUMBHEIGHT: 80,
    SECTIONTHUMBFORMAT: 'png',
    EPISODETHUMBWIDTH: 130,
    EPISODETHUMBHEIGHT: 113,
    SHOWBANNERWIDTH: 379,
    SHOWBANNERHEIGHT: 79,
    BANNERTHUMBFORMAT: 'jpg',
    
    IMAGESROOT: 'Assets/960x540/',
    
    VIDEOMAXWIDTH: '1080',
    VIDEOMAXHEIGHT: '1920',
    
    LOGSERVERPATH: null,
    
    QUALITYAUTO: 'auto',
    QUALITYMANUAL: 'manual',
    
    LIBRARYSEASONSCOLUMNS: 6,
    LIBRARYSECTIONCOLUMNS: 6,
    LIBRARYSECONDARYCOLUMNS: 8,
    LIBRARYEPISODECOLUMNS: 6,
    LIBRARYSHOWCOLUMNS: 6,
    LIBRARYMEDIACOLUMNS: 6,
    LIBRARYICON: 'Assets/960x540/plex_icon_small.png',


    LIBRARYPAGESCACHED: 3,
    
    CLIENTCAPABILITIES: 'protocols=http-mp4-streaming,http-mp4-video,http-mp4-video-720p,http-streaming-video,http-streaming-video-720p;videoDecoders=mpeg4,h264{profile:high&resolution:1080&level:50};audioDecoders=aac,ac3{bitrate:128000}',

    SERVERPINGINTERVALTIER1: 60 * 1000,
    
    //Set config STATICs
    PLEX_PROTOCOL: 'http://',
    PLEX_TRANSCODEIP: '127.0.0.1',
    PLEX_LIBRARY: '/library',
    PLEX_CHANNELS: '/channels',
    PLEX_SECTIONS: '/library/sections',
    PLEX_SECTIONSKEY: 'sections',
    PLEX_ONDECK: '/library/onDeck',
    PLEX_RECENTLYADDED: '/library/recentlyAdded',
    PLEX_LOGGER: '/log?source=CRASHPlayer',
    PLEX_TIMELINEUPDATE: '/:/timeline?',
    PLEX_PHOTOTRANSCODE: '/photo/:/transcode?',
    PLEX_STARTINDEX: 'X-Plex-Container-Start=',
    PLEX_PAGESIZE: 'X-Plex-Container-Size=',
    PLEX_UNSCROBBLE: '/:/unscrobble?identifier=com.plexapp.plugins.library',
    PLEX_SCROBBLE: '/:/scrobble?identifier=com.plexapp.plugins.library',
    
    PLEX_GENERICVIDEOTRANSCODEURL: '/video/:/transcode/generic.mp4?',
    PLEX_GENERICTRANSCODEVIDEOFORMAT: '&format=mp4&videoCodec=libx264',
    PLEX_GENERICTRANSCODEVIDEOBITRATE: '&videoBitrate=3000',
    PLEX_GENERICTRANSCODEAUDIOFORMAT: '&audioCodec=ac3',
    PLEX_GENERICTRANSCODEAUDIOBITRATE: '&audioBitrate=128',
    
    PLEX_MEDIACHILDRENSUFFIX: '/children',
    
    PLEX_UNIVERSALVIDEOTRANSCODEURL: '/video/:/transcode/universal/start.m3u8?',

    STATE_INIT: 0,
    STATE_NOTREADY: -1,
    STATE_READY: 1,
    STATE_ERR: -255,
    STATE_TIMEOUT: -254,
    
    WITHOFFSET: true,
    WITHOUTOFFSET: false,
    
    STREAMTYPEVIDEO: 1,
    STREAMTYPEAUDIO: 2,
    STEAMTTYPESUBTITLE: 3,
    
    DEFAULTTIMETEXT: '00:00:00',

    
    generateUniqueID: function() {
        
        var id = Math.random().toString(36).slice(2);
        Logger.debug( 'Unique ID generated: ' + id);
        return id;
    },

    //Verify that we have the config we need to get going
    ready: function() {
//        if (this._config.serverIP && this._config.yahooID) {
        if (this._config.serverIP) {
            return true;
        }
        
        return false;
    },
    
    reset: function() {
        Logger.warn('Resetting all configuration options to default values.');

        this._config = {};
        this._saveStoredConfig();
        this.initialize();
    },
    
    _loadStoredConfig: function() {
        Logger.debug( 'Loading stored config' );
        
        var tmpConfig = currentAppConfig.get( 'CRASHPlayerStoredConfig' );
        if (tmpConfig) {
            this._config = JSON.parse(tmpConfig);
        }
    },

    _saveStoredConfig: function() {
       Logger.debug( 'Saving stored config' );
       
       currentAppConfig.set( 'CRASHPlayerStoredConfig', JSON.stringify(this._config) );
    },
    
    set: function(key, value) {
        this._config[key] = value;
        this._saveStoredConfig();
    },
    
    get: function(key) {
        return this._config[key];
    }

    
};

Config.initialize();