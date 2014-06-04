
include('Framework/kontx/1.5/src/all.js');

include('Javascript/core/Logger.js');
include('Javascript/core/Config.js');
include('Javascript/core/Utility.js');
include('Javascript/core/event_handlers.js');
include('Javascript/core/mediaoverlay.js');
include('Javascript/core/metadatadisplay.js');
include('Javascript/core/PlexService.js');


include('Javascript/views/sidebarWelcome.js');
include('Javascript/views/snippet.js');
include('Javascript/views/now_playing_snippet.js');
include('Javascript/views/settings.js');
include('Javascript/views/playerSettings.js');
include('Javascript/views/sidebar.js');
include('Javascript/views/player.js');
include('Javascript/views/library.js');
include('Javascript/views/mediaItem.js');
include('Javascript/views/shows.js');

KONtx.application.init({
	views: [
		{ id: 'view-Main', viewClass: SidebarView },
        { id: 'view-Welcome', viewClass: SidebarWelcome },
		{ id: 'view-Player', viewClass: PlayerView },
		{ id: 'view-Settings', viewClass: SettingsView },
        { id: 'view-PlayerSettings', viewClass: PlayerSettingsView },
		{ id: 'view-About', viewClass: KONtx.views.AboutBox },
		{ id: 'snippet-main', viewClass: SnippetView },
		{ id: 'view-Library', viewClass: LibraryView },
		{ id: 'view-MediaItem', viewClass: MediaItemView },
		{ id: 'view-Show', viewClass: ShowView }

	],
	defaultViewId: 'view-Main',
	settingsViewId: 'view-Settings'
});

//Custom control.SelectButton override to fix a framework bug affecting Sony devices
var customControls = {
    //
    SelectButton: new KONtx.Class({
        Extends: KONtx.control.SelectButton,
        initialize: function () {
            this.parent();
            this.config.optionViewClass = customControls.OptionSelectView;
        }
    }),
    //
    OptionSelectView: new KONtx.Class( {
        Extends: KONtx.system.OptionSelectView,
        registerHandlers: function () {
            if (!this._buttonHandler) {
                this.handlers = {
                    cancel: this.cancelOption.bindTo(this)
                };
                this._buttonHandler = this.handlers.cancel.subscribeTo(KONtx.application, ["onActivateBackButton", "onActivateSettingsButton", "onActivateHomeButton"], this);
            }
        },
        unregisterHandlers: function () {
            if (this._buttonHandler) {
                this._buttonHandler.unsubscribeFrom(KONtx.application, ["onActivateBackButton", "onActivateSettingsButton", "onActivateHomeButton"], this);
                this._buttonHandler = false;
                this.handlers = null;
            }
        },
    })
}


EventHandlers.onApplicationStartup.subscribeTo(KONtx.application, [ 'onApplicationStartup' ], EventHandlers);
EventHandlers.onNetworkHideDialog.subscribeTo(KONtx.application, [ 'onNetworkHideDialog' ], EventHandlers);

//EventHandlers.onNetworkConnectionStillDisconnected.subscribeTo(KONtx.application, [ 'onNetworkConnectionDisconnect', 'onNetworkConnectionStillDisconnected' ], EventHandlers);
EventHandlers.handlerPlayerEvent.subscribeTo(KONtx.mediaplayer, [ 'onStateChange', 'onTimeIndexChanged', 'onStartStreamPlayback' ], EventHandlers);
EventHandlers.handleHostEvent.subscribeTo( KONtx.application, [ 'onActivateSnippet' ], EventHandlers );

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(prefix) {
        return this.indexOf(prefix) === 0;
    };
}

//The original BaseGLossHighlight image is not long enough for FullScreen mode if there are only a couple buttons.
//So we'll use our own. 
if ( Theme.clone && Theme.clone.call ) {
    var BaseGlossHighlight = Theme.clone(Theme.storage.get('BaseGlossHighlight'));
    BaseGlossHighlight.imgSrc = 'Assets/960x540/glossHighlight.png';
    Theme.storage.add('BaseGlossHighlight', BaseGlossHighlight);
    delete BaseGlossHighlight;
}

var CRASHPlayer = {};

//Backward compatibility with old frameworks
CRASHPlayer.network = (function () {
    var setDownByUser = false;
    return {
        setNetworkRequestFailed: function (status, refetch) {
            KONtx.application.setNetworkRequestFailed(status, refetch);
            setDownByUser = status;
        },
        isPhysicalNetworkDown: function () {
            if (KONtx.application.getNetworkDownStatus) {
                return !setDownByUser;
            }
            return false;
        }
    };
}());


if (KONtx.application.isPhysicalNetworkDown === undefined) {
    KONtx.application.isPhysicalNetworkDown = function () {   
        return CRASHPlayer.network.isPhysicalNetworkDown;
    };  
}

