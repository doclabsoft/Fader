/**
 * Base flickSlider component
 * @project UI flickSliders.
 * @author Anton Parkhomenko
 * @version 1.0
 */
goog.provide('DD.ui.flickSliders.FlickSlider');

goog.require('DD.ui.flickSliders');
goog.require('DD.ui.flickSliders.renderer.FlickSlider');
// goog.require('DD.ui.flickSliders.renderer.PanMenu');
// goog.require('DD.ui.flickSliders.renderer.Fader');
goog.require('DD.ui.flickSliders.Slide');
goog.require('DD.ui.List');
goog.require('goog.ui.registry');

/**
 * @constructor
 * @extends DD.ui.List
 * Абстрактный класс стандартной галереи
 * @param {Object=} [params] Список надстроек компонента
 */
DD.ui.flickSliders.FlickSlider = function(params)
{
    DD.ui.List.call(this);
    var defaults =
    {
        /** Временной порог */
        threshold : 50
    };

    /**
     * Объект, хранящий список надстроек компонента
     * @type {Object}
     * @private
     */
    this.params_ = this.assignParams(params, defaults);
};
goog.inherits(DD.ui.flickSliders.FlickSlider, DD.ui.List);
goog.ui.registry.setDefaultRenderer(DD.ui.flickSliders.FlickSlider, DD.ui.flickSliders.renderer.FlickSlider);

goog.scope(function()
{
    /** @alias DD.ui.flickSliders.FlickSlider.prototype */
    var prototype = DD.ui.flickSliders.FlickSlider.prototype;
    var superClass_ = DD.ui.flickSliders.FlickSlider.superClass_;

    /**
     * Добавление нового слайда в галерею
     * @param  {DD.ui.Component}    slideClass DD.ui.flickSliders. Является рендерером слайда. Если не указан, то используется рендерер по-умолчанию
     * @param  {Array}              options    Набор параметров
     * @return {DD.ui.flickSliders.Slide}
     */
    prototype.append = function (slideClass, options)
    {
        options = options || {};

        !slideClass && (slideClass = DD.ui.flickSliders.Slide);
        var slide = new slideClass(this)
        
        this.add(slide);

        options.caption && slide.setCaption(options.caption);
        options.action && slide.setAction(options.action);

        this.dispatchEvent({type: DD.ui.flickSliders.EventType.INSERT});
        
        return slide;
    };

    /**
     * Возвращение объекта текущего выбранного слайда
     * @return {DD.ui.flickSliders.Slide}
     */
    prototype.getCurrentSlide = function ()
    {
        for (var i = 0, count = this.getChildCount(); i < count; i++)
        {
            var slide = this.getChildAt(i);
            if (slide.isSelected())
                return slide;
        };
    };

    /**
     * Возвращение индекса текущего выбранного слайда
     * @return {Number}
     */
    prototype.getCurrentIndex = function ()
    {
        var slide = this.getCurrentSlide();
        if (slide)
            return this.getIndexOf(slide);
    };

    /**
     * Добавление нового слайда в начало галереи
     * @return {DD.ui.flickSliders.Slide}
     */
    prototype.prepend = function ()
    {
        var slide = new DD.ui.flickSliders.Slide();
        this.add(slide, 0);
        this.dispatchEvent({type: DD.ui.flickSliders.EventType.INSERT});
        return slide;
    };

    /**
     * Добавление слайда в определенное место галереи, обозначающееся индексом
     * @param  {Number} index Индекс места, куда необходимо вставить новый слайд
     * @return {DD.ui.flickSliders.Slide}
     */
    prototype.insert = function (index)
    {
        if (!goog.isNumber(index))
            index = 0;
        var slide = new DD.ui.flickSliders.Slide();
        this.add(slide, index);
        this.dispatchEvent({type: DD.ui.flickSliders.EventType.INSERT});
        return slide;
    };

    /**
     * Удаление слайда из галереи
     * @param  {DD.ui.flickSliders.Slide} slide Объект слайда, который нужно удалить
     */
    prototype.remove = function (slide)
    {
        if (slide && (slide instanceof DD.ui.flickSliders.Slide))
        {
            var index = this.getIndexOf(slide);
            superClass_.remove.call(this, slide);
            this.dispatchEvent({type: DD.ui.flickSliders.EventType.REMOVE, slide: slide, index: index});
        };
    };

    /**
     * Удаление слайда из галереи по индексу
     * @param  {DD.ui.flickSliders.Slide} slide Объект слайда, который нужно удалить
     */
    prototype.removeByIndex = function (index)
    {
        if (!goog.isNumber(index) || index < 0 || index > this.getCount())
            throw new Error(DD.ui.flickSliders.Errors.WRONGINDEXSLIDE);

        this.remove(this.getByIndex(index));
    };

    /**
     * Выбор слайда по индексу
     * @param  {Number} index Индекс, по которому будет выбран слайд
     */
    prototype.select = function(index)
    {
        if (!goog.isNumber(index) || index < 0 || index > this.getCount())
            throw new Error(DD.ui.flickSliders.Errors.WRONGINDEXSLIDE);

        var last = this.getCurrentSlide();
        last && last.setSelected(false);

        var slide = this.getChildAt(index);
        slide && slide.setSelected(true);
    };

    /**
     * Выбор активного слайда. Не ясно пока зачем этот метод
     * @param {Index} index Индекс, по которому будет выбран слайд
     */
    prototype.setActiveSlide = function(index)
    {
        if (!goog.isNumber(index) || index < 0 || index > this.getCount())
            throw new Error(DD.ui.flickSliders.Errors.WRONGINDEXSLIDE);

        this.renderer_.setActiveSlide(this, index);
    };

    /**
     * Возвращение количества слайдов в гелерее
     * @return {Index}
     */
    prototype.getSlidesCount = function()
    {
        return this.getCount();
    };

    /**
     * Назначение временного порога
     * @param {Number} value
     */
    prototype.setThreshold = function(value)
    {
        this.threshold_ = value;
    };

    /**
     * Возвращение временного порога
     * @return {Number}
     */
    prototype.getThreshold = function()
    {
        return this.threshold_;
    };

    /**
     * Совмещение параметров по-умолчанию в параметрами, указанными в момент инициализации компонента
     * @param  {Object} params   Список параметров, указанных в момент инициализации компонента
     * @param  {Object} defaults Список парамметров по-умолчанию
     * @return {Object}
     */
    prototype.assignParams = function(params, defaults)
    {
        for (var prop in defaults)
        {
            if (prop in params && typeof params[prop] === 'object')
            {
                for (var subProp in defaults[prop])
                    if (!(subProp in params[prop]))
                        params[prop][subProp] = defaults[prop][subProp];
            }
            else if (!(prop in params))
                params[prop] = defaults[prop];
        };

        return params;
    };

    /**
     * Возвращение параметров компонента
     * @param  {String} prop Значение параметрами
     * @return {Object}
     */
    prototype.getParams = function (prop)
    {
        if (prop && prop in this.params_)
            return this.params_[prop];
        else
            return this.params_;
    };

    /**
     * Уничтожение компоента
     */
    prototype.destroy = function ()
    {
        this.renderer_.clearDomLinks(this);
        this.dispose();
    };
}); // goog.scoope