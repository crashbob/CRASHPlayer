//Need to override a few bits of this internal class to fix the progress bar for how we have to start
//media that is already in progress
//We have to add an offset to the progress to account for starting at an offset.
var MetadataDisplay = new KONtx.Class({
    ClassName: 'LibraryMetadataDisplay',

    Extends: KONtx.control.MetadataDisplay,
    
    _base: 'libraryMetadata',

    content: {},
    
    _createContent: function () {
        var content;
        
        content = this.content;


        content.backdropImage = new KONtx.element.Image({
            guid: this._base + 'backdropImage',
            id: this._base + 'backdropImage',
//            loadingSrc: 'Assets/960x540/SectionLoading.png',
            missingSrc: 'Assets/960x540/empty.png',
            styles: {
//                width:  this.width,
                vOffset: 5,
                hAlign: 'center',
                opacity: 1,
                fillmode: 'tile'
            }
        }).appendTo(this);

        content.bottomBorder = new KONtx.element.Container({
            guid: this._base + 'bottomBorder',
            id: this._base + 'bottomBorder',
            styles: {
                width: this.width,
                height: 5,
                vOffset: this.height - 5,
                hAlign: 'center',
                backgroundColor: '#111111',
                opacity: 1
            }
        }).appendTo(this);
        
        content.detailBackground = new KONtx.element.Container({
            guid: this._base + 'detailBackground',
            id: this._base + 'detailBackground',
            styles: {
                width: this.width,
                height: this.height,
                vAlign: 'center',
                hAlign: 'center',
                backgroundColor: '#111111',
                opacity: 0.9
            }
        }).appendTo(this);


        content.title = new KONtx.element.Text({
            styles: this.config.titleStyles || this._titleStyles
        }).appendTo(this);
        
        content.mediaDuration = new KONtx.element.Text({
            guid: 'ctrls.mediaDuration',
            id: 'ctrls.mediaDuration',
            styles: this.config.mediaDurationStyles || this._mediaDurationStyles
        }).appendTo(this);

        
        content.seasonEpisode = new KONtx.element.Text({
            styles: this.config.seasonEpisodeStyles || this._seasonEpisodeStyles(content)
        }).appendTo(this);

        
        content.summary = new KONtx.element.Text({
            truncation: 'end',
            wrap: true,
            styles: this.config.summaryStyles || this._summaryStyles(content)
        }).appendTo(this);
        
        content.contentRating = new KONtx.element.Image({
            guid: this._base + 'contentRating',
            id: this._base + 'contentRating',
//            loadingSrc: 'Assets/960x540/SmallLoading.png',
            missingSrc: 'Assets/960x540/empty.png',
            styles: this.config.contentRatingStyles || this._contentRatingStyles(content)
        }).appendTo(this);
        
        content.videoResolution = new KONtx.element.Image({
            guid: this._base + 'videoResolution',
            id: this._base + 'videoResolution',
//            loadingSrc: 'Assets/960x540/SmallLoading.png',
            missingSrc: 'Assets/960x540/empty.png',
            styles: this.config.videoResolutionStyles || this._videoResolutionStyles
        }).appendTo(this);

        content.videoCodec = new KONtx.element.Image({
            guid: this._base + 'videoCodec',
            id: this._base + 'videoCodec',
//            loadingSrc: 'Assets/960x540/SmallLoading.png',
            missingSrc: 'Assets/960x540/empty.png',
            styles: this.config.videoCodecStyles || this._videoCodecStyles
        }).appendTo(this);

        content.videoFramerate = new KONtx.element.Image({
            guid: this._base + 'videoFramerate',
            id: this._base + 'videoFramerate',
//            loadingSrc: 'Assets/960x540/SmallLoading.png',
            missingSrc: 'Assets/960x540/empty.png',
            styles: this.config.videoFramerateStyles || this._videoFramerateStyles
        }).appendTo(this);

        content.audioCodec = new KONtx.element.Image({
            guid: this._base + 'audioFramerate',
            id: this._base + 'audioFramerate',
//            loadingSrc: 'Assets/960x540/SmallLoading.png',
            missingSrc: 'Assets/960x540/empty.png',
            styles: this.config.audioCodecStyles || this._audioCodecStyles
        }).appendTo(this);

        content.audioChannels = new KONtx.element.Image({
            guid: this._base + 'audioChannels',
            id: this._base + 'audioChannels',
//            loadingSrc: 'Assets/960x540/SmallLoading.png',
            missingSrc: 'Assets/960x540/empty.png',
            styles: this.config.audioChannelsStyles || this._audioChannelsStyles
        }).appendTo(this);

//studio
//year
//rating
//viewOffset
//viewCount
//lastViewed

    },
    
    reset: function() {
        this.setTitle(null);
        this.setSummary(null);
        this.setSeasonEpisode(null);
        this.setMediaDuration(null);
        this.setContentRating(null);
        this.setVideoResolution(null);
        this.setVideoCodec(null);
        this.setVideoFramerate(null);
        this.setAudioCodec(null);
        this.setAudioChannels(null);
        this.setBGImage(null);
    },
    
    setTitle: function(title) {
        if (title !== this.content.title.data) {
            this.content.title.data = title || '';
        }
    },
    
    setSummary: function(summary) {
        if (summary !== this.content.summary.data){
            this.content.summary.data = summary || '';
        }
    },
    
    setMediaDuration: function(mediaDurationText) {
        if (mediaDurationText !== this.content.mediaDuration.data) {
            this.content.mediaDuration.data = mediaDurationText || '';
        }
    },

    setSeasonEpisode: function(seasonEpisodeText) {
        if (seasonEpisodeText !== this.content.seasonEpisode.data) {
            this.content.seasonEpisode.data = seasonEpisodeText || '';
        }
    },
    
    setContentRating: function(contentRatingURL) {
        if (contentRatingURL !== this.content.contentRating.src ) {
            this.content.contentRating.src = contentRatingURL || '';
        }
    },

    setVideoResolution: function(videoResolutionURL) {
        if (videoResolutionURL !== this.content.videoResolution.src) {
            this.content.videoResolution.src = videoResolutionURL || '';
        }
    },

    setVideoCodec: function(videoCodecURL) {
        if (videoCodecURL !== this.content.videoCodec.src) {
            this.content.videoCodec.src = videoCodecURL || '';
        }
    },

    setVideoFramerate: function(videoFramerateURL) {
        if (videoFramerateURL !== this.content.videoFramerate.src) {
            this.content.videoFramerate.src = videoFramerateURL || '';
        }
    },

    setAudioCodec: function(audioCodecURL) {
        if (audioCodecURL !== this.content.audioCodec.src) {
            this.content.audioCodec.src = audioCodecURL || '';
        }
    },

    setAudioChannels: function(audioChannelsURL) {
        if (audioChannelsURL !== this.content.audioChannels.src) {
            this.content.audioChannels.src = audioChannelsURL || '';
        }
    },
    
    setBGImage: function(imageURL) {
        if (imageURL !== this.content.backdropImage.src) {
            this.content.backdropImage.src = imageURL || '';
        }
    },
    

    _titleStyles: {
        fontSize: 22,
        fontFamily:'Helvetica',
        fontWeight: 'Bold',
        opacity: 0.8,
        color: 'white',
        hAlign: 'left',
        vOffset: 5,
        hOffset: 20,
        width: 750,
    },

    _mediaDurationStyles: {
        fontSize: 14,
        fontFamily:'Helvetica',
        fontWeight: 'Bold',
        opacity: 0.8,
        color: 'white',
        hAlign: 'left',
        vOffset: 30,
        hOffset: 20,
        width: 300
    },

    _seasonEpisodeStyles: function(content) {
        return {
            fontSize: 14,
            fontFamily:'Helvetica',
            fontWeight: 'Bold',
            opacity: 0.8,
            color: 'white',
            hAlign: 'right',
            vOffset: 30,
    //        hOffset: 905,
            hOffset: content.detailBackground.width - 65,
            width: 200,
            textAlign: 'right'
        };
    },

    _summaryStyles: function(content) {
        return {
            fontSize: 16,
            fontFamily:'Helvetica',
            fontWeight: 'normal',
            opacity: 0.8,
            color: 'white',
            hAlign: 'left',
            vOffset: 50,
            hOffset: 20,
            width: content.detailBackground.width - 40,
            height: 75
        };
    },

    _contentRatingStyles: function(content) {
        return {
            vOffset: 10,
            hOffset: content.detailBackground.width - 10,
            hAlign: 'right',
            opacity: 1
        };
    },

    _videoResolutionStyles: {
        vOffset: 130,
        hOffset: 10,
        opacity: 1
    },

    _videoCodecStyles: {
        vOffset: 130,
        hOffset: 65,
        opacity: 1
    },

    _videoFramerateStyles: {
        vOffset: 130,
        hOffset: 120,
        opacity: 1
    },

    _audioCodecStyles: {
        vOffset: 130,
        hOffset: 175,
        opacity: 1
    },

    _audioChannelsStyles: {
        vOffset: 130,
        hOffset: 230,
        opacity: 1
    },
            
    _onSourceUpdated: function (event) {
            switch (event.type) {
            case 'onStateUpdated':
                //Do this in a timer so that we only refresh this after a pause. 
                if (this.timer && this.timer.ticking) {
                    KONtx.utility.timer.clearTimeout(this.timer);
                }
                this.timer = KONtx.utility.timer.setTimeout( (function() {
                    return this._updateContent(event.payload);
                }).bindTo(this), 500);
                break;
            case 'onFocus':
                this.fire('onFocus');
                this.reset();
                this.show();
                break;
            case 'onBlur':
                if (this.timer && this.timer.ticking) {
                    KONtx.utility.timer.clearTimeout(this.timer);
                }

                this.fire('onBlur');
                this.hide();
                break;
            }
    }
    
});
    