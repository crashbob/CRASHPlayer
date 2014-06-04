var SidebarWelcome = new KONtx.Class({
    ClassName: 'SidebarWelcome',
    
    Extends: KONtx.system.SidebarView,

    initView: function() {
        Logger.debug('Init Welcome View');
        
    },
    
    _base: 'welcome.',
    _staleData: false,

    
    createView: function() {
        var ctrls, sidebarWidth, sidebarHeight, emptySpace;

        ctrls = this.controls;
        sidebarWidth = Theme.keys.sidebar.width;
        sidebarHeight = Theme.keys.sidebar.height;

        emptySpace = new KONtx.control.EmptySpace({
            styles: {
                height: sidebarHeight,
                vOffset: 0,
                width: sidebarWidth
            }
        }).appendTo(this);

        ctrls.logo = new KONtx.element.Image({
            styles: {
                src: 'Assets/960x540/logoLarge.png',
                hAlign: 'center',
                vOffset: 10
            }
        }).appendTo(this);
        

        ctrls.buttonBackground = new KONtx.element.Container({
            guid: this._base + 'ctrls.background',
            id: this._base + 'ctrls.background',
            styles: {  
                width: sidebarWidth * 0.8,
                height: KONtx.utility.scale(35),
                vAlign: 'bottom',
                hAlign: 'center',
                backgroundColor: '#111111',
                opacity: 1
            }
        }).appendTo(this);

        ctrls.loadButton = new KONtx.control.TextButton({
            label: $_('load_button', $_('app_title') ),
            guid: this._base + 'loadButton',
            focus: true,
            events: {
                onSelect: function() {
                    KONtx.application.loadView( 'view-Settings', {}, true );
                }
            },
            styles: {
                width: sidebarWidth * 0.8,
                height: KONtx.utility.scale(35),
                vAlign: 'bottom',
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

        ctrls.textContainer = new KONtx.element.Container({
            guid: this._base + 'ctrls.background',
            id: this._base + 'ctrls.background',
            styles: {  
                width: sidebarWidth -20,
                vOffset: ctrls.logo.outerHeight,
                hAlign: 'center',
//                backgroundColor: '#111111',
                opacity: 1
            }
        }).appendTo(this);

        ctrls.textWelcome = new KONtx.element.Text({
            label: $_('welcome_to', $_('app_title')),
            styles: {
                hAlign: 'center',
                vOffset: 0,
                fontSize: 16,
                fontFamily:'Helvetica',
                fontWeight: 'Bold',
                opacity: 1,
                color: 'white'
            }
        }).appendTo(ctrls.textContainer);

        ctrls.textTerms = new KONtx.element.Text({
            label: $_('intro_terms', $_('app_title'), Config.TERMSLINK),
            truncation: 'end',
            wrap: 'true',
            styles: {
                width: ctrls.textContainer.width,
                hAlign: 'left',
                vOffset: ctrls.textWelcome.outerHeight + 15,
                fontSize: 14,
                fontFamily:'Helvetica',
//                fontWeight: 'Bold',
                opacity: 1,
                color: 'white'
            }
        }).appendTo(ctrls.textContainer);

        ctrls.textTerms = new KONtx.element.Text({
            label: $_('intro_not_plex', $_('app_title'), Config.SUPPORTEMAIL),
            truncation: 'end',
            wrap: 'true',
            styles: {
                width: ctrls.textContainer.width,
                height: this.height - ctrls.logo.outerHeight - ctrls.buttonBackground.height,
                hAlign: 'left',
                vOffset: ctrls.textTerms.outerHeight + 15,
                fontSize: 14,
                fontFamily:'Helvetica',
//                fontWeight: 'Bold',
                opacity: 1,
                color: 'white'
            }
        }).appendTo(ctrls.textContainer);
    },



    focusView: function() {
        Logger.debug('Setting Focus');
        var timer1;
        
        timer1 = KONtx.utility.timer.setTimeout( (function(){
            KONtx.utility.timer.clearTimeout(timer1);

            this.controls.loadButton.focus();
        }).bindTo(this), 1);
    },

    
    updateView: function() {
        Logger.debug( 'Loading Sidebar' );

        Config.set('ranOnce', true);
        
        this._registerHandlers();
        
    },


    hideView: function() {

        this._unregisterHandlers();
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

                    if ( event.payload.eventPhase == 3 && Array.contains(event.payload.keyCode, [map.STOP, map.PAUSE, map.REWIND, map.FORWARD, map.PLAY] ) ) {
                        event.preventDefault();
                    }
                    break;
        }
    }
});
