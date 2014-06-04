var LibraryView = new KONtx.Class({
    ClassName: 'LibraryView',
    
    Extends: KONtx.system.FullscreenView,
    
    initView: function() {
    
        this.controls._mediaGridPager = new KONtx.utility.Pager(Config.LIBRARYMEDIACOLUMNS, Config.LIBRARYMEDIACOLUMNS*2, this._fetchMediaPage, this, Config.LIBRARYPAGESCACHED);
        this.controls._mediaGridPager.buildArray = (Utility.buildMediaArray).bindTo(this);
        this.controls._sectionsGridPager = new KONtx.utility.Pager(Config.LIBRARYSECTIONCOLUMNS, Config.LIBRARYSECTIONCOLUMNS*2, this._fetchSectionsPage, this, Config.LIBRARYPAGESCACHED);
        this.controls._sectionsGridPager.buildArray = (this._buildSectionsArray).bindTo(this);
        this.controls._secondaryGridPager = new KONtx.utility.Pager(Config.LIBRARYSECONDARYCOLUMNS, Config.LIBRARYSECONDARYCOLUMNS*2, this._fetchSecondaryPage, this, Config.LIBRARYPAGESCACHED);
        this.controls._secondaryGridPager.buildArray = (this._buildSecondaryArray).bindTo(this);

        
    },
    
    _base: 'library.',
    _staleData: false,
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

        ctrls.sectionsGrid = new KONtx.control.Grid({
            guid: this._base + 'ctrls.sectionsGrid',
            id: this._base + 'ctrls.sectionsGrid',
            focus: true,
            animate: Config.get('animate'),
            columns: Config.LIBRARYSECTIONCOLUMNS,
            rows: 1,
            carousel: true,
            cellCreator: (this._sectionsCellCreator).bindTo(this),
            cellUpdater: this._sectionsCellUpdater,
            pager: this.controls._sectionsGridPager,
            styles: {
                vOffset: 0,
                width: this.width,
                height: KONtx.utility.scale(115),
                hOffset: 0
            }
        }).appendTo(ctrls.background); 
        
        
        ctrls.sectionLeft = new KONtx.element.Image({
            guid: this._base + 'ctrls.sectionLeft',
            id: this._base + 'ctrls.sectionLeft',
            styles: {
                src: 'Assets/960x540/arrowLeft.png',
                hOffset: 5,
                vOffset: 40
            }
        }).appendTo(ctrls.background);

        ctrls.sectionRight = new KONtx.element.Image({
            guid: this._base + 'ctrls.sectionRight',
            id: this._base + 'ctrls.sectionRight',
            styles: {
                src: 'Assets/960x540/arrowRight.png',
                hOffset: this.width - 25 - 5,
                vOffset: 40
            }
        }).appendTo(ctrls.background);

        ctrls.sectionPages = new KONtx.element.Text({
            guid: this._base + 'ctrls.sectionPages',
            id: this._base + 'ctrls.sectionPages',
            styles: {
                vOffset: ctrls.sectionsGrid.outerHeight - 25,
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

        ctrls.sectionDirectories = new KONtx.control.TabStrip({
            guid: this._base + 'ctrls.sectionDirectories',
            id: this._base + 'ctrls.sectionDirectories',
            tabs: [],
            defaultTab: 1,
            styles: {
                width: this.width,
                vOffset: ctrls.sectionsGrid.outerHeight,
                height: KONtx.utility.scale(25)
            },
            textStyles: {
                fontSize: 13,
                fontFamily:'Helvetica',
                fontWeight: 'Bold',
                opacity: 0.8,
                color: 'white',
                hAlign: 'center'
            },
            events: {
                onTabSelect: (this._onTabSelect).bindTo(this)
            }
        }).appendTo(ctrls.background);

        
        ctrls.mediaGridContainer = new KONtx.element.Container({
            guid: this._base + 'ctrls.gridContainer',
            id: this._base + 'ctrls.gridContainer',
            focus: false,
            styles: {
                width: this.width,
                height: KONtx.utility.scale(230),
                vOffset: ctrls.sectionDirectories.outerHeight,
                hOffset: 0,
                opacity: 1
            }
        }).appendTo(ctrls.background);
        
        ctrls.mediaGrid = new KONtx.control.Grid({
            ClassName: 'mediaGrid',
            guid: this._base + 'ctrls.mediaGrid',
            id: this._base + 'ctrls.mediaGrid',
            animate: Config.get('animate'),
            focus: true,
            columns: Config.LIBRARYMEDIACOLUMNS,
            rows: 1,
            carousel: true,
            cellCreator: (this._mediaCellCreator).bindTo(this),
            cellUpdater: this._mediaCellUpdater,
            pager: this.controls._mediaGridPager,
            styles: {
                vOffset: 0,
                width: this.width,
                height: KONtx.utility.scale(230)
            }
        }).appendTo(ctrls.mediaGridContainer);
                
        ctrls.mediaLeft = new KONtx.element.Image({
            guid: this._base + 'ctrls.mediaLeft',
            id: this._base + 'ctrls.mediaLeft',
            styles: {
                src: 'Assets/960x540/arrowLeft.png',
                hOffset: 5,
                vOffset: 250
            }
        }).appendTo(ctrls.background);

        ctrls.mediaRight = new KONtx.element.Image({
            guid: this._base + 'ctrls.mediaRight',
            id: this._base + 'ctrls.mediaRight',
            styles: {
                src: 'Assets/960x540/arrowRight.png',
                hOffset: this.width - 25 - 5,
                vOffset: 250
            }
        }).appendTo(ctrls.background);

        ctrls.mediaPages = new KONtx.element.Text({
            guid: this._base + 'ctrls.mediaPages',
            id: this._base + 'ctrls.mediaPages',
            styles: {
                visible: false,
                vOffset: ctrls.mediaGridContainer.outerHeight - 25,
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

        
        ctrls.secondaryGrid = new KONtx.control.Grid({
            guid: this._base + 'ctrls.secondaryGrid',
            id: this._base + 'ctrls.secondaryGrid',
            focus: true,
            animate: Config.get('animate'),
            columns: Config.LIBRARYSECONDARYCOLUMNS,
            rows: 1,
            carousel: true,
            cellCreator: (this._secondaryCellCreator).bindTo(this),
            cellUpdater: this._secondaryCellUpdater,
            pager: this.controls._secondaryGridPager,
            styles: {
                vOffset: ctrls.sectionDirectories.outerHeight,
                width: this.width,
                height: KONtx.utility.scale(25),
                hOffset: 0
            }
        }).appendTo(ctrls.background); 
        
        
        ctrls.secondaryLeft = new KONtx.element.Image({
            guid: this._base + 'ctrls.secondaryLeft',
            id: this._base + 'ctrls.secondaryLeft',
            styles: {
                src: 'Assets/960x540/arrowLeft.png',
                hOffset: 5,
                vOffset: ctrls.secondaryGrid.outerHeight - 25
            }
        }).appendTo(ctrls.background);

        ctrls.secondaryRight = new KONtx.element.Image({
            guid: this._base + 'ctrls.secondaryRight',
            id: this._base + 'ctrls.secondaryRight',
            styles: {
                src: 'Assets/960x540/arrowRight.png',
                hOffset: this.width - 25 - 5,
                vOffset: ctrls.secondaryGrid.outerHeight - 25
            }
        }).appendTo(ctrls.background);

        ctrls.mediaMetadataContainer = new KONtx.element.Container({
            guid: this._base + 'ctrls.mediaMetadataContainer',
            id: this._base + 'ctrls.mediaMetadataContainer',
            focus: false,
            styles: {
                width: this.width,
                height: this.height - ctrls.mediaGridContainer.outerHeight,
                vOffset: ctrls.mediaGridContainer.outerHeight,
                hOffset: 0,
                opacity: 1
            }
        }).appendTo(ctrls.background);

        ctrls.mediaMetadata = new MetadataDisplay({
            guid: this._base + 'ctrls.mediaMetadata',
            id: this._base + 'ctrls.mediaMetadata',
            focus: false,
            styles: {
                visible: false,
                vOffset: 0,
                hAlign: 'center',
                width: this.width,
                height: ctrls.mediaMetadataContainer.height,
                backgroundColor: '#111111'
            },
            updateMethod: function(gridData) {(Utility.updateMediaMetadata).bindTo(this)(gridData);}
        }).appendTo(ctrls.mediaMetadataContainer);

        ctrls.mediaGrid.attachAccessory(ctrls.mediaMetadata);

        ctrls.networkError = new KONtx.element.Image({
            id: 'networkError',
            guid: 'networkError',
            styles: {
                visible: false,
                src: 'Assets/960x540/serverError.png',
                hOffset: this.width - 80,
                vOffset: 10
            }
        }).appendTo(this);



        //TODO: The right way to handle this is probably by extending the grid control, but that will have to wait for now. 
        this._sectionsGridPageTrack.subscribeTo(ctrls.sectionsGrid, [ 'onPageChanged', 'onChangePage' ], ctrls.sectionsGrid);
        this._secondaryGridPageTrack.subscribeTo(ctrls.secondaryGrid, [ 'onChangePage', 'onPageChanged' ], ctrls.secondaryGrid);
        this._mediaGridPageTrack.subscribeTo(ctrls.mediaGrid, [ 'onPageChanged' ], ctrls.mediaGrid);

        this._gridFocusHandler.subscribeTo(ctrls.sectionsGrid, [ 'onFocus', 'onBlur' ], ctrls.sectionsGrid);
        this._gridFocusHandler.subscribeTo(ctrls.secondaryGrid, [ 'onFocus', 'onBlur' ], ctrls.secondaryGrid);
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


    _sectionsGridPageTrack: function(event) {
        Logger.debug( 'Resetting Sections Grid' );
        var coords, view, reqIndex;


        if (event.type === 'onChangePage') {
            //Fire this to tell the cells to unhighlight
            //For this grid, we do it before the page changes or the highlight shows briefly before changing.
            this.fire( 'onReset', {} );
            return;
        }

        view = this.getView();

        //in here, this = sectionsGrid

        //Fire this to tell the cells to unhighlight
        this.fire( 'onReset', {} );

        reqIndex = event.payload.pageRequested.index;

        
        if (reqIndex <= 0) {
            view.controls.sectionLeft.hide();
        }
        else {
            view.controls.sectionLeft.show();
        }
        
        if (reqIndex / Config.LIBRARYSECTIONCOLUMNS < this.getPageCount() - 1 ) {
            view.controls.sectionRight.show();
        }
        else {
            view.controls.sectionRight.hide();
        }

        view.controls.sectionPages.setText( ((reqIndex / Config.LIBRARYSECTIONCOLUMNS) + 1) + ' / ' + this.getPageCount() );


        if ( view.persist.selectedSection >= 0 && view.persist.selectedSection !== null ) {
            coords = this.getCellCoordinates(view.persist.selectedSection);

            //If we are on the right page, highlight the cell
            if ( reqIndex / coords.columns === this.normalizeIndex(view.persist.selectedSection) / coords.columns ) {
                if (this.cells[this.getCellCoordinates(view.persist.selectedSection).column]) {
                    this.cells[ this.getCellCoordinates(view.persist.selectedSection).column ].background.show();
                }
            }
        }
    },


    _secondaryGridPageTrack: function(event) {
        Logger.debug( 'Resetting Secondary Grid' );
        var coords, view, reqIndex;
        
        //in here, this = secondaryGrid

        if (event.type === 'onChangePage') {
            //Fire this to tell the cells to unhighlight
            //For this grid, we do it before the page changes or the highlight shows briefly before changing.
            this.fire( 'onReset', {} );
            return;
        }
        
        view = this.getView();

        reqIndex = event.payload.pageRequested.index;


        if (reqIndex <= 0) {
            view.controls.secondaryLeft.hide();
        }
        else {
            view.controls.secondaryLeft.show();
        }
        
        if (reqIndex / Config.LIBRARYSECONDARYCOLUMNS < this.getPageCount() - 1 ) {
            view.controls.secondaryRight.show();
        }
        else {
            view.controls.secondaryRight.hide();
        }

//        view.controls.sectionPages.setText( ((reqIndex / Config.LIBRARYSECTIONCOLUMNS) + 1) + ' / ' + this.getPageCount() );


        if ( view.persist.selectedSecondarySection >= 0 && view.persist.selectedSecondarySection !== null) {
            coords = this.getCellCoordinates(view.persist.selectedSecondarySection);

            //If we are on the right page, highlight the cell
            if ( reqIndex / coords.columns === this.normalizeIndex(view.persist.selectedSecondarySection) / coords.columns ) {
                if (this.cells[this.getCellCoordinates(view.persist.selectedSecondarySection).column]) {
                    this.cells[ this.getCellCoordinates(view.persist.selectedSecondarySection).column ].background.show();
                }
            }
        }
    },

    
    _mediaGridPageTrack: function(event) {
        Logger.debug( 'Resetting Media Grid' );
        var view;
        
        //in here, this = mediaGrid

        view = this.getView();
        
        if (event.payload.pageRequested.index <= 0) {
            view.controls.mediaLeft.hide();
        }
        else {
            view.controls.mediaLeft.show();
        }
        
        if ( event.payload.pageRequested.index / Config.LIBRARYMEDIACOLUMNS < this.getPageCount() - 1 ) {
            view.controls.mediaRight.show();
        }
        else {
            view.controls.mediaRight.hide();
        }
        view.controls.mediaPages.setText( (( event.payload.pageRequested.index / Config.LIBRARYMEDIACOLUMNS) + 1) + ' / ' + this.getPageCount() );
    },

    
    _sectionsCellCreator: function() {
        var cell;
        
        cell = new KONtx.control.GridCell({
            styles: {
                height: KONtx.utility.scale(130)
            },
            events: {
                onSelect: (this._onSectionCellSelect).bindTo(this)
            }
        });

        this._sectionsCellUnHighlight.subscribeTo(this.controls.sectionsGrid, [ 'onCellSelected', 'onReset' ], cell);

        cell.background = new KONtx.element.Container({
            styles: {  
                width: this.width / Config.LIBRARYSECTIONCOLUMNS,
                height: KONtx.utility.scale(130),
                hAlign: 'center',
                vAlign: 'center',
                backgroundColor: '#FF6600',
                opacity: 0.7,
                visible: false
            }
        }).appendTo(cell);


        cell.mediaThumb = new KONtx.element.Image({
            loadingSrc: 'Assets/960x540/SectionLoading.png',
            missingSrc: 'Assets/960x540/SectionMissing.png',
            styles: {
                hAlign: 'center'
            }
        }).appendTo(cell);
        
        cell.textLabel = new KONtx.element.Text({
            truncation: 'end',
            wrap: true,
            styles: {
                vOffset: Config.SECTIONTHUMBHEIGHT,
                padding: 4,
                fontSize: 13,
                fontFamily:'Helvetica',
                fontWeight: 'Bold',
                opacity: 0.8,
                color: 'white',
                hAlign: 'center',
                //TODO: This is ugly. Need to make the 8 be calculated from the padding above.
                width: ( this.controls.background.width / Config.LIBRARYSECTIONCOLUMNS ) - 8,
                height: KONtx.utility.scale(40),
                textAlign: 'center'
            }
        }).appendTo(cell);

        return cell;
    },

    _sectionsCellUpdater: function(cell, dataitem) {
        KONtx.utility.timer.setTimeout( function(){
            cell.textLabel.data = dataitem.label;
            cell.mediaThumb.src = dataitem.mediaThumb;
        }, 1);
    },

    
    _secondaryCellUpdater: function(cell, dataitem) {
        KONtx.utility.timer.setTimeout( function(){
            cell.textLabel.data = dataitem.label;
        }, 1);
    },

    _secondaryCellCreator: function() {
        var cell;
        
        cell = new KONtx.control.GridCell({
            styles: {
                height: KONtx.utility.scale(30)
            },
            events: {
                onSelect: (this._onSecondaryCellSelect).bindTo(this)
            }
        });

        cell.background = new KONtx.element.Container({
            styles: {  
                width: this.width / Config.LIBRARYSECONDARYCOLUMNS,
                height: KONtx.utility.scale(30),
                hAlign: 'center',
                vAlign: 'center',
                backgroundColor: '#FF6600',
                opacity: 0.7,
                visible: false
            }
        }).appendTo(cell);

        this._secondaryCellUnHighlight.subscribeTo(this.controls.secondaryGrid, [ 'onCellSelected', 'onReset' ], cell);

        
        cell.textLabel = new KONtx.element.Text({
            truncation: 'end',
            wrap: true,
            styles: {
//                vOffset: Config.SECTIONTHUMBHEIGHT,
                padding: 4,
                fontSize: 13,
                fontFamily:'Helvetica',
                fontWeight: 'Bold',
                opacity: 0.8,
                color: 'white',
                hAlign: 'center',
                //TODO: This is ugly. Need to make the 8 be calculated from the padding above.
                width: ( this.controls.background.width / Config.LIBRARYSECONDARYCOLUMNS ) - 8,
                height: KONtx.utility.scale(30),
                textAlign: 'center'
            }
        }).appendTo(cell);

        return cell;
    },


    _mediaCellCreator: function() {
        var cell;
        
        cell = new KONtx.control.GridCell({
            styles: {
//                height: KONtx.utility.scale(230),
            },
            events: {
                onSelect: (this._onMediaCellSelect).bindTo(this)
            }
        });

        cell.mediaThumb = new KONtx.element.Image({
            loadingSrc: 'Assets/960x540/ThumbLoading.png',
            missingSrc: 'Assets/960x540/ThumbMissing.png',
            styles: {
                width:   Config.THUMBWIDTH,
                hAlign: 'center',
                vOffset: 5
            }
        }).appendTo(cell);

        cell.progressBack = new KONtx.element.Container({
            guid: this._base + 'ctrls.progressBack',
            id: this._base + 'ctrls.progressBack',
            styles: {
                width: this.width / Config.LIBRARYMEDIACOLUMNS,
                height: 9,
                vOffset: KONtx.utility.scale(230) - 9,
                hOffset: 0,
                backgroundColor: '#111111',
                opacity: 0.6,
                visible: false
            }
        }).appendTo(cell);

        cell.progressBar = new KONtx.element.Image({
            styles: {
                width: this.width / Config.LIBRARYMEDIACOLUMNS,
                vOffset: KONtx.utility.scale(230) - 7,
                height: 5,
                hOffset: 5,
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
                vOffset: 5,
                hOffset: 0,
                backgroundColor: '#111111',
                opacity: 0.4,
                visible: false
            }
        }).appendTo(cell);

        cell.seasonEpisode = new KONtx.element.Text({
            styles: {
                vOffset: 5,
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
                height: 60,
                vOffset: KONtx.utility.scale(230) - 9 - 60,
                hOffset: 0,
                backgroundColor: '#111111',
                opacity: 0.6
            }
        }).appendTo(cell);

        cell.titleLabel = new KONtx.element.Text({
            truncation: 'end',
            wrap: true,
            styles: {
                vOffset: KONtx.utility.scale(230) - 9 - 60,
                hOffset: 10,
                padding: 4,
                height: 60,
                fontSize: 13,
                fontFamily:'Helvetica',
                fontWeight: 'Bold',
                opacity: 0.9,
                color: 'white',
                width: Config.THUMBWIDTH,
                textAlign: 'center'
            }
        }).appendTo(cell);

        cell.unwatched = new KONtx.element.Text({
            styles: {
                vOffset: 5,
                hOffset: (this.width / Config.LIBRARYMEDIACOLUMNS) - 5 - 40,
                padding: 4,
                fontSize: 14,
                fontFamily:'Helvetica',
                fontWeight: 'Bold',
                opacity: 0.8,
                color: 'white',
                backgroundColor: '#111111',
                width: 40,
                textAlign: 'center',
                visible: false
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
            var seasonEpisode, unwatched, mediaInfo;
    
            mediaInfo = this.getView().persist.mediaInfo[dataitem.index];
    
            cell.mediaThumb.src = mediaInfo.mediaThumb;
    
            cell.titleLabel.setText(mediaInfo.label);
    
            if (mediaInfo.viewOffset) {
                cell.progressBar.setStyle('width', (mediaInfo.viewOffset / mediaInfo.duration) * ((this.width / Config.LIBRARYMEDIACOLUMNS) - 10) );
                cell.progressBar.setStyle('opacity', 1);
                cell.progressBar.show();
                cell.progressBack.show();
            }
            else if (mediaInfo.viewCount && parseInt(mediaInfo.viewCount, 10) > 0 ) {
                cell.progressBar.setStyle('width', ((this.width / Config.LIBRARYMEDIACOLUMNS) - 10));
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
        Logger.debug('FocusView');

        if (this.controls.sectionsGrid.visible && !this.controls.sectionDirectories.visible) {
            this.controls.sectionsGrid.focus();
        }

    },

    _resetView: function() {

        this.controls.networkError.hide();
        
        this._resetSectionsGrid();
    },
    

    _resetSectionsGrid: function() {

        this.controls.sectionsGrid.hide();

        this.controls.sectionPages.hide();
        this.controls.sectionLeft.hide();
        this.controls.sectionRight.hide();

        this._resetSectionDirectories();
    },

    _resetSectionDirectories: function() {
        
        this.controls.sectionDirectories.hide();
        
        this.controls.mediaGridContainer.setStyle('vOffset', this.controls.sectionDirectories.outerHeight);
        this.controls.mediaMetadataContainer.setStyle( 'vOffset', this.controls.mediaGridContainer.outerHeight );
        this.controls.mediaMetadataContainer.setStyle( 'height', this.height - this.controls.sectionDirectories.outerHeight );

        this._resetSecondaryGrid();
    },
    
    _resetSecondaryGrid: function() {

        this.controls.secondaryGrid.hide();

        this.controls.secondaryLeft.hide();
        this.controls.secondaryRight.hide();

        this._resetMediaGrid();
    },


    _resetMediaGrid: function() {

        this.controls.mediaGrid.hide();

        this.controls.mediaLeft.hide();
        this.controls.mediaRight.hide();
        
        this.controls.mediaMetadata.hide();

        this.controls.mediaPages.hide();
    },

    
    _sectionsCellUnHighlight: function() {
        this.background.hide();
    },

    _secondaryCellUnHighlight: function() {
        this.background.hide();
    },

    _resetDirectoryCache: function() {
        this.persist.selectedDirectory = null;
        
        this.persist.directoryState = null;

        this._resetSecondaryCache();
    },

    _resetSecondaryCache: function() {
        this.persist.selectedSecondarySection = null;
        
        this.persist.secondaryState = null;

        this._resetMediaCache();
    },

    _resetMediaCache: function() {
        
        this.persist.mediaState = null;
        
        if (this.persist.mediaInfo) {
            this.persist.mediaInfo.length = 0;
        }
        else {
            this.persist.mediaInfo = [];
        }

        this.persist.selectedMedia = null;
    },

    
    updateView: function() {
        Logger.debug( 'LIBRARY Updating View' );
        var states;

        KONtx.utility.LoadingOverlay.on();
        this._stale = false;

        PlexService.abortRequest();

        this._stale = false;
        this._registerHandlers();
        
        //Sometimes selectedSection is 0, so we have to check for null
        if (this.persist.needsRefresh || !(this.persist.selectedSection !== null && this.persist.selectedSection > -1) ) {
        
            this.persist.needsRefresh = false;
            
            this._resetView();

            this.controls._sectionsGridPager.key = Config.PLEX_SECTIONS;
            PlexService.getMediaMetadata({ mediaKey: Config.PLEX_SECTIONS, callback: (this._updateSectionsGrid).bindTo(this), errorCallback: (this._errorSectionsGrid).bindTo(this), page: 0, perPage: Config.LIBRARYSECTIONCOLUMNS*2});
        }
        else {
            KONtx.utility.LoadingOverlay.off();
        }
    },
    
    
    _updateSectionsGrid: function(sectionsResp) {
        Logger.debug( 'Updating Sections' );
        var arr, fade, page, focus, sectionsGrid;
        
        arr = this._buildSectionsArray(sectionsResp);

        if (sectionsResp.totalSize === undefined || sectionsResp.offset === undefined ) {
            this.controls._sectionsGridPager.dataArray = arr;
        }
        else {
            delete this.controls._sectionsGridPager.dataArray;
        }

        if (!arr.length) {
            KONtx.utility.LoadingOverlay.off();            
            Utility.emptyDialog.show();
            return;
        }

        sectionsGrid = this.controls.sectionsGrid;
        
        //Have to add 2 to the total size because we are manually adding Library and Channels in the array builder
        this.controls._sectionsGridPager.initItems(arr, (sectionsResp.totalSize + 2 || arr.length ));

        sectionsGrid.focus();

        sectionsGrid.show();

        fade = Config.get( 'animate' ) ? 'fade' : 'none';
        focus = (this.persist.sectionsState && this.persist.sectionsState.focus) || { row: 0, column: 0};
        page = (this.persist.sectionsState && this.persist.sectionsState.page) || 0;
        this.controls.sectionsGrid.changePage(page, {refresh:true, transition: fade, focus: focus});

        
        this.controls.sectionPages.show();

        if (this.persist.sectionsState && this.persist.sectionsState.key) {
            this._loadDirectoryTabs(this.persist.sectionsState.key);
        }
        else {
            KONtx.utility.LoadingOverlay.off();
        }
//
    },


    _buildSectionsArray: function(sectionsResp) {
        var arr, i, sectionTitle, image, sections;
        
        sections = sectionsResp._children;

        arr = [];        

        arr.push({
                label: $_('library'),
                mediaThumb: Config.LIBRARYICON,
                mediaKey: Config.PLEX_LIBRARY
            });
        
        arr.push({
                label: $_('channels'),
                mediaThumb: Config.LIBRARYICON,
                mediaKey: Config.PLEX_CHANNELS
            });

        if (sections) {
            for ( i = 0; i < sections.length; i++ ) {

                image = sections[i].thumb;
                sectionTitle = sections[i].title;

                arr.push({
                    label: sectionTitle,
                    mediaThumb: PlexService.generateImageURL(image, Config.SECTIONTHUMBWIDTH, Config.SECTIONTHUMBHEIGHT, Config.SECTIONTHUMBFORMAT ),
                    mediaKey: Config.PLEX_SECTIONS + '/' + sections[i].key
                });
            }
        }

        return arr;
    },
    
    
    _errorSectionsGrid: function() {
        if (!this.controls.sectionsGrid.visible) {
            KONtx.application.previousView();
        }
    },


    _updateSecondaryGrid: function(sectionsResp) {
        Logger.debug( 'Updating Secondary Grid' );
        var arr, fade, focus, page;

        arr = this._buildSecondaryArray(sectionsResp);

        if (sectionsResp.totalSize === undefined || sectionsResp.offset === undefined ) {
            this.controls._secondaryGridPager.dataArray = arr;
        }
        else {
            delete this.controls._secondaryGridPager.dataArray;
        }
        
        if (!arr.length) {
            KONtx.utility.LoadingOverlay.off();            
            Utility.emptyDialog.show();
            return;
        }

        
        this.controls._secondaryGridPager.initItems(arr, (sectionsResp.totalSize || arr.size ));

        this.controls.secondaryGrid.focus();

        this.controls.secondaryGrid.show();

        fade = Config.get( 'animate' ) ? 'fade' : 'none';
        focus = (this.persist.secondaryState && this.persist.secondaryState.focus) || {row:0,column:0};
        page = (this.persist.secondaryState && this.persist.secondaryState.page) || 0;
        this.controls.secondaryGrid.changePage(page, {refresh:true, transition: fade, focus: focus});

        if (this.persist.secondaryState && this.persist.secondaryState.key) {
            this._loadMediaGrid(this.persist.secondaryState.key);
        }
        else {
           KONtx.utility.LoadingOverlay.off();
        }
//
    },

    
    _buildSecondaryArray: function(sectionsResp) {
        var arr, i, sectionTitle, sections, mediaKey;

        sections = sectionsResp._children;

        arr = [];
        
        if (sections) {
            for ( i = 0; i < sections.length; i++ ) {

                sectionTitle = sections[i].title;
                
                sectionTitle = sectionTitle == '-1' ? $_('section_title_missing') : sectionTitle;
                mediaKey = sectionsResp.title2 === 'By Folder' ? sections[i].key : sectionsResp.urlPrefix + '/' + sections[i].key;

                arr.push({
                    label: sectionTitle,
                    mediaKey: mediaKey
                });
            }
        }
        
        return arr;

    },

    _onSectionCellSelect: function(event) {
        this.controls.sectionsGrid.fire( 'onCellSelected' );

        this.persist.sectionsState = {
            page: this.controls.sectionsGrid.getCurrentPage(),
            focus: this.controls.sectionsGrid.getFocusCoordinates(),
            key: event.payload.dataItem.mediaKey
        };

        this.controls.sectionsGrid.cells[event.payload.cellIndex].background.show();
        this.persist.selectedSection = event.payload.dataIndex;


        this._resetDirectoryCache();
        this._resetSectionDirectories();

        PlexService.useChannels = false;

        if ( event.payload.dataItem.mediaKey === Config.PLEX_CHANNELS ) {
            Logger.debug('USING CHANNELS OPTIONS');
            PlexService.useChannels = true;
        }
        this._loadDirectoryTabs(event.payload.dataItem.mediaKey);
    },
    

    _onTabSelect: function(event) {
        this.persist.selectedDirectory = event.payload.index;
        this.persist.directoryState = {
            key: event.payload.key,
            index: event.payload.index,
            secondary: event.payload.secondary
        };

        this._resetSecondaryGrid();
        this._resetSecondaryCache();

        if ( event.payload.secondary || event.payload.label === 'By Folder' ) {


            this.controls.mediaGridContainer.setStyle('vOffset', this.controls.sectionDirectories.outerHeight + 25);
            this.controls.mediaMetadataContainer.setStyle( 'vOffset', this.controls.mediaGridContainer.outerHeight);
            this.controls.mediaMetadataContainer.setStyle( 'height', this.height - this.controls.sectionDirectories.outerHeight);
    
            this._loadSecondaryGrid(event.payload.key);
            return;
        }

        this.controls.mediaGridContainer.setStyle('vOffset', this.controls.sectionDirectories.outerHeight);
        this.controls.mediaMetadataContainer.setStyle( 'vOffset', this.controls.mediaGridContainer.outerHeight );
        this.controls.mediaMetadataContainer.setStyle( 'height', this.height - this.controls.sectionDirectories.outerHeight );
        
        this._loadMediaGrid(event.payload.key);
    },


    _onSecondaryCellSelect: function(event) {
        Logger.debug( 'onSecondaryCellSelect' );
        
        this.persist.secondaryState = {
            page: this.controls.secondaryGrid.getCurrentPage(),
            focus: this.controls.secondaryGrid.getFocusCoordinates(),
            key: event.payload.dataItem.mediaKey
        };

        
        this.controls.secondaryGrid.fire( 'onCellSelected' );

        this.controls.secondaryGrid.cells[event.payload.cellIndex].background.show();
        this.persist.selectedSecondarySection = event.payload.dataIndex;

        this._resetMediaCache();
        this._resetMediaGrid();

        this._loadMediaGrid(event.payload.dataItem.mediaKey);
    },
    

    _onMediaCellSelect: function(event) {
        this.persist.selectedMedia = event.payload.dataIndex;
        
        this.persist.mediaState = {
            page: this.controls.mediaGrid.getCurrentPage(),
            focus: this.controls.mediaGrid.getFocusCoordinates(),
            key: this.persist.mediaInfo[event.payload.dataItem.index].key
        };
        
        (Utility.mediaTypeDispatcher).bindTo(this)(this.persist.mediaInfo[event.payload.dataItem.index]);
    },

    _loadDirectoryTabs: function(key) {
        Logger.debug( 'Loading Tab Strip' );
        
        KONtx.utility.LoadingOverlay.on();


        PlexService.getMediaMetadata({ mediaKey: key, callback: (this._updateTabStrip).bindTo(this)});

    },
    

    
    _loadSecondaryGrid: function(key) {
        Logger.debug( 'Loading Media Grid' );

        KONtx.utility.LoadingOverlay.on();

        this.controls._secondaryGridPager.key = key;
        PlexService.getMediaMetadata({mediaKey: key, callback: (this._updateSecondaryGrid).bindTo(this), page: 0, perPage: Config.LIBRARYSECONDARYCOLUMNS*2});
        
    },

    _loadMediaGrid: function(key) {
        Logger.debug( 'Loading Media Grid' );

        KONtx.utility.LoadingOverlay.on();

        this.controls._mediaGridPager.key = key;
        PlexService.getMediaMetadata({mediaKey: key, callback: (Utility.updateMediaGrid).bindTo(this), page: 0, perPage: Config.LIBRARYMEDIACOLUMNS*2});
        
    },

    _fetchSectionsPage: function(params) {
        (this._fetchPagerPage).bindTo(this)(params, this.controls._sectionsGridPager);
    },

    _fetchSecondaryPage: function(params) {
        (this._fetchPagerPage).bindTo(this)(params, this.controls._secondaryGridPager);
    },

    _fetchMediaPage: function(params) {
        (this._fetchPagerPage).bindTo(this)(params, this.controls._mediaGridPager);
    },

//TODO: Move this so it isn't duplicated on Shows view
    _fetchPagerPage: function(params, pager) {
        var page, perPage, loadMediaPager;

        loadMediaPager = function(mediaArray) {
            var arr;
            
            arr = pager.buildArray(mediaArray);
            pager.onGotPage(params, arr, null);
            KONtx.utility.LoadingOverlay.off();

        };

        KONtx.utility.LoadingOverlay.on();

        page = params.page;
        perPage = params.per_page;


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
    
    
    _updateTabStrip: function(directoriesResp) {
        Logger.debug( 'Updating Tab Strip' );

        var tabs, i, libChild, directories, focus;

        directories = directoriesResp._children;

        tabs = [];

        if (directories) {
            for ( i = 0; i < directories.length; i++ ) {
                
                libChild = directories[i];
                if ( libChild._elementType !== 'Directory' ) {
                    continue;
                }
                
                //Skip sections because we handle that manually elsewhere
                if ( libChild.key === Config.PLEX_SECTIONSKEY ) {
                    continue;
                }
                
                if (libChild.search) {
                    continue;
                }

                //TODO: Temporarily remove support for By Folder
                if ( libChild.key === 'folder' ) {
                    continue;
                }

                tabs.push({
                    label: libChild.title,
                    key: directoriesResp.urlPrefix + '/' + libChild.key,
                    secondary: libChild.secondary || undefined
                });

            }
        }

        this.controls.sectionDirectories.focus();
        
        //IMPORTANT: The control doesn't focus correctly if it is not visible, so we make it visible before initting it. 
        this.controls.sectionDirectories.show();

        focus = (this.persist.directoryState !== null && this.persist.directoryState.index) || 0;
        this.controls.sectionDirectories.initTabs(tabs, focus + 1);

        if (this.persist.directoryState && this.persist.directoryState.secondary) {
            this.controls.mediaGridContainer.setStyle('vOffset', this.controls.sectionDirectories.outerHeight + 25);
            this.controls.mediaMetadataContainer.setStyle( 'vOffset', this.controls.mediaGridContainer.outerHeight);
            this.controls.mediaMetadataContainer.setStyle( 'height', this.height - this.controls.sectionDirectories.outerHeight);

            this._loadSecondaryGrid(this.persist.directoryState.key);
        }
        else if (this.persist.directoryState && this.persist.directoryState.key) {
            this.controls.mediaGridContainer.setStyle('vOffset', this.controls.sectionDirectories.outerHeight);
            this.controls.mediaMetadataContainer.setStyle( 'vOffset', this.controls.mediaGridContainer.outerHeight );
            this.controls.mediaMetadataContainer.setStyle( 'height', this.height - this.controls.sectionDirectories.outerHeight );

            this._loadMediaGrid(this.persist.directoryState.key);
        }
        else {
            this.controls.mediaGridContainer.setStyle('vOffset', this.controls.sectionDirectories.outerHeight);
            this.controls.mediaMetadataContainer.setStyle( 'vOffset', this.controls.mediaGridContainer.outerHeight );
            this.controls.mediaMetadataContainer.setStyle( 'height', this.height - this.controls.sectionDirectories.outerHeight );

            this._loadMediaGrid(tabs[0].key);
        }
        
    },

    hideView: function() {
        this._unregisterHandlers();
        
//        this._resetView();
        this._stale = true;
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

        //UGLY FIX FOR AN UGLY BUG
        //When user hits the VIA button on the remote while in the player, it goes to the dock. If the user then presses the
        //VIA button again, it returns to the library screen for some unknown reason. This will at least get it back to the player.
        //Fortunately it is probably a rare situation to hit the VIA key twice.
        states = KONtx.mediaplayer.constants.states;
        if ( $contains( KONtx.mediaplayer.tvapi.currentPlayerState, [states.PLAY, states.PAUSE, states.FORWARD, states.REWIND, states.BUFFERING] ) ) {
            KONtx.application.loadView( 'view-Player', {}, true);
            return;
        }

    },
    
    unselectView: function() {
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

            switch (event.newState) {
                case Config.STATE_READY:
                    this.controls.networkError.hide();
                    break;

                case Config.STATE_ERR:

                case Config.STATE_TIMEOUT:

                default:
                    this.controls.networkError.show();
                    break;
            }
    },

    
    _applicationDispatcher: function(event) {
        var map, keyCode, payload, mediaInfo, mediaIndex;

        payload = event.payload;

        switch(event.type) {
            case 'onWidgetKeyPress':
                map = KONtx.utility.KeyHandler.map;
                keyCode = payload.keyCode;

                //TODO: Use switch statement here
                if ( payload.eventPhase == 3 && Array.contains(keyCode, [map.STOP, map.PAUSE] ) ) {
                    event.preventDefault();
                }                                                              //  Blue Key
                else if ( payload.eventPhase == 3 && (keyCode === map.PLAY || keyCode === 406 ) ) {
                    event.preventDefault();
                    if (this._focusedGrid.config.ClassName === 'mediaGrid') {
                        this.persist.selectedMedia = this._focusedGrid.getCellDataIndex(this._focusedGrid.getFocusIndex());
                        mediaIndex = this._focusedGrid.getDataItem( this.persist.selectedMedia ).index;
                        mediaInfo = this.persist.mediaInfo[mediaIndex];
                        if ( $contains(mediaInfo.type, Config.VIDEOMEDIATYPES)) {
                            if (keyCode === 406) {
                                Utility.skipAuto = true;
                            }
                            PlexService.getMediaMetadata({
                                mediaKey: mediaInfo.key,
                                callback: (Utility.prePlayMovie).bindTo(Utility),
                                checkFiles: true,
                                makeCurrentMedia: true
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
                        this._focusedGrid.shift('left', {focus: { row: 0, column: this._focusedGrid.getCellCount() - 1 }});
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
