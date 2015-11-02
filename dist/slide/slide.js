/**
* Simple slide.
* @project UI flickSliders.
* @author Anton Parkhomenko
* @version 1.0
*/

goog.provide('DD.ui.flickSliders.Slide');

goog.require('DD.ui.flickSliders.renderer.Slide');
goog.require('DD.ui.Component');
goog.require('goog.ui.registry');

/**
 * @constructor
 * @extends DD.ui.Component
 */
DD.ui.flickSliders.Slide = function(options, type)
{
    DD.ui.Component.call(this);

    if (!goog.isObject(options))
    {
        var tempOptions = {};
        if (goog.isString(arguments[0]))
            tempOptions.caption = arguments[0];
        if (goog.isFunction(arguments[1]))
            tempOptions.click = arguments[1];
        options = tempOptions;
    };
    options.type = type;

    switch (type)
    {
        case DD.ui.flickSliders.Types.PANMENU:
            this.setRenderer(new DD.ui.flickSliders.PanMenu.renderer.Slide);
            break;
    };

    this.setModel(options);

    this.caption_ = '';
};
goog.inherits(DD.ui.flickSliders.Slide, DD.ui.Component);
goog.ui.registry.setDefaultRenderer(DD.ui.flickSliders.Slide, DD.ui.flickSliders.renderer.Slide);


// ------------------------------
// Prototype
// ------------------------------

goog.scope(function()
{
    /** @alias DD.ui.flickSliders.Slide.prototype */
    var prototype = DD.ui.flickSliders.Slide.prototype;
    var superClass_ = DD.ui.flickSliders.Slide.superClass_;

    prototype.setCaption = function(value)
    {
        this.caption_ = value;
        this.renderer_.setCaption(this, value);
    };

    prototype.setAction = function(value)
    {
        this.action_ = value;
    };
    
    prototype.getAction = function()
    {
        return this.action_;
    };

    prototype.applyActionOnSlide = function()
    {
        if (this.action_)
        {
            var parent = this.getParent();
            this.action_.apply(this);
            this.dispatchEvent({type: DD.ui.flickSliders.EventType.SLIDEACTION, action: this.action_});
        };
    };
}); // goog.scope
