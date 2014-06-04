
var SnippetView = new KONtx.Class({
    ClassName: 'SnippetView',
    
    Extends: KONtx.system.AnchorSnippetView,
        
    initView: function() {
        Logger.debug('Init Snippet View');

    },

    _onPlexServiceStateChange: function(event) {

        switch (event.newState) {

        case Config.STATE_READY:
            this.controls.networkError.hide();
            break;
        case Config.STATE_ERR:
            this.controls.networkError.show();
            break;
        case Config.STATE_TIMEOUT:
            this.controls.networkError.show();            
            break;
        default:

            break;
        }
    
    },

    hideView: function() {
        Logger.debug('onHideView');
        
        PlexService.removeStateChangeListener( this.ClassName );
    },
    
    selectView: function() {
        PlexService.addStateChangeListener( (this._onPlexServiceStateChange).bindTo(this), this.ClassName );
    },
    
    unselectView: function() {
        PlexService.removeStateChangeListener( this.ClassName );
    },

    createView: function() {



        this.controls.dockImage = new KONtx.element.Image({
            styles: {
                src: 'Assets/960x540/crashlogo-85.png',
                    hOffset: 150,
                    vOffset: 5
            }
        }).appendTo(this);

        this.controls.dockText = new KONtx.element.Image({
            styles: {
                src: 'Assets/960x540/logoText.png',
                    hOffset: 12,
                    vOffset: 21
            }
        }).appendTo(this);
        
        this.controls.networkError = new KONtx.element.Image({
            styles: {
                visible: false,
                src: 'Assets/960x540/snippetError.png',
                hOffset: 178,
                vOffset: 34
            }
        }).appendTo(this);

    },


    updateView: function() {
        PlexService.addStateChangeListener( (this._onPlexServiceStateChange).bindTo(this), this.ClassName );

        Logger.debug( 'STATE: ' + PlexService.state );
        if ( PlexService.state !== Config.STATE_READY && PlexService.state !== Config.STATE_INIT ) {
            this.controls.networkError.show();
        }
        else {
            this.controls.networkError.hide();
        }
    }

});
