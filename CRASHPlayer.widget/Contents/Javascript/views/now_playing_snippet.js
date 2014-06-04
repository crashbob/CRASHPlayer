
var NowPlayingSnippetView = new KONtx.Class({
	ClassName: 'NowPlayingSnippetView',
	
	Extends: KONtx.system.ProfileSnippetView,
	
	initView: function() {
		this._handleActivateSnippet.subscribeTo(this, [ 'onActivateSnippet' ], this);
	},

	_base: 'nowPlaying.',
	
	_handleActivateSnippet: function(event) {
            this.controls.text.data = $_( 'now_playing_generic' );
            event.preventDefault();
            event.stopPropagation();
            KONtx.application.setHostResultToViewId(event, 'view-Player');
	},
	
	createView: function() {
            this.controls.text = new KONtx.element.Text({                
                guid: this._base + 'ctrls.text',
                label: $_( 'now_playing_generic' ),
                wrap: true,
                truncation: 'end',
                styles: {
                    color: '#ffffff',
                    fontSize: KONtx.utility.scale(13),
                    width: this.width,
                    textAlign: 'center',
                    vAlign: 'center',
                    hAlign: 'center'
                }
            }).appendTo(this);
	},
        
        selectView: function() {
            var media;

            media = PlexService.getCurrentMediaVideoTag();

            this.controls.text.data = $_('now_playing', ( media.grandparentTitle ? media.grandparentTitle + ': ' + media.title : media.title ) );

        }
});
