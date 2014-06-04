var SidebarView = new KONtx.Class({
    ClassName: 'SidebarView',
    
    Extends: KONtx.system.SidebarView,

    initView: function() {
        Logger.debug('Init sidebar View');
        
    },
    
    _base: 'sidebar.',
    _staleData: false,

    
    createView: function() {
        var ctrls, sidebarWidth, sidebarHeight, emptySpace;

        ctrls = this.controls;
        sidebarWidth = Theme.keys.sidebar.width;
        sidebarHeight = Theme.keys.sidebar.height;

        ctrls.onDeckGrid = new KONtx.control.Grid({
            focus: false,
            columns: 1,
            rows: 1,
            carousel: true,
            cellCreator: this._cellCreator,
            cellUpdater: this._cellUpdater,
            styles: {
                backgroundColor: '#111111',
                vOffset: 0,
                width: this.width,
                height: 265,
                opacity: 1
            },
            manageWaitIndicator: true
        }).appendTo(this);
        
        
        ctrls.pageIndicator =  new KONtx.control.PageIndicator({
            focus: true,
//TODO: Why doesn't this work right? 
//                 threshold: 7,
            styles: {
                hAlign: 'center',
                vOffset: 265,
                backgroundColor: '#111111',
                opacity: 1
            },
            events: {
                onSelect: this._onSelectOnDeck
            },
            updateText: function(curpage, pageCount, state) {
                return (parseInt(curpage, 10) + 1) + ' OF ' + parseInt(pageCount, 10);
            }
        }).appendTo(this);

        ctrls.onDeckGrid.attachAccessory(ctrls.pageIndicator);


        emptySpace = new KONtx.control.EmptySpace({
            styles: {
                height: sidebarHeight - ctrls.pageIndicator.outerHeight,
                vOffset: ctrls.pageIndicator.outerHeight
            }
        }).appendTo(this);

        ctrls.buttonBackground = new KONtx.element.Container({
            guid: this._base + 'ctrls.background',
            id: this._base + 'ctrls.background',
            styles: {  
                width: sidebarWidth * 0.8,
                height: KONtx.utility.scale(35),
                vOffset: 300,
                hAlign: 'center',
                backgroundColor: '#111111',
                opacity: 1
            }
        }).appendTo(this);

        ctrls.loadSettingsButton = new KONtx.control.TextButton({
            label: $_('settings_button'),
            guid: this._base + 'loadSettings',
            focus: true,
            events: {
                onSelect: function() {
                    KONtx.application.loadView( 'view-Settings', {} );
                }
            },
            styles: {
                width: sidebarWidth * 0.8,
                height: KONtx.utility.scale(35),
                vOffset: 0,
                fontSize: 13,
                fontFamily:'Helvetica',
                fontWeight: 'Bold',
                opacity: 1,
                color: 'white',
                truncation: 'end',
                hAlign: 'center'
            },
            textStyles: {
                hAlign: 'center',
                vAlign: 'center'
            }
        }).appendTo(ctrls.buttonBackground);

        ctrls.loadFullScreenButton = new KONtx.control.TextButton({
            label: $_('load_button', $_('app_title') ),
            guid: this._base + 'loadFullScreenButton',
            visible: false,
            focus: true,
            events: {
                onSelect: function() {
                    KONtx.application.loadView( 'view-Library', {} );
                }
            },
            styles: {
                width: sidebarWidth * 0.8,
                height: KONtx.utility.scale(35),
                vOffset: 0,
                fontSize: 13,
                fontFamily:'Helvetica',
                fontWeight: 'Bold',
                opacity: 1,
                color: 'white',
                truncation: 'end',
                hAlign: 'center'
            },
            textStyles: {
                hAlign: 'center',
                vAlign: 'center'
            }
        }).appendTo(ctrls.buttonBackground);
        
/*        ctrls.reloadBackground = new KONtx.element.Container({
            guid: this._base + 'ctrls.background',
            id: this._base + 'ctrls.background',
            styles: {  
                width: sidebarWidth * 0.5,
                height: KONtx.utility.scale(35),
                vOffset: 350,
                hAlign: 'center',
                backgroundColor: '#111111',
                opacity: 1
            }
        }).appendTo(this);
*/
        ctrls.reloadButton = new KONtx.control.TextButton({
            label: $_('refresh_button'),
            guid: this._base + 'refreshButton',
            visible: false,
            focus: true,
            events: {
                onSelect: (this.updateView).bindTo(this)
            },
            styles: {
                width: sidebarWidth * 0.5,
                height: KONtx.utility.scale(35),
                vOffset: 350,
                fontSize: 13,
                fontFamily:'Helvetica',
                fontWeight: 'Bold',
                backgroundColor: '#111111',
                opacity: 1,
                color: 'white',
                truncation: 'end',
                hAlign: 'center'
            },
            textStyles: {
                hAlign: 'center',
                vAlign: 'center'
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

    _cellCreator: function() {
        var cell;
        
        cell = new KONtx.control.GridCell({
            styles: {
                height: KONtx.utility.scale(35),
                width: this.width,
                backgroundColor: '#111111',
                opacity: 1
            }
        });

        cell.textDurationLabel = new KONtx.element.Text({
            label: $_('duration_label'),
            styles: {
                hOffset: 170,
                vOffset: 30,
                fontSize: 13,
                fontFamily:'Helvetica',
                fontWeight: 'Bold',
                opacity: 1,
                color: 'white'
            }
        }).appendTo(cell);
        cell.textDuration = new KONtx.element.Text({
            styles: {
                hOffset: 170,
                vOffset: cell.textDurationLabel.outerHeight,
                fontSize: 13,
                fontFamily:'Helvetica',
                fontWeight: 'Bold',
                opacity: 1,
                color: 'white'
            }
        }).appendTo(cell);

        cell.textProgressLabel = new KONtx.element.Text({
            label: $_('progress_label'),
            styles: {
                hOffset: 170,
                vOffset: 70,
                fontSize: 13,
                fontFamily:'Helvetica',
                fontWeight: 'Bold',
                opacity: 1,
                color: 'white'
            }
        }).appendTo(cell);
        
        cell.textProgress = new KONtx.element.Text({
            styles: {
                hOffset: 170,
                vOffset: cell.textProgressLabel.outerHeight,
                fontSize: 13,
                fontFamily:'Helvetica',
                fontWeight: 'Bold',
                opacity: 1,
                color: 'white'
            }
        }).appendTo(cell);

        cell.mediaThumb = new KONtx.element.Image({
            loadingSrc: 'Assets/960x540/ThumbLoading.png',
            missingSrc: 'Assets/960x540/ThumbMissing.png',
            styles: {
                width:   Config.THUMBWIDTH,
                hOffset: 10,
                vOffset: 10,
            }
        }).appendTo(cell);

        cell.progressBack = new KONtx.element.Container({
            guid: this._base + 'ctrls.progressBack',
            id: this._base + 'ctrls.progressBack',
            styles: {  
                width: Config.THUMBWIDTH,
                height: 9,
                vOffset: Config.THUMBHEIGHT - 9 + 10,
                hOffset: 10,
                backgroundColor: '#111111',
                opacity: 0.8,
                visible: false
            }
        }).appendTo(cell);

        cell.progressBar = new KONtx.element.Image({
            styles: {
                width: Config.THUMBWIDTH,
                vOffset: Config.THUMBHEIGHT - 7 + 10,
                height: 5,
                hOffset: 10,
                src: 'Assets/960x540/Progress.png',
                visible: false,
                fillMode: 'tile'
            }
        }).appendTo(cell);

        cell.seasonEpisodeBack = new KONtx.element.Container({
            guid: this._base + 'ctrls.seasonEpisodeBack',
            id: this._base + 'ctrls.seasonEpisodeBack',
            styles: {
                width: this.width,
                height: 30,
                vOffset: Config.THUMBHEIGHT - 9 - 30 + 10,
                hOffset: 0,
                backgroundColor: '#111111',
                opacity: 0.4,
                visible: false
            }
        }).appendTo(cell);

        cell.seasonEpisode = new KONtx.element.Text({
            styles: {
                vOffset: Config.THUMBHEIGHT - 9 - 30 + 10,
                hOffset: 10,
                padding: 4,
                height: 30,
                fontSize: 16,
                fontFamily:'Helvetica',
                fontWeight: 'Bold',
                opacity: 0.9,
                color: 'white',
                width: Config.THUMBWIDTH,
                visible: false,
                textAlign: 'left'
            }
        }).appendTo(cell);

        cell.textLabel = new KONtx.element.Text({
            truncation: 'end',
            styles: {
                vOffset: Config.THUMBHEIGHT + 10,
                padding: 4,
                fontSize: 13,
                fontFamily:'Helvetica',
                fontWeight: 'Bold',
                opacity: 1,
                color: 'white',
                hAlign: 'center',
                width: cell.width,
                textAlign: 'center'
            }
        }).appendTo(cell);

        return cell;
    },

    _cellUpdater: function(cell, dataitem) {
        //Wrapping in a timer with a 1 ms delay. This forces this to drop to the back of javascript
        //  thread/process queue so that GC jobs get a chance to run in the middle of some more
        //  processor intensive operations to avoid overrunning memory and crashing the app. 
        KONtx.utility.timer.setTimeout( (function(){
            Logger.debug( 'Creating OnDeck cell content for ' + dataitem.label);
            
            var ctrls, seasonEpisode;
            
            ctrls = this.getView().controls;
            
            cell.textLabel.data = dataitem.label;
            cell.mediaThumb.src = PlexService.generateImageURL(dataitem.mediaThumb, Config.THUMBWIDTH, Config.THUMBHEIGHT);
            cell.textDuration.data = dataitem.mediaDuration;
            cell.textProgress.data = dataitem.mediaProgress;
            
            if (dataitem.mediaInfo.viewOffset) {
                cell.progressBar.setStyle('width', (dataitem.mediaInfo.viewOffset / dataitem.mediaInfo.duration) * Config.THUMBWIDTH);
                cell.progressBar.show();
                cell.progressBack.show();
            }
            else {
                cell.progressBar.hide();
                cell.progressBack.hide();
            }
            
            if (dataitem.mediaInfo.index) {
                seasonEpisode = $_('episode_letter') + dataitem.mediaInfo.index;
                if (dataitem.mediaInfo.parentIndex) {
                    seasonEpisode = $_('season_letter') + dataitem.mediaInfo.parentIndex + seasonEpisode;
                }
                cell.seasonEpisode.setText(seasonEpisode);
                cell.seasonEpisode.show();
                cell.seasonEpisodeBack.show();
            }
            else {
                cell.seasonEpisode.hide();
                cell.seasonEpisodeBack.hide();
            }
    
            //If we do this here, it happens after the first cell loads.
            ctrls.pageIndicator.setDisabled(false);
            ctrls.reloadButton.hide();
        }).bindTo(this), 1);
        
        //Do this outside of the timer so it happens a little more timely
        KONtx.utility.LoadingOverlay.off();
    },



    focusView: function() {
        Logger.debug('Setting Focus');
        var ctrls, timer1;
        
        ctrls = this.controls;
        timer1 = KONtx.utility.timer.setTimeout( (function(){
            KONtx.utility.timer.clearTimeout(timer1);

            if ( ctrls.reloadButton.visible && ctrls.loadSettingsButton.visible ) {
                ctrls.loadSettingsButton.focus();
            }
            else if ( ctrls.reloadButton.visible ) {
                ctrls.reloadButton.focus();
            }
            else {
                ctrls.loadFullScreenButton.focus();
            }
        }).bindTo(this), 1);
    },


    _resetView: function() {
        this.controls.pageIndicator.setDisabled(true);
        this.controls.loadFullScreenButton.show();
        this.controls.loadSettingsButton.hide();
        this.controls.networkError.hide();
        this.controls.reloadButton.hide();
    },

    _resetViewNoPlexService: function() {
        this.controls.loadFullScreenButton.hide();
        this.controls.loadSettingsButton.show();
        this.controls.reloadButton.show();
        this.controls.pageIndicator.setDisabled(true);
    },
    
    updateView: function() {
        Logger.debug( 'Loading Sidebar' );
        
        this._resetView();

        this._registerHandlers();
        PlexService.abortRequest();

        if ( PlexService.state === Config.STATE_READY ) {
            this._loadOnDeck();
        }
        else {
            Logger.warn( $_('plexservice_unavail') );
            
            KONtx.utility.LoadingOverlay.on();
            
            this.controls.networkError.show();
            this._resetViewNoPlexService();

            this._staleData = true;
            PlexService.resetPing();
//            KONtx.utility.LoadingOverlay.off();

            
        }

    },


    _loadOnDeck: function () {
        Logger.debug( 'loadOnDeck' );

        KONtx.utility.LoadingOverlay.on();
        
        PlexService.getMediaMetadata({
            mediaKey: Config.PLEX_ONDECK,
            callback: (this._updateOnDeckGrid).bindTo(this),
            errorCallback: (this._onDeckError).bindTo(this)
        });
    },

    _onDeckError: function(message, status) {
        this._resetViewNoPlexService();
        this.focusView();
    },


    hideView: function() {
        this._unregisterHandlers();
    },
    
    unselectView: function() {
        this._unregisterHandlers();
    },
    
    destroyView: function() {
        this._unregisterHandlers();
    },
    
    selectView: function() {
        this._registerHandlers();
    },


    _updateOnDeckGrid: function(onDeck) {
        Logger.debug( 'Updating OnDeck' );
        var arr, i, mediaTitle, ctrls, mediaChild;

        this._resetView();
        
        ctrls = this.controls;
        arr = [];
        if (onDeck) {
            for ( i = 0; i < (onDeck._children.length); i++ ) {
                mediaChild = onDeck._children[i];
                if ( mediaChild.grandparentTitle ) {
                    mediaTitle = mediaChild.grandparentTitle + ': ' + mediaChild.title;
                }
                else {
                    mediaTitle = mediaChild.title;
                }
//TODO: Should get the thumb transcoded URL here and pass it to the grid that way, like in library and shows.
                arr.push({
                    label: mediaTitle,
                    mediaThumb: mediaChild.thumb,
//                    mediaKey: mediaChild.key,
                    mediaDuration: Utility.millisecondsToTime( mediaChild.duration ),
                    mediaProgress: Utility.millisecondsToTime( mediaChild.viewOffset ),
                    mediaInfo: mediaChild
                });
            }
        }

        ctrls.onDeckGrid.changeDataset(arr, true);

        this.focusView();

        ctrls.pageIndicator.setDisabled(false);

        KONtx.utility.LoadingOverlay.off();
    },
    

    _onSelectOnDeck: function(event) {
        Logger.debug( 'Selected onDeck Item' );
        var dg, dataItem;
        
        KONtx.utility.LoadingOverlay.on();

        dg = this.getView().controls.onDeckGrid;

        dataItem = dg.getDataItem( dg.getCurrentPage() );

        if(dataItem) {
            PlexService.getMediaMetadata({
                mediaKey: dataItem.mediaInfo.key,
                callback: (Utility.prePlayMovie).bindTo(Utility),
                checkFiles: true,
                makeCurrentMedia: true
            });
        }

    },
    

    _registerHandlers: function() {
        if( this._boundApplicationHandler ) {
                this._unregisterHandlers();
        }
        this._boundApplicationHandler = this._applicationDispatcher.subscribeTo(KONtx.application, [ 'onWidgetKeyPress' ], this);

        PlexService.resetStateChangeListener();
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
                    this.controls.networkError.hide();
                    if (this._staleData) {
                        this._staleData = false;
                        this._loadOnDeck();
                    }
                    else {
                        this._resetView();
                        this.controls.pageIndicator.setDisabled(false);
//                        ctrls.reloadButton.show();
                        this.focusView();
                    }

                    break;

                case Config.STATE_ERR:

                case Config.STATE_TIMEOUT:

                default:
                    if (this._staleData) {
                        this._staleData = false;
                        Utility.requestFailDialog(Utility.serverErrorRefetch).show();
                        this.focusView();
                    }
                    else {
                        this._staleData = true;
                        ctrls.networkError.show();
                        this._resetViewNoPlexService();
                        this.focusView();
                    }
                    break;
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
        }
    }
});
