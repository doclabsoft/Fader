/**
* Flickslider renderer.
* @project UI flicksliders.
* @author Anton Parkhomenko
* @version 1.0
*/
goog.provide('DD.ui.flickSliders.renderer.Fader');

goog.require('DD.ui.flickSliders.renderer');
goog.require('DD.ui.renderer.Component');
goog.require('goog.dom.classes');

/**
 * Галерея с собственным эффектом плавного перехода от одного слайда к другому. Слайды располагаются друг под другом.
 * @constructor
 * @extends DD.ui.renderer.Component
 */
DD.ui.flickSliders.renderer.Fader = function()
{
    DD.ui.renderer.Component.call(this);
};
goog.inherits(DD.ui.flickSliders.renderer.Fader, DD.ui.renderer.Component);
goog.addSingletonGetter(DD.ui.flickSliders.renderer.Fader);

/**
 * @inheritdoc
 */
DD.ui.flickSliders.renderer.Fader.CSS_CLASS = 'DD--fader';

goog.scope(function()
{

    /** @alias DD.ui.flickSliders.renderer.Fader.prototype */
    var prototype = DD.ui.flickSliders.renderer.Fader.prototype;
    var superClass_ = DD.ui.flickSliders.renderer.Fader.superClass_;

    /**
     * @inheritdoc
     */
    prototype.getCssClass = function()
    {
        return DD.ui.flickSliders.renderer.Fader.CSS_CLASS;
    };

    /**
     * @inheritdoc
     */
    prototype.createDom = function(component)
    {
        var element = superClass_.createDom.call(this, component);
        var wrapper = goog.dom.createDom(goog.dom.TagName.DIV, {class: this.getCssClass() + '--wrapper'});

        goog.dom.classes.add(element, this.getCssClass());
        element.appendChild(wrapper);

        component.$cache('wrapper', wrapper);
        component.setContentElement(wrapper);

        return element;
    };

    prototype.clearDomLinks = function (component){};

    /**
     * @inheritdoc
     */
    prototype.initializeDom = function(component)
    {
        superClass_.initializeDom.call(this, component);

        var params = component.getParams();
        var cache = component.$cache();
        var actionTarget = params.actionTarget || cache.root.parentNode;

        // Инициализация стороннего компонента Hammer
        cache.mc = new Hammer.Manager(actionTarget, {enable: true, touchAction: 'pan-y', domEvents: true});
        cache.mc.add(new Hammer.Pan({threshold: component.threshold}));
        cache.mc.on("panleft panright", this.panActionEvent_.bind(this, component));
        cache.mc.on("panend", this.panendActionEvent_.bind(this, component));

        cache.actionTarget = actionTarget;
        cache.startPoint   = null;
        cache.deltaX       = 0;
        cache.index        = params.initialSlideIndex;
        cache.S            = {current: null, next: null, prev: null};

        component.$cache(cache);
    };

    /**
     * @inheritdoc
     */
    prototype.uninitializeDom = function(component)
    {
        superClass_.uninitializeDom.call(this, component);
        var cache = component.$cache();
        cache.mc.destroy();
    };

    /**
     * Определяет слайд выбранным по индексу
     * @param  {DD.ui.flickSliders.Fader}       component DD.ui.flickSliders.Fader
     * @param  {Number}                         index     Индекс слайда
     * @param  {Boolean}                        fade      Флаг, отвечающий за анимационную смену слайда
     */
    prototype.select = function(component, index, fade)
    {
        var cache = component.$cache();
        cache.index = index;
        cache.length = component.getChildCount() - 1;

        for (var i = 0; i < cache.length; i++)
        {
            if (fade && i == cache.lastIndex)
                continue;
            component.getByIndex(i).getElement().style.opacity = i > index ? 0 : 1;
        };

        if (fade)
            (cache.animate = this.residualFade_(component, index));
        else
        {
            var element = component.getByIndex(index).getElement();
            element && (element.style.opacity = 1);
            component.dispatchEvent({type: DD.ui.flickSliders.EventType.SETTLE, index: cache.index});
            component.dispatchEvent({type: DD.ui.flickSliders.EventType.SELECTED, index: cache.index});
        };
        cache.lastIndex = cache.index;
        cache.lastValue = index;
        component.$cache(cache);
    };

    /**
     * Получение ближайщих слайдов от текущего индекса
     * @param  {DD.ui.flickSliders.Fader}   component Объект рендерера
     * @param  {Number}                     index     Индекс, относительно которого нужно произвести поиск
     * @return {Object}
     * @private
     */
    prototype.getImmediateSlides_ = function(component, index)
    {
        var cache = component.$cache(),
            params = component.getParams();
        var current = component.getByIndex(index),
            nextIndex = params.loop ? index + 1 > cache.length ? 0 : index + 1 : index + 1,
            prevIndex = params.loop ? index - 1 < 0 ? cache.length : index - 1 : index - 1,
            next = component.getByIndex(nextIndex),
            prev = component.getByIndex(prevIndex);
        return {
            current : current ? current.getElement() : null,
            next    : next ? next.getElement() : null,
            prev    : prev ? prev.getElement() : null,
            nextIndex: nextIndex,
            prevIndex: prevIndex
        };
    };

    /**
     * Назначает позицию компонента через переданный параметр, в зависимости от свойств компонента после применения этого метода
     * компонент может остаться на заданном значении, либо перейти к целому индексу слайда
     * @param {DD.ui.flickSliders.Fader}    component Объект рендерера
     * @param {Number|String}               value     Значение положения слайдов компонента
     */
    prototype.setPosition = function(component, value)
    {
        var cache = component.$cache(),
            params = component.getParams(),
            changeIndexRange = params.changeIndexRange / 100,
            decimal = Math.abs(parseInt(value) - value),
            index = parseInt(value) + 1;

        if (!cache.firtsValue)
            cache.firtsValue = +value;

        if (value > cache.firtsValue)
        {
            if (index > cache.length)
            {
                var slide = component.getByIndex(cache.length).getElement();
                slide.style.opacity = 1;
            }
            else
            {
                var slide = component.getByIndex(index).getElement();
                slide.style.opacity = decimal;
            };
        }
        else if (value < cache.firtsValue)
        {
            var slide = component.getByIndex(index).getElement(),
                prev = component.getByIndex(index-1);

            slide.style.opacity = decimal;
            prev && (prev.getElement().style.opacity = 1);

            for (var i = index+1; i <= cache.length; i++)
                component.getByIndex(i).getElement().style.opacity = 0;
        };

        cache.firtsValue = +value;
        cache.lastValue = value;
        cache.lastIndex = cache.index;
        component.$cache();
    };

    /**
     * Определение взаимодействия, движения указателя по области (DOM-объекте) инициализации компонента.
     * @param  {DD.ui.flickSliders.Fader}   component Объект рендерера
     * @param  {Object}                     event     Объект события, переданного через компонент Hammer
     * @private
     */
    prototype.panActionEvent_ = function(component, event)
    {
        if (component.isDisabled())
            return;
        
        var cache = component.$cache(),
            params = component.getParams();

        // Количество слайдов в момент события PanAction
        cache.length = Math.max(component.getChildCount() - 1, 0);

        // cache.animate && (cache.animate = this.stopResidualFade_(component, cache.animate));
        (cache.lastIndex === null) && (cache.lastIndex = cache.index);

        // Стартовая точка касания/нажатия
        !cache.startPoint && (cache.startPoint = event.pointers[0].clientX);

        // Пройденное расстояние указателя по оси Х
        cache.deltaX = event.pointers[0].clientX - cache.startPoint;

        // Процент прозрачность элементов
        cache.percent = Math.abs(cache.deltaX / params.range);

        var value = cache.index + cache.deltaX / params.range;
        // Предотвращение ошибок в случае отсутствия зацикливания галереи
        !params.loop && (cache.index = cache.index > cache.length ? cache.length : cache.index < 0 ? 0 : cache.index);

        cache.S = this.getImmediateSlides_(component, cache.index);

        if (cache.deltaX < 0)
        {
            if (params.inverse)
            {
                if (cache.S.prev)
                {
                    if (params.effect == DD.ui.flickSliders.Fader.Effects.LONESOME)
                    {
                        if (cache.index == 0)
                        {
                            cache.S.prev.style.opacity = cache.percent;
                        }
                        else
                        {
                            cache.S.prev.style.opacity = 1;
                            cache.S.current.style.opacity = 1 - cache.percent;
                        };
                    }
                    else
                    {
                        cache.S.current.style.opacity = 1 - cache.percent;
                        cache.S.prev.style.opacity = cache.percent;
                    }
                };

                if (cache.deltaX < -params.range)
                {
                    if (params.effect != DD.ui.flickSliders.Fader.Effects.LONESOME)
                    {
                        cache.S.prev && (cache.S.currentSlide.style.opacity = 0);
                        cache.S.next && (cache.S.next.style.opacity = 0);
                    };
                    cache.startPoint = event.pointers[0].clientX;
                    cache.index--;
                    if (params.loop && cache.index < 0)
                        cache.index = cache.length;
                };
            }
            else if (!params.inverse)
            {
                if (cache.S.next)
                {
                    if (params.effect == DD.ui.flickSliders.Fader.Effects.LONESOME)
                    {
                        if (cache.index == cache.length)
                        {
                            this.resetOpacity_(component, 0);
                            cache.S.next.style.opacity = 1;
                            cache.S.current.style.opacity = 1 - cache.percent;
                        }
                        else
                        {
                            cache.S.next.style.opacity = cache.percent;
                        }
                    }
                    else
                    {
                        cache.S.current.style.opacity = 1 - cache.percent;
                        cache.S.next.style.opacity = cache.percent;
                    };
                };

                if (cache.deltaX < -params.range)
                {
                    if (params.effect == DD.ui.flickSliders.Fader.Effects.LONESOME)
                    {
                    }
                    else
                    {
                        cache.S.next && (cache.S.current.style.opacity = 0);
                        cache.S.prev && (cache.S.prev.style.opacity = 0);
                    }
                    cache.startPoint = event.pointers[0].clientX;
                    cache.index++;
                    if (params.loop && cache.index > cache.length)
                        cache.index = 0;
                };
            };
        }
        else if (cache.deltaX > 0)
        {
            if (params.inverse)
            {
                if (cache.S.next)
                {
                    if (params.effect == DD.ui.flickSliders.Fader.Effects.LONESOME)
                    {
                        if (cache.index == cache.length)
                        {
                            this.resetOpacity_(component, 0);
                            cache.S.next.style.opacity = 1;
                            cache.S.current.style.opacity = 1 - cache.percent;
                        }
                        else
                        {
                            cache.S.next.style.opacity = cache.percent;
                        }
                    }
                    else
                    {
                        cache.S.current.style.opacity = 1 - cache.percent;
                        cache.S.next.style.opacity = cache.percent;
                    };
                };

                if (cache.deltaX > params.range)
                {
                    if (params.effect == DD.ui.flickSliders.Fader.Effects.LONESOME)
                    {
                    }
                    else
                    {
                        cache.S.next && (cache.S.current.style.opacity = 0);
                        cache.S.prev && (cache.S.prev.style.opacity = 0);
                    }
                    cache.startPoint = event.pointers[0].clientX;
                    cache.index++;
                    if (params.loop && cache.index > cache.length)
                        cache.index = 0;
                };
            }
            else if (!params.inverse)
            {
                if (cache.S.prev)
                {
                    if (params.effect == DD.ui.flickSliders.Fader.Effects.LONESOME)
                    {
                        if (cache.index == 0)
                        {
                            cache.S.prev.style.opacity = cache.percent;
                        }
                        else
                        {
                            cache.S.prev.style.opacity = 1;
                            cache.S.current.style.opacity = 1 - cache.percent;
                        };
                    }
                    else
                    {
                        cache.S.current.style.opacity = 1 - cache.percent;
                        cache.S.prev.style.opacity = cache.percent;
                    }
                };

                if (cache.deltaX > params.range)
                {
                    if (params.effect != DD.ui.flickSliders.Fader.Effects.LONESOME)
                    {
                        cache.S.prev && (cache.S.currentSlide.style.opacity = 0);
                        cache.S.next && (cache.S.next.style.opacity = 0);
                    };
                    cache.startPoint = event.pointers[0].clientX;
                    cache.index--;
                    if (params.loop && cache.index < 0)
                        cache.index = cache.length;
                };
            };
        }
        else if (cache.deltaX == 0)
        {
            if (params.effect != DD.ui.flickSliders.Fader.Effects.LONESOME)
            {
                cache.S.current.style.opacity = 1;
                cache.S.prev && (cache.S.prev.style.opacity = 0);
                cache.S.next && (cache.S.next.style.opacity = 0);
            };
        }; 

        component.$cache(cache);
        component.dispatchEvent({type: DD.ui.flickSliders.EventType.DRAGMOVE, value: value});
    };

    /**
     * Определение прекращения взаимодействия, движения указателя по области (DOM-объекте) инициализации компонента.
     * @param  {DD.ui.flickSliders.Fader}   component Объект рендерера
     * @param  {Object}                     event     Объект события, переданного через компонент Hammer
     * @private
     */
    prototype.panendActionEvent_ = function(component, event)
    {
        if (component.isDisabled())
            return;

        var cache = component.$cache(),
            params = component.getParams(),
            changeIndexRange = params.changeIndexRange / 100;

        if (cache.deltaX > 0)
        {
            if (params.inverse)
            {
                if (cache.S.next && cache.percent > changeIndexRange)
                    cache.index++;
                if (params.loop && cache.index > cache.length)
                    cache.index = 0;
            }
            else if (!params.inverse)
            {
                if (cache.S.prev && cache.percent > changeIndexRange)
                    cache.index--;
                if (params.loop && cache.index < 0)
                    cache.index = cache.length;
            };
        }
        else if (cache.deltaX < 0)
        {
            if (params.inverse)
            {
                if (cache.S.prev && cache.percent > changeIndexRange)
                    cache.index--;
                if (params.loop && cache.index < 0)
                    cache.index = cache.length;
            }
            else if (!params.inverse)
            {
                if (cache.S.next && cache.percent > changeIndexRange)
                    cache.index++;
                if (params.loop && cache.index > cache.length)
                    cache.index = 0;
            };
        };

        cache.animate = this.residualFade_(component, cache.index);
        cache.startPoint = null;

        component.$cache(cache);
        component.dispatchEvent({type: DD.ui.flickSliders.EventType.DRAGEND});
    };

    /**
     * Плавное затухание активного и следующего слайдов
     * @param  {HTMLElement} element Ссылка на существующий DOM-элемент
     * @return {Object}
     * @private
     */
    prototype.residualFade_ = function(component, index)
    {
        var cache = component.$cache(),
            params = component.getParams(),
            fadeDuration = 500,
            lastSelectedSlide = cache.lastIndex != index ? component.getByIndex(cache.lastIndex) : null;

        cache.S = this.getImmediateSlides_(component, cache.index);

        cache.S.current && dynamics.animate(cache.S.current,
        {
            opacity: 1
        },
        {
            type: dynamics.easeOut,
            duration: fadeDuration,
            complete: function()
            {
                (cache.index == cache.length) && resetOpacity_();
            }
        });

        if (lastSelectedSlide)
        {
            lastSelectedSlide.setSelected(false);
            dynamics.animate(lastSelectedSlide.getElement(),
            {
                opacity: cache.lastIndex < cache.index ? 1 : 0
            },
            {
                type: dynamics.easeOut,
                duration: fadeDuration
            });
        };

        if (params.effect != DD.ui.flickSliders.Fader.Effects.LONESOME)
        {
            cache.S.prev && (cache.S.prev != cache.S.current) && dynamics.animate(cache.S.prev,
            {
                opacity: cache.S.prevIndex < cache.index ? 1 : 0
            },
            {
                type: dynamics.easeOut,
                duration: fadeDuration
            });
        };

        if (params.effect == DD.ui.flickSliders.Fader.Effects.NORMAL || (params.effect == DD.ui.flickSliders.Fader.Effects.LONESOME && index != cache.length))
        {
            cache.S.next && (cache.S.next != cache.S.current) && dynamics.animate(cache.S.next,
            {
                opacity: cache.S.nextIndex < cache.index ? 1 : 0
            },
            {
                type: dynamics.easeOut,
                duration: fadeDuration
            });
        };

        // Если текущий индекс равен 0, то самый последний слайд должен быть прозрачным
        // Это нужно в случае зацикливания галереи
        if (params.effect == DD.ui.flickSliders.Fader.Effects.LONESOME && cache.index == 0)
        {
            var slide = component.getByIndex(cache.length).getElement();
            slide && slide != cache.S.current && dynamics.animate(slide,
            {
                opacity: 0
            },
            {
                type: dynamics.easeOut,
                duration: fadeDuration
            });
        }

        function resetOpacity_()
        {
            if (params.effect == DD.ui.flickSliders.Fader.Effects.LONESOME)
            {
                for (var i = 0; i < cache.length; i++)
                {
                    if (i == cache.index)
                        break;
                    component.getByIndex(i).getElement().style.opacity = 1;
                };
            };
        };

        clearTimeout(cache.fadeTimer);

        cache.fadeTimer = setTimeout(function()
        {
            if (cache.lastIndex >= 0)
            {
                var slide = component.getByIndex(cache.lastIndex);
                slide && slide.setSelected(false);
            };
            cache.currentSlide = component.getByIndex(cache.index);
            cache.currentSlide.setSelected(true);
            component.dispatchEvent({type: DD.ui.flickSliders.EventType.SETTLE, index: cache.index});
            component.dispatchEvent({type: DD.ui.flickSliders.EventType.SELECTED, index: cache.index});
            cache.currentSlide.applyActionOnSlide();
        }, fadeDuration);

        cache.lastIndex = cache.index;
        cache.lastValue = index;

        component.$cache(cache);
        return {
            current : cache.S.current,
            next    : cache.S.prev,
            prev    : cache.S.next
        };
    };

    prototype.resetOpacity_ = function(component, value)
    {
        var cache = component.$cache();
        for (var i = 0; i < cache.length; i++)
        {
            if (cache.index == i)
                break;
            component.getByIndex(i).getElement().style.opacity = value;
        };
    };

    /**
     * Прерывание плавного затухания изменения прозрачности
     * @param  {Object} animate Содержит возможные элементы, учавствующие в анимации остаточного затухания прозрачности
     * @return {Object}
     * @private
     */
    prototype.stopResidualFade_ = function(component, animate)
    {
        var cache = component.$cache(),
            params = component.getParams();

        if (animate.current)
        {
            dynamics.stop(animate.current)
            // animate.current.style.opacity = 1;
        };

        if (params.effect != DD.ui.flickSliders.Fader.Effects.LONESOME)
        {
            if (animate.prev)
            {
                dynamics.stop(animate.prev)
            };
        };

        if (params.effect == DD.ui.flickSliders.Fader.Effects.NORMAL || (params.effect == DD.ui.flickSliders.Fader.Effects.LONESOME && cache.index != cache.length))
        {
            if (animate.next)
            {
                dynamics.stop(animate.next)
            };
        };

        // Если текущий индекс равен 0, то самый последний слайд должен быть прозрачным
        // Это нужно в случае зацикливания галереи
        if (params.effect == DD.ui.flickSliders.Fader.Effects.LONESOME && cache.index == 0)
        {
            var slide = component.getByIndex(cache.length).getElement();
            dynamics.stop(slide)
            // slide.style.opacity = 0;
        }

        return {};
    };
}); // goog.scope
