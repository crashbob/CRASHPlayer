var ShowView = new KONtx.Class({
    ClassName: 'ShowView',
    
    Extends: KONtx.system.FullscreenView,
    
    initView: function() {

        this.controls._seasonsGridPager = new KONtx.utility.Pager(Config.LIBRARYSEASONSCOLUMNS, Config.LIBRARYSEASONSCOLUMNS*2, this._fetchSeasonsPage, this, Config.LIBRARYPAGESCACHED);
        this.controls._seasonsGridPager.buildArray = (this._buildSeasonsArray).bindTo(this);
        this.controls._mediaGridPager = new KONtx.utility.Pager(Config.LIBRARYEPISODECOLUMNS, Config.LIBRARYEPISODECOLUMNS*2, this._fetchMediaPage, this, Config.LIBRARYPAGESCACHED);
        this.controls._mediaGridPager.buildArray = (Utility.buildMediaArray).bindTo(this);

    },

    _base: 'show.',
    _focusedGrid: undefined,
    
    //This is hack to work around a framework limitation that causes views
    //to not be refreshed correctly if the exit button on the remote is used to exit
    //to the dock. 
    _stale: false,

    createView: function() {
        var ctrls;
        
        ctrls = this.controls;
        
        ctrls.background = new KONtx.element.Container({
            guid: this._base + 'ctrls.background',
            id: this._base + 'ctrls.background',
            styles: {  
                width: this.width,
                height: this.height,
                vOffset: 0,
                hOffset: 0,
                backgroundColor: '#111111',
                opacity: 1
            }
        }).appendTo(this);

        ctrls.backdropImage = new KONtx.element.Image({
            guid: this._base + 'ctrls.backdropImage',
            id: this._base + 'ctrls.backdropImage',
//            loadingSrc: 'Assets/960x540/SectionLoading.png',
            missingSrc: 'Assets/960x540/empty.png',
            styles: {
//                width:  ctrls.background.width,
//                height: ctrls.background.height,
                vAlign: 'center',
                hAlign: 'center',
                opacity: 0.3
            }
        }).appendTo(ctrls.background);

        ctrls.backButton = new KONtx.control.TextButton({
            guid: this._base + 'ctrls.backButton',
            id: this._base + 'ctrls.backButton',
            label: $_('back_button_label'),
            events: {
                onSelect: function() { KONtx.application.previousView(); }
            },
            styles: {
                width: KONtx.utility.scale(55),
                height: KONtx.utility.scale(55),
                vOffset: 20,
                hOffset: 20,
                fontSize: 16,
                fontFamily:'Helvetica',
                fontWeight: 'Bold',
                opacity: 0.8,
                color: 'white',
                backgroundColor: 'black',
                truncation: 'end'
            },
            textStyles: {
                hAlign: 'center',
                vAlign: 'center'
            }
        }).appendTo(ctrls.background);
        
        
        ctrls.showBanner = new KONtx.element.Image({
            guid: this._base + 'ctrls.showBanner',
//            loadingSrc: 'Assets/960x540/SectionLoading.png',
            missingSrc: 'Assets/960x540/empty.png',
            styles: {
                height: Config.SHOWBANNERHEIGHT,
                hAlign: 'center',
                vOffset: 10
            }
        }).appendTo(ctrls.background);
        
        ctrls.seasonsGrid = new KONtx.control.Grid({
            guid: this._base + 'ctrls.seasonsGrid',
            animate: Config.get('animate'),
            focus: true,
            columns: Config.LIBRARYSHOWCOLUMNS,
            rows: 1,
            carousel: true,
            cellCreator: (this._seasonsCellCreator).bindTo(this),
            cellUpdater: this._seasonsCellUpdater,
            pager: this.controls._seasonsGridPager,
            styles: {
                vOffset: ctrls.showBanner.outerHeight + 10,
                width: this.width,
                height: KONtx.utility.scale(270)
            }
        }).appendTo(ctrls.background);
        
        
        ctrls.seasonsLeft = new KONtx.element.Image({
            guid: this._base + 'ctrls.seasonLeft',
            id: this._base + 'ctrls.seasonsLeft',
            styles: {
                src: 'Assets/960x540/arrowLeft.png',
                hOffset: 5,
                vOffset: 225
            }
        }).appendTo(ctrls.background);

        ctrls.seasonsRight = new KONtx.element.Image({
            guid: this._base + 'ctrls.seasonsRight',
            id: this._base + 'ctrls.seasonsRight',
            styles: {
                src: 'Assets/960x540/arrowRight.png',
                hOffset: this.width - 25 - 5,
                vOffset: 225
            }
        }).appendTo(ctrls.background);

        ctrls.seasonsPages = new KONtx.element.Text({
            guid: this._base + 'ctrls.seasonsPages',
            id: this._base + 'ctrls.seasonsPages',
            styles: {
                vOffset: KONtx.utility.scale(345),
                padding: 4,
                fontSize: 13,
                fontFamily:'Helvetica',
                fontWeight: 'Bold',
                opacity: 0.8,
                backgroundColor: '#111111',
                color: 'white',
                hAlign: 'center',
                width: KONtx.utility.scale(60),
                textAlign: 'center'
            }
        }).appendTo(ctrls.background);

        ctrls.mediaGrid = new KONtx.control.Grid({
            ClassName: 'mediaGrid',
            guid: this._base + 'ctrls.mediaGrid',
            animate: Config.get('animate'),
            focus: true,
            columns: Config.LIBRARYEPISODECOLUMNS,
            rows: 1,
            carousel: true,
            cellCreator: (this._episodeCellCreator).bindTo(this),
            cellUpdater: this._mediaCellUpdater,
            pager: this.controls._mediaGridPager,
            styles: {
                vOffset: ctrls.seasonsGrid.outerHeight,
                width: this.width,
                height: KONtx.utility.scale(170)
            }
        }).appendTo(ctrls.background);
        
        
        ctrls.episodesLeft = new KONtx.element.Image({
            guid: this._base + 'ctrls.episodesLeft',
            id: this._base + 'ctrls.episodesLeft',
            styles: {
                src: 'Assets/960x540/arrowLeft.png',
                hOffset: 5,
                vOffset: 425
            }
        }).appendTo(ctrls.background);

        ctrls.episodesRight = new KONtx.element.Image({
            guid: this._base + 'ctrls.episodesRight',
            id: this._base + 'ctrls.episodesRight',
            styles: {
                src: 'Assets/960x540/arrowRight.png',
                hOffset: this.width - 25 - 5,
                vOffset: 425
            }
        }).appendTo(ctrls.background);

        ctrls.mediaPages = new KONtx.element.Text({
            guid: this._base + 'ctrls.mediaPages',
            id: this._base + 'ctrls.mediaPages',
            styles: {
                vOffset: KONtx.utility.scale(515),
                padding: 4,
                fontSize: 13,
                fontFamily:'Helvetica',
                fontWeight: 'Bold',
                opacity: 0.8,
                backgroundColor: '#111111',
                color: 'white',
                hAlign: 'center',
                width: KONtx.utility.scale(60),
                textAlign: 'center'
            }
        }).appendTo(ctrls.background);

        ctrls.mediaMetadata = new MetadataDisplay({
            guid: this._base + 'ctrls.mediaMetadata',
            id: this._base + 'ctrls.mediaMetadata',
            focus: false,
            styles: {
                visible: false,
                vOffset: this.height - (ctrls.mediaGrid.height*2) - 120,
                hAlign: 'center',
                width: this.width - 40,
                height: ctrls.mediaGrid.height + 50,
                backgroundColor: '#111111',
            },
            updateMethod: function(gridData) {(Utility.updateMediaMetadata).bindTo(this)(gridData);}
        }).appendTo(this);

        ctrls.mediaGrid.attachAccessory(ctrls.mediaMetadata);


        this.controls.networkError = new KONtx.element.Image({
            guid: this._base + 'networkError',
            id: this._base + 'networkError',
            styles: {
                visible: false,
                src: 'Assets/960x540/serverError.png',
                hOffset: this.width - 80,
                vOffset: 10
            }
        }).appendTo(this);

        this._seasonsGridPageTrack.subscribeTo(ctrls.seasonsGrid, [ 'onPageChanged', 'onChangePage' ], ctrls.seasonsGrid);
        this._mediaGridPageTrack.subscribeTo(ctrls.mediaGrid, [ 'onPageChanged' ], ctrls.mediaGrid);
        
        this._gridFocusHandler.subscribeTo(ctrls.seasonsGrid, [ 'onFocus', 'onBlur' ], ctrls.seasonsGrid);
        this._gridFocusHandler.subscribeTo(ctrls.mediaGrid, [ 'onFocus', 'onBlur' ], ctrls.mediaGrid);

    },

    _gridFocusHandler: function(event) {
        switch(event.type) {
            case 'onFocus':
                this.getView()._focusedGrid = this;
                break;
            case 'onBlur':
                this.getView()._focusedGrid = undefined;
                break;
        }
    },


    _seasonsGridPageTrack: function(event) {
        Logger.debug( 'Resetting Seasons Grid Highlight' );
        var selectedMedia, coords, reqIndex, view;

        view = this.getView();

        if (event.type === 'onChangePage') {
            //Fire this to tell the cells to unhighlight
            //For this grid, we do it before the page changes or the highlight shows briefly before changing.
            this.fire( 'onReset', {} );
            return;
        }


        //Fire this to tell the cells to unhighlight
        this.fire( 'onReset', {} );

        reqIndex = event.payload.pageRequested.index;


        if (reqIndex <= 0) {
            view.controls.seasonsLeft.hide();
        }
        else {
            view.controls.seasonsLeft.show();
        }
        
        if (reqIndex / Config.LIBRARYSEASONSCOLUMNS < this.getPageCount() - 1 ) {
            view.controls.seasonsRight.show();
        }
        else {
            view.controls.seasonsRight.hide();
        }

        view.controls.seasonsPages.setText( ((reqIndex / Config.LIBRARYSEASONSCOLUMNS) + 1) + ' / ' + this.getPageCount() );

        //In here, this = seasonsGrid
        selectedMedia = view.persist.selectedSeason;

        if ( selectedMedia >= 0 ) {
            coords = this.getCellCoordinates(selectedMedia);
            
            if ( event.payload.pageRequested.index / coords.columns === this.normalizeIndex(selectedMedia) / coords.columns ) {
                if (this.cells[this.getCellCoordinates(selectedMedia).column]) {
                    this.cells[this.getCellCoordinates(selectedMedia).column].background.show();
                }
            }
        }
    },
    
//TODO: Can probably combine this with the one in library and remove the duplication.
    _mediaGridPageTrack: function(event) {
        var view, reqIndex;

        view = this.getView();

        reqIndex = event.payload.pageRequested.index;

        if (reqIndex <= 0) {
            view.controls.episodesLeft.hide();
        }
        else {
            view.controls.episodesLeft.show();
        }
        
        if (reqIndex / Config.LIBRARYEPISODECOLUMNS < this.getPageCount() - 1 ) {
            view.controls.episodesRight.show();
        }
        else {
            view.controls.episodesRight.hide();
        }

        view.controls.mediaPages.setText( ((reqIndex / Config.LIBRARYEPISODECOLUMNS) + 1) + ' / ' + this.getPageCount() );

    },

    
    _seasonsCellCreator: function() {
        var cell;
        
        cell = new KONtx.control.GridCell({
            styles: {
                height: KONtx.utility.scale(270)
            },
            events: {
                onSelect: (this._onSelectSeason).bindTo(this)
            }
        });

        this._seasonsCellUnHighlight.subscribeTo(this.controls.seasonsGrid, [ 'onCellSelected', 'onReset' ], cell);

        cell.background = new KONtx.element.Container({
            guid: 'cell.background',
            styles: {  
                width: this.width / Config.LIBRARYSEASONSCOLUMNS,
                height: KONtx.utility.scale(270),
                hAlign: 'center',
                vAlign: 'center',
                backgroundColor: '#FF6600',
                opacity: 0.7,
                visible: false
            }
        }).appendTo(cell);

        cell.mediaThumb = new KONtx.element.Image({
            loadingSrc: 'Assets/960x540/ThumbLoading.png',
            missingSrc: 'Assets/960x540/ThumbMissing.png',
            styles: {
                width:   Config.THUMBWIDTH,
                hAlign: 'center',
                vOffset: 10
            }
        }).appendTo(cell);

        cell.unwatched = new KONtx.element.Text({
            styles: {
                vOffset: 5,
                hOffset: Config.THUMBWIDTH - 5 - 40,
                padding: 4,
                fontSize: 14,
                fontFamily:'Helvetica',
                fontWeight: 'Bold',
                opacity: 0.8,
                color: 'white',
                backgroundColor: '#111111',
                width: 40,
                visible: false,
                textAlign: 'center'
            }
        }).appendTo(cell);

        cell.titleLabelBack = new KONtx.element.Container({
            guid: this._base + 'ctrls.titleLabelBack',
            id: this._base + 'ctrls.titleLabelBack',
            styles: {
                width: this.width,
                height: KONtx.utility.scale(60),
                vOffset: KONtx.utility.scale(270-60),
                hAlign: 'center',
                backgroundColor: '#111111',
                opacity: 0.6
            }
        }).appendTo(cell);

        cell.textLabel = new KONtx.element.Text({
            truncation: 'end',
            wrap: true,
            styles: {
                vOffset: KONtx.utility.scale(270-60),
                padding: 4,
                fontSize: 13,
                fontFamily:'Helvetica',
                fontWeight: 'Bold',
                opacity: 0.8,
                color: 'white',
                hAlign: 'center',
                width: (this.controls.background.width / Config.LIBRARYSEASONSCOLUMNS) - 8,
                height: KONtx.utility.scale(60),
                textAlign: 'center'
            }
        }).appendTo(cell);

        return cell;
    },

    _seasonsCellUpdater: function(cell, dataitem) {
        //Wrapping in a timer with a 1 ms delay. This forces this to drop to the back of javascript
        //  thread/process queue so that GC jobs get a chance to run in the middle of some more
        //  processor intensive operations to avoid overrunning memory and crashing the app. 
        KONtx.utility.timer.setTimeout( (function(){
            Logger.debug('Creating seasons cell content');
            var unwatched;
            
            cell.textLabel.data = dataitem.label;
            cell.mediaThumb.src = dataitem.mediaThumb;
    
            if (dataitem.leafCount) {
                unwatched = dataitem.viewedLeafCount ? (parseInt(dataitem.leafCount, 10) - parseInt(dataitem.viewedLeafCount, 10)) : dataitem.leafCount;
                if (unwatched > 0) {
                    cell.unwatched.setText(unwatched);
                    cell.unwatched.show();
                }
                else {
                    cell.unwatched.hide();
                }
            }
            else {
                cell.unwatched.hide();
            }
        }).bindTo(this), 1);

    },

    _seasonsCellUnHighlight: function() {
        this.background.hide();
    },


    _episodeCellCreator: function() {
        var cell;
        cell = new KONtx.control.GridCell({
            styles: {
                height: KONtx.utility.scale(170)
            },
            events: {
                onSelect: (this._onSelectEpisode).bindTo(this)
            }
        });

        cell.mediaThumb = new KONtx.element.Image({
            loadingSrc: 'Assets/960x540/ThumbLoading.png',
            missingSrc: 'Assets/960x540/ThumbMissing.png',
            styles: {
                width:   Config.EPISODETHUMBWIDTH,
                hAlign: 'center'
            }
        }).appendTo(cell);

        cell.progressBack = new KONtx.element.Container({
            guid: this._base + 'ctrls.progressBack',
            id: this._base + 'ctrls.progressBack',
            styles: {  
                width: this.width / Config.LIBRARYEPISODECOLUMNS,
                height: 9,
                vOffset: 105,
                hOffset: 0,
                backgroundColor: '#111111',
                opacity: 0.6,
                visible: false
            }
        }).appendTo(cell);

        cell.progressBar = new KONtx.element.Image({
            styles: {
                width: this.width / Config.LIBRARYEPISODECOLUMNS,
                vOffset: 107,
                height: 5,
                hOffset: 5,
                src: 'Assets/960x540/Progress.png',
                visible: false,
                fillMode: 'tile'
            }
        }).appendTo(cell);

        cell.seasonEpisodeBack = new KONtx.element.Container({
            guid: this._base + 'ctrls.progressBack',
            id: this._base + 'ctrls.progressBack',
            styles: {
                width: this.width,
                height: 30,
                vOffset: 75,
                hOffset: 0,
                backgroundColor: '#111111',
                opacity: 0.4,
                visible: false
            }
        }).appendTo(cell);

        cell.seasonEpisode = new KONtx.element.Text({
            styles: {
                vOffset: 75,
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

        cell.titleLabelBack = new KONtx.element.Container({
            guid: this._base + 'ctrls.titleLabelBack',
            id: this._base + 'ctrls.titleLabelBack',
            styles: {
                width: this.width,
                height: KONtx.utility.scale(70),
                vOffset: Config.EPISODETHUMBHEIGHT,
                hAlign: 'center',
                backgroundColor: '#111111',
                opacity: 0.6
            }
        }).appendTo(cell);

        cell.textLabel = new KONtx.element.Text({
            truncation: 'end',
            wrap: true,
            styles: {
                vOffset: Config.EPISODETHUMBHEIGHT,
                padding: 4,
                fontSize: 13,
                fontFamily:'Helvetica',
                fontWeight: 'Bold',
                opacity: 0.8,
                color: 'white',
                hAlign: 'center',
                width: (this.controls.background.width / Config.LIBRARYEPISODECOLUMNS) - 8,
                height: KONtx.utility.scale(70),
                textAlign: 'center'
            }
        }).appendTo(cell);


        return cell;
    },

    
    _mediaCellUpdater: function(cell, dataitem) {
        //Wrapping in a timer with a 1 ms delay. This forces this to drop to the back of javascript
        //  thread/process queue so that GC jobs get a chance to run in the middle of some more
        //  processor intensive operations to avoid overrunning memory and crashing the app. 
        KONtx.utility.timer.setTimeout( (function(){
            Logger.debug( 'Creating media cell content' );
            var progressWidth, seasonEpisode, unwatched, mediaInfo;
    
            mediaInfo = this.getView().persist.mediaInfo[dataitem.index];
    
            cell.mediaThumb.src = mediaInfo.mediaThumb;
            cell.textLabel.data = mediaInfo.label;
            
    
            if (mediaInfo.viewOffset) {
                progressWidth = (mediaInfo.viewOffset / mediaInfo.duration) * ((this.width / Config.LIBRARYEPISODECOLUMNS) - 10);
                cell.progressBar.setStyle('width', progressWidth);
                cell.progressBar.setStyle('opacity', 1);
                cell.progressBar.show();
                cell.progressBack.show();
            }
            else if (mediaInfo.viewCount && parseInt(mediaInfo.viewCount, 10) > 0 ) {
                cell.progressBar.setStyle('width', ((this.width / Config.LIBRARYEPISODECOLUMNS) - 10));
                cell.progressBar.setStyle('opacity', 0.3);
                cell.progressBar.show();
                cell.progressBack.show();
            }
            else {
                cell.progressBar.hide();
                cell.progressBack.hide();
            }
            
            if (mediaInfo.index && $contains( mediaInfo.type, Config.VIDEOMEDIATYPES) ) {
                seasonEpisode = $_('episode_letter') + mediaInfo.index;
                if (mediaInfo.parentIndex) {
                    seasonEpisode = $_('season_letter') + mediaInfo.parentIndex + seasonEpisode;
                }
                cell.seasonEpisode.setText(seasonEpisode);
                cell.seasonEpisode.show();
                cell.seasonEpisodeBack.show();
            }
            else {
                cell.seasonEpisode.hide();
                cell.seasonEpisodeBack.hide();
            }
            
            if (cell.unwatched) {
                if (mediaInfo.leafCount) {
                    unwatched = mediaInfo.viewedLeafCount ? (parseInt(mediaInfo.leafCount, 10) - parseInt(mediaInfo.viewedLeafCount, 10)) : mediaInfo.leafCount;
                    if (unwatched > 0) {
                        cell.unwatched.setText(unwatched);
                        cell.unwatched.show();
                    }
                    else {
                        cell.unwatched.hide();
                    }
                }
                else {
                    cell.unwatched.hide();
                }
            }
        }).bindTo(this), 1);
    },
    
    
    focusView: function() {
        Logger.debug( 'SHOWS focusView' );


    },
    
    _resetView: function() {
        Logger.debug( 'Resetting View SHOWS' );
        this.controls.networkError.hide();
        this.controls.showBanner.src = null;
        this.controls.backdropImage.src = null;

        this._resetSeasonsGrid();

    },

    _resetSeasonsGrid: function() {
        Logger.debug( 'Resetting Seasons Grid' );

        this.controls.seasonsLeft.hide();
        this.controls.seasonsRight.hide();
        
        this.controls.seasonsGrid.hide();
        this.controls.seasonsPages.hide();
        
        this._resetMediaGrid();
    },
    
    _resetMediaGrid: function() {

        Logger.debug( 'Resetting Episodes Grid' );
        this.controls.mediaGrid.hide();

        this.controls.episodesLeft.hide();
        this.controls.episodesRight.hide();
        
        this.controls.mediaPages.hide();
        
        this.controls.mediaMetadata.hide();

        
    },
    
    updateView: function() {
        Logger.debug( 'Updating View SHOWS' );

        KONtx.utility.LoadingOverlay.on();
        this._stale = false;
        PlexService.abortRequest();
        this._registerHandlers();

        //Sometimes selectedSeason is 0, so we have to check for null
        if (this.persist.needsRefresh || !(this.persist.selectedSeason !== null && this.persist.selectedSeason > -1) ) {
        
            this.persist.needsRefresh = false;
        

            this._resetView();

            this.controls._seasonsGridPager.key = this.persist.showData.key;
            
            PlexService.getMediaMetadata({
                mediaKey: this.persist.showData.key,
                callback: (this._updateSeasonsGrid).bindTo(this),
                errorCallback: (this._errorSeasonsGrid).bindTo(this),
                page: 0,
                perPage: Config.LIBRARYSEASONSCOLUMNS*2
            });

        }
        else {
            KONtx.utility.LoadingOverlay.off();
        }
    },

    _updateBannerFromParent: function(mediaInfo) {
        Logger.debug( 'Trying to update banner from Parent' );
        var artImage;

        if (mediaInfo._children[0].banner) {
            this.controls.showBanner.src = PlexService.generateImageURL(mediaInfo._children[0].banner, Config.SHOWBANNERWIDTH, Config.SHOWBANNERHEIGHT, Config.BANNERTHUMBFORMAT );
        }
        else {
            //TODO: put some other placeholder here, like text of the title
            this.controls.showBanner.src = null;
        }
        
        //Assume we also want to get the art from the parent
        if (mediaInfo._children[0].art) {
            artImage = PlexService.generateImageURL(mediaInfo._children[0].art, this.controls.background.width, this.controls.background.height, 'jpg' );
            this.controls.backdropImage.src = artImage;
        }
        else {
            this.controls.backdropImage.src = null;
        }

        KONtx.utility.LoadingOverlay.off();

    },

    _errorSeasonsGrid: function() {
        if (!this.controls.seasonsGrid.visible) {
            KONtx.application.previousView();
        }
    },
    

    //TODO: See if this and the equivalent function in Library can be reused
    _updateSeasonsGrid: function(mediaInfo) {
        Logger.debug( 'Updating seasonsGrid' );
        var arr, ctrls, fade, focus, page;

        ctrls = this.controls;
                
        KONtx.utility.LoadingOverlay.on();

        if (mediaInfo.banner) {
            ctrls.showBanner.src = PlexService.generateImageURL(mediaInfo.banner, Config.SHOWBANNERWIDTH, Config.SHOWBANNERHEIGHT, Config.BANNERTHUMBFORMAT );
        }
        //We don't have a banner, so let's try the parent
        else if (mediaInfo._children[0].parentKey) {
            PlexService.getMediaMetadata({
                mediaKey: mediaInfo._children[0].parentKey,
                callback: (this._updateBannerFromParent).bindTo(this),
                isolated: true
            });
        }
        else {
            this.controls.showBanner.src = null;
            //TODO: create a placeholder image or display title in text
        }

        if ( mediaInfo.art ) {
            ctrls.backdropImage.src = PlexService.generateImageURL(mediaInfo.art, ctrls.background.width, ctrls.background.height, 'jpg' );
        }
        else {
            ctrls.backdropImage.src = null;
        }

        arr = this._buildSeasonsArray(mediaInfo);

        if (mediaInfo.totalSize === undefined || mediaInfo.offset === undefined ) {
            this.controls._seasonsGridPager.dataArray = arr;
        }
        else {
            delete this.controls._seasonsGridPager.dataArray;
        }
        
        if (!arr.length) {
            KONtx.utility.LoadingOverlay.off();            
            Utility.emptyDialog.show();
            return;
        }

        this.controls._seasonsGridPager.initItems(arr, (mediaInfo.totalSize || arr.length ));
        
        ctrls.seasonsGrid.focus();


        ctrls.seasonsGrid.show();
        fade = Config.get( 'animate' ) ? 'fade' : 'none';
        focus = (this.persist.seasonsState && this.persist.seasonsState.focus) || { row: 0, column: 0};
        page = (this.persist.seasonsState && this.persist.seasonsState.page) || 0;
        this.controls.seasonsGrid.changePage(page, {refresh:true, transition: fade, focus: focus});

        ctrls.seasonsPages.show();
        
        if (this.persist.seasonsState && this.persist.seasonsState.key) {
            this._loadMediaGrid(this.persist.seasonsState.key);
        }
        else {
            KONtx.utility.LoadingOverlay.off();
        }
    },

    
    _buildSeasonsArray: function(mediaInfo) {
        var arr, mediaChild, mediaTitle, image, imageURL, i, parentTitle;

        arr = [];
        if (mediaInfo._children) {

            for ( i = 0; i < mediaInfo._children.length; i++ ) {
                mediaChild = mediaInfo._children[i];
                
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
                    ? (parentTitle + ': ' + mediaChild.title)
                    : mediaChild.title;

                image = mediaChild.thumb || mediaInfo.thumb;

                imageURL = PlexService.generateImageURL(image, Config.THUMBWIDTH, Config.THUMBHEIGHT, Config.THUMBFORMAT);
                
                mediaChild.label = mediaTitle;
                mediaChild.mediaThumb = imageURL;
                mediaChild.viewGroup = mediaInfo.viewGroup;
                mediaChild.contenttype = mediaInfo.contenttype;
                
                arr.push(mediaChild);
                
                
            }
        }

        return arr;
        
    },
    

    _loadMediaGrid: function(key) {
        Logger.debug( 'Loading Episodes Grid' );

        KONtx.utility.LoadingOverlay.on();

        this.controls._mediaGridPager.key = key;
        PlexService.getMediaMetadata({mediaKey: key, callback: (Utility.updateMediaGrid).bindTo(this), page: 0, perPage: Config.LIBRARYMEDIACOLUMNS*2});
    },


    _onSelectSeason: function(event) {
        var ctrls;
        
        this.persist.seasonsState = {
            page: this.controls.seasonsGrid.getCurrentPage(),
            focus: this.controls.seasonsGrid.getFocusCoordinates(),
            key: event.payload.dataItem.key
        };

        ctrls = this.controls;
        
        ctrls.seasonsGrid.fire( 'onCellSelected');
    
        ctrls.seasonsGrid.cells[event.payload.cellIndex].background.show();

        this.persist.selectedSeason = event.payload.dataIndex;
        
        this._resetMediaGrid();

        this.persist.selectedMedia = null;
        this.persist.mediaState = null;

        (Utility.mediaTypeDispatcher).bindTo(this)(event.payload.dataItem);
    },

    _seasonHandler: function(dataItem) {
        //If a directory was selected from the episodes grid, we make it back here.
        //We need to update the key that will be refreshed for the mediaGrid if we get GCd.
        this.persist.mediaState = null;

        this.persist.seasonsState.key = dataItem.key;
        
        this._loadMediaGrid(dataItem.key);
    },
    
    _onSelectEpisode: function(event) {
        this.persist.selectedMedia = event.payload.dataIndex;

        this.persist.mediaState = {
            page: this.controls.mediaGrid.getCurrentPage(),
            focus: this.controls.mediaGrid.getFocusCoordinates(),
            key: this.persist.mediaInfo[event.payload.dataItem.index].key
        };

        (Utility.mediaTypeDispatcher).bindTo(this)(this.persist.mediaInfo[event.payload.dataItem.index]);
    },
    
    _fetchSeasonsPage: function(params) {
        (this._fetchPagerPage).bindTo(this)(params, this.controls._seasonsGridPager);
    },

    _fetchMediaPage: function(params) {
        (this._fetchPagerPage).bindTo(this)(params, this.controls._mediaGridPager);
    },


    _fetchPagerPage: function(params, pager) {
        var page, perPage, loadMediaPager;

        loadMediaPager = function(mediaArray) {
            var arr;
            
            arr = pager.buildArray(mediaArray);
            pager.onGotPage(params, arr, null);
            KONtx.utility.LoadingOverlay.off();


        };

        KONtx.utility.LoadingOverlay.on();

        page = parseInt(params.page, 10);
        perPage = parseInt(params.per_page, 10);

        if (pager.dataArray) {
            //The data wasn't paged from the server, so we stored it in an array. Let's get the data from there if we are asked to fetch more
            pager.onGotPage(params, pager.dataArray.slice(page*perPage, ((page*perPage) + perPage)), null);
            KONtx.utility.LoadingOverlay.off();
        }
        else {
            if (pager.key) {
                PlexService.getMediaMetadata({mediaKey: pager.key, callback: loadMediaPager.bindTo(this), page: page, perPage: perPage});
            }
        }
    },

    selectView: function() {
        this._registerHandlers();
        
        if ( PlexService.state !== Config.STATE_READY ) {
            this.controls.networkError.show();
        }
        else {
            this.controls.networkError.hide();
        }

        if ( this._stale ) {
            KONtx.HostEventManager.send("simulateFakeLoadView");
            return;
        }

    },

    hideView: function() {
        this._unregisterHandlers();
        this._stale = true;
    },
    
    destroyView: function() {
        this.persist.needsRefresh = true;
    },


    _registerHandlers: function() {
        if( this._boundApplicationHandler ) {
            this._unregisterHandlers();
        }
        this._boundApplicationHandler = this._applicationDispatcher.subscribeTo(KONtx.application, [ 'onWidgetKeyPress' ], this);
        
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
        var map, keyCode, payload, mediaIndex, mediaInfo;

        payload = event.payload;

        switch(event.type) {
            case 'onWidgetKeyPress':
                map = KONtx.utility.KeyHandler.map;
                keyCode = payload.keyCode;

                if ( payload.eventPhase == 3 && Array.contains(keyCode, [map.STOP, map.PAUSE] ) ) {
                    event.preventDefault();
                }
                else if ( payload.eventPhase == 3 && (keyCode === map.PLAY || keyCode === 406) ) {
                    event.preventDefault();
                    if (this._focusedGrid.config.ClassName === 'mediaGrid') {
                        this.persist.selectedMedia = this._focusedGrid.getCellDataIndex(this._focusedGrid.getFocusIndex());
                        mediaIndex = this._focusedGrid.getDataItem( this.persist.selectedMedia ).index;
                        mediaInfo = this.persist.mediaInfo[mediaIndex];

                        if ( $contains(mediaInfo.type, Config.VIDEOMEDIATYPES) || PlexService.useChannels ) {
                            if (keyCode === 406) {
                                Utility.skipAuto = true;
                            }
                            PlexService.getMediaMetadata({
                                mediaKey: mediaInfo.key,
                                callback: (Utility.prePlayMovie).bindTo(Utility),
                                makeCurrentMedia: true,
                                checkFiles: true
                            });
                        }
                        else {
                            (Utility.mediaTypeDispatcher).bindTo(this)(mediaInfo);
                        }   
                    }
                }
                else if ( payload.eventPhase == 3 && keyCode === map.REWIND){
                    event.preventDefault();
                    if (this._focusedGrid) {
                        this._focusedGrid.shift('left', {focus: {row: 0, column: this._focusedGrid.getCellCount() - 1}});
                    }
                }
                else if ( payload.eventPhase == 3 && keyCode === map.FORWARD) {
                    event.preventDefault();
                    if (this._focusedGrid) {
                        this._focusedGrid.shift('right', {focus: {row: 0, column: 0}});
                    }
                }

                break;
        }
    }
    

});
