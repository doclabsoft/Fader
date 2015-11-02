/**
 * @overview Разнообразные слайдеры с общим интерфейсом.
 * @project UI controls.
 * @author Anton Parkhomenko
 * @version 1.0
 */

/**
 * @namespace DD.ui.flickSliders
 */

/**
 * @namespace DD.ui.flickSliders.renderer
 */

goog.provide('DD.ui.flickSliders');
goog.provide('DD.ui.flickSliders.renderer');

/**
 * Список типов галерей
 * @enum {string}
 */
DD.ui.flickSliders.Types = {
	/** Вертикальная галерея, выполненная в виде touch-меню */
	PANMENU: 'panmenu',
	/** Горизонтальная галерея, которая осуществляет смену слайдов при помощи fade-эффекта */
	FADER: 'fader',
	/** Горизонтальная стандартная галерея */
	GALLERY: 'gallery'
};

/**
 * Список событий галереи
 * @enum {string}
 */
DD.ui.flickSliders.EventType = {
	/** Событие, определяющее момент движения галереи */
	DRAGMOVE: 'dragmove',
	/** Событие, определяющее момент прекрашения манипуляций указателем */
	DRAGEND: 'dragend',
	/** Событие, определяющее момент назначения конкретного слайда выбранным */
	SETTLE: 'settle',
	/** Событие, определяющее момент активного салйда, но не выбранного */
	SELECTED: 'selected',
	/** Событие, определяющее момент вставки нового слайда */
	INSERT: 'insert',
	/** Событие, определяющее момент смены слайда по преодолении заданного порога */
	CHANGESLIDEINDEX: 'changeslideindex',
	/** Событие, определяющее момент удаления слайда из галереи */
	REMOVE: 'remove',
	/** Событие, определяющее момент выполнения заданной функции после события DD.ui.flickSliders.EventType.SETTLE */
	SLIDEACTION: 'slideaction'
};

/**
 * Список ошибок галереи
 * @enum {string}
 */
DD.ui.flickSliders.Errors = {
	WRONGINDEXSLIDE: 'Нельзя выбрать слайд: неправильно указан индекс слайда'
};