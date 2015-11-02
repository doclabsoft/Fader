/**
 * @overview Flickslider class.
 * @project UI flicksliders.
 * @author Anton Parkhomenko
 * @version 1.0
 */
goog.provide('DD.ui.flickSliders.Fader');

goog.require('DD.ui.flickSliders.FlickSlider');
goog.require('DD.ui.flickSliders.renderer.Fader');
goog.require('goog.ui.registry');

/**
 * @constructor
 * @param {Object=} [params] Список входящих параметров
 * @this DD.ui.flickSliders.Fader
 * @extends DD.ui.flickSliders.FlickSlider
 * @author Антон Пархоменко
 */
DD.ui.flickSliders.Fader = function(params)
{
    DD.ui.flickSliders.FlickSlider.call(this, params);
    var defaults = 
    {
        /** Определяет с какого слайда будет показан компонент */
        initialSlideIndex   : 0,
        /** Диапазон смены слайдов в px */
        range               : 30,
        /** Процентное соотношение смены слайда, по истечении которого будет произведена смена слайда */
        changeIndexRange    : 50,
        /** Область воздействия на компонент, передается DOM-элемент */
        actionTarget        : null,
        /** Зацикленность компонента */
        loop                : false,
        /** Эффект смены слайдов */
        effect              : DD.ui.flickSliders.Fader.Effects.NORMAL,
        /** Инверсинная смена соайдов */
        inverse             : false
    };
    params = params || {};

    /**
     * Объект, хранящий список надстроек компонента
     * @type {Object}
     * @private
     */
    this.params_ = this.assignParams(params, defaults);
};
goog.inherits(DD.ui.flickSliders.Fader, DD.ui.flickSliders.FlickSlider);
goog.ui.registry.setDefaultRenderer(DD.ui.flickSliders.Fader, DD.ui.flickSliders.renderer.Fader);

/**
 * Эффект смены слайдов
 * @enum {STRING}
 */
DD.ui.flickSliders.Fader.Effects =
{
    NORMAL      : 'normal',
    LONESOME    : 'lonesome'
};

goog.scope(function()
{
    /** @alias DD.ui.flickSliders.Fader.prototype */
    var prototype = DD.ui.flickSliders.Fader.prototype;
    var superClass_ = DD.ui.flickSliders.Fader.superClass_;

    /**
    * @inheritdoc
    */
    prototype.append = function(options)
    {
        return superClass_.append.call(this, null, options);
    };

    prototype.getActionTarget = function()
    {
    	return this.actionTarget_;
    };

    prototype.setActionTarget = function(value)
    {
    	this.actionTarget_ = value;
    };

    prototype.getRange = function()
    {
    	return this.range_;
    };

    prototype.setRange = function(value)
    {
    	this.range_ = value;
    };

    prototype.setPosition = function(value)
    {
        this.renderer_.setPosition(this, value);
    };

	prototype.getVelocity = function(deltaTime, x, y)
	{
	    return {
	        x: x / deltaTime || 0,
	        y: y / deltaTime || 0
	    };
	};

	prototype.resudialMove = function(element, value, velocity)
	{
		this.renderer_.resudialMove(this, element, value, velocity);
	};

    prototype.select = function(index, fade)
    {
        superClass_.select.call(this, index);
        this.renderer_.select(this, index, fade);
    };

}); // goog.scoope