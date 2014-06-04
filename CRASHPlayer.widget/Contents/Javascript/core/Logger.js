var Logger = {
    init: function() {

        //Default logging configuration
        this._logLevel = this.NONE;

        this.logLocal = false;
//        this.logToServer = this.LOGTOMEDIASERVER;
        this.logToServer = this.NOLOGTOSERVER;
//        this.logToServer = this.LOGTOSERVER;

        //Enable this to see the debug messages from the media player
        this.logMediaplayerInternals = false;

    },

    
    NOLOGTOSERVER: 0,
    LOGTOSERVER: 1,
    LOGTOMEDIASERVER: 2,

    logToServer: 0,
    logLocal: true,
    
    DEBUG: 5,
    INFO: 4,
    WARN: 3,
    ERROR: 2,
    FATAL: 1,
    NONE: 0,
    
    _logLevels: [
        'NONE',
        'FATAL',
        'ERROR',
        'WARN',
        'INFO',
        'DEBUG'
    ],
    
    _logLevel: 0,

    setLogLevel: function(level) {
        this._logLevel = level;
        this.log(this.INFO, 'Logging Level set to:' + this._logLevels[level] , true);
    },
    
    enableLocalLogging: function() {
        this.logToLocal = true;
        this.log(this.INFO, 'Local Logging ENABLED', true);
    },
    
    disableLocalLogging: function() {
        this.logToLocal = false;
        this.log(this.INFO, 'Local Logging ENABLED', true);
    },
    
    enableMediaServerLogging: function() {
        this.logToServer = this.LOGTOMEDIASERVER;
        this.log(this.INFO, 'Media Server Logging Enabled', true);
    },
    
    disableServerLogging: function() {
        this.logToServer = this.NOLOGTOSERVER;
        this.log(this.INFO, 'Server Logging Disabled', true);
    },

    disabledMediaServerLogging: function() {
        this.disableServerLogging();
    },    
    
    enableServerLogging: function() {    
        this.logToServer = this.LOGTOSERVER;
        this.log(this.INFO, 'Server Logging Enabled', true);
    },
    
    log: function(level, message, force, uniqueID) {


        if ( force || level <= this._logLevel ) {

            if ( this.logToServer === this.LOGTOSERVER || force === this.LOGTOSERVER ) {
                this.sendLogToServer(level, message, uniqueID);
            }
            else if ( this.logToServer === this.LOGTOMEDIASERVER || force === this.LOGTOMEDIASERVER ) {
                PlexService.log( level, message);
            }
            
            if ( this.logLocal ) {
                log( '[' + this._logLevels[level] + '] ' + message);
            }
            
            return true;
        }

        return false;
    },

    //Shortcuts
    debug: function(message, force, uniqueID) {
        this.log(this.DEBUG, message, force, uniqueID);
    },

    info: function(message, force , uniqueID) {
        this.log(this.INFO, message, force, uniqueID);
    },
    
    warn: function(message, force, uniqueID) {
        this.log(this.WARN, message, force, uniqueID);
    },
    
    error: function(message, force, uniqueID) {
        this.log(this.ERROR, message, force, uniqueID);
    },
    
    fatal: function(message, force, uniqueID) {
        this.log(this.FATAL, message, force, uniqueID);
    },

    sendLogToServer: function(logLevel, message, uniqueID) {
        var url, id, request;

        id = uniqueID || 'crashplayer';
        
        //Strip cr/lf
        message = message.replace(/(\r\n|\n|\r)/gm," ");
        
        url  = 'http://crashplayer.com/logging/index.php?';
        url += 'id=' + id + '&logLevel=' + logLevel;
        url += '&message=' + encodeURIComponent(message);

        if ( ! KONtx.application.isPhysicalNetworkDown() ) {

            request = new URL();
            //request.callback = callback;
            request.location = url;
            request.fetchAsync(function (event) {
                KONtx.utility.WaitIndicator.down();
                if (event.response == 200){
            //        event.callback(event.result);
                    log( 'Successfully logged to server.' );
                } else {
                    log( 'Failed to log to server.' );
                }
            });
        }
        else {
            log( 'Failed to log to server. Network Unavailable.' );
        }
    }
};

Logger.init();