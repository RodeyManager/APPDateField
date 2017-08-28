/**
 * Created with JetBrains WebStorm.
 * User: LUOYONG （Rodey -- www.senuu.com）
 * Date: 16-6-21
 * Time: 下午5:40
 */

;(function(){

    'use strict';

    var root = this;
    var gVars = {
        fontSize: 22,
        step: 40,
        //模板
        tpl: '<div class="app-s-main">'+
                '<div class="app-s-top">'+
                    '<span class="app-s-btnCancel"></span>'+
                    '<span class="app-s-title"></span>'+
                    '<span class="app-s-btnOk"></span>'+
                '</div>'+
                '<div class="app-s-center">'+
                    '<ul class="app-s-year-con"></ul>'+
                    '<ul class="app-s-month-con"></ul>'+
                    '<ul class="app-s-date-con"></ul>'+
                    '<div class="app-center-current"></div>'+
                '</div>'+
                '<div class="app-s-bottom"></div>'+
        '</div>'
    };
    function isDefiend(val){ return undefined !== val; }
    var isFunction = function(fn){ return 'function' === typeof fn; };
    var empty = function(){};
    function isEmpty(){}
    var toString = Object.prototype.toString;

    /**
     * 构建日期选择对象
     * @param selectElm
     * @param options
     * @param complete
     * @param cancel
     * @constructor
     */
    var APPDateField = function(selectElm, options, complete, cancel){
        options = options || {};
        this.selectElm = $('#' + selectElm.replace(/^#/i, ''))[0];
        this.appWrap = $('#app-s-con');

        this.loaded = false;
        /**
         * 完成和取消事件判断
         */
        this.complete = isFunction(options.complete) ? options.complete : isFunction(complete) ? complete : empty;
        this.cancel = isFunction(options.cancel) ? options.cancel : isFunction(cancel) ? cancel : empty;
        this.moveEnd = isFunction(options.moveEnd) ? options.moveEnd : empty;
        if((options.complete && isDefiend(options.complete) && typeof options.complete === 'function')
            || (complete && typeof complete === 'function') ){
            this.complete = options.complete || complete || isEmpty;
        }
        if((options.cancel && isDefiend(options.cancel) && typeof options.cancel === 'function')
            || (cancel && typeof cancel === 'function') ){
            this.cancel = options.cancel || cancel || isEmpty;
        }

        this.step = gVars.step;

        //默认日期，从焦点对象中取值
        this.valList = [];
        //最后输出日期 (默认的， 你还可以使用对象的 getCurrentDate 方法获取，同时还可以在该方法的参数中设置 year, month, date)
        this.currDate = [];

        this.opts = {
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1,
            date: new Date().getDate(),
            hours: new Date().getHours(),
            minutes: new Date().getMinutes(),
            seconds: new Date().getSeconds(),

            upYear: 'number' === typeof options.upYear ? options.upYear : 60,
            downYear: 'number' === typeof options.downYear ? options.downYear : 60,
            data: options.data, //选择数据
            dataShowKey: options.dataShowKey || 'value',
            multiDataSelect: options.multiDataSelect,
            toValues: options.toValues,

            title: options.title || '',
            addClass: options.addClass || '',
            fontSize: options.fontSize || gVars.fontSize,
            cancelTxt: options.cancelTxt || '取消',
            completeTxt: options.completeTxt || '完成',
            isCN: isDefiend(options.isCN) ? options.isCN : true,
            isCircle: isDefiend(options.isCircle) ? options.isCircle : true, //是否设置凸镜效果
            showYear: isDefiend(options.showYear) ? options.showYear : true,
            showMonth: isDefiend(options.showMonth) ? options.showMonth : true,
            showDate: isDefiend(options.showDate) ? options.showDate : true,
            showTime: options.showTime || false, 
            commer: options.commer || '-' //日期间隔默认 ‘-’,

        };

        //初始化
        this._init();

    };
    APPDateField.prototype.reset = function(){
        this._init();
    };
    APPDateField.prototype._init = function(){
        var value = this._getValue();

        if(this.opts.data){
            this.valList = value;
        }else{
            if(value && value !== ''){
                this.valList = this.subDefaultDate(value || '');
            }
            this.setCurrentTXT(this.valList);
        }

        //加载组件模板
        if(!this.appWrap[0]){
            this.appWrap = $('<div />').attr({'id': 'app-s-con', 'class': 'app-s-con'});
            //加入到页面中
            $('body').append(this.appWrap);
        }else{
            this.appWrap.fadeIn(10);
        }
        //加载模板
        this._load();
    };

    APPDateField.prototype._load = function(){
        this._render();
    };

    APPDateField.prototype._render = function(){
        var appWrap = this.appWrap.html(gVars.tpl);

        this.app_main = appWrap.find('.app-s-main');
        this.app_title = appWrap.find('.app-s-title');
        this.app_btnCancel = appWrap.find('.app-s-btnCancel');
        this.app_btnOk = appWrap.find('.app-s-btnOk');
        this.app_center_con = appWrap.find('.app-s-center');
        this.app_y_con = appWrap.find('.app-s-year-con');
        this.app_m_con = appWrap.find('.app-s-month-con');
        this.app_d_con = appWrap.find('.app-s-date-con');

        var appWrap_w = appWrap.width();

        //标题
        this.app_title.html(this.opts.title);
        //按钮文字
        this.app_btnCancel.html(this.opts.cancelTxt);
        this.app_btnOk.html(this.opts.completeTxt);

        if(this.opts.data){
            this.app_y_con.css({ width: appWrap_w, left: 0 });
            this.app_m_con.css('display', 'none');
            this.app_d_con.css('display', 'none');
            this.loaded = true;
            this.createDatas();
            this._events();
            return false;
        }

        //改变大小
        this._resize();
        this.loaded = true;

        if(this.opts.showTime){
            this.createHours();
            this.createMins();
            this.createSeconds();
        }else{
            this.createYear();
            this.createMonth();
            this.createDate();
        }

        this._events();
    };

    APPDateField.prototype._resize = function(){
        var appWrap_w = this.appWrap.width();
        this.app_center_con.find('ul').css('width', appWrap_w / 3);

        if(this.opts.showYear && this.opts.showMonth && this.opts.showDate){
            this.app_y_con.css('left', 0);
            this.app_m_con.css('left', appWrap_w / 3);
            this.app_d_con.css('left', appWrap_w / 3 * 2);
        }else if(this.opts.showYear && this.opts.showMonth && !this.opts.showDate){
            this.app_center_con.find('ul').css('width', appWrap_w / 2);
            this.app_y_con.css('left', 0);
            this.app_m_con.css('left', appWrap_w / 2);
            this.app_d_con.css({ left: appWrap_w / 2 * 2, display: 'none' });
        }else if(!this.opts.showYear && this.opts.showMonth && this.opts.showDate){
            this.app_center_con.find('ul').css('width', appWrap_w / 2);
            this.app_y_con.css({ left: 0, display: 'none' });
            this.app_m_con.css('left', 0);
            this.app_d_con.css('left', appWrap_w / 2);
        }

    };

    APPDateField.prototype.createDatas = function(){
        var datas = this.opts.data;
        var html = [], li = '', index = 1, i = 0;
        if(!this.loaded)    return;
        if('[object Object]' === toString.call(datas)){
            for(var key in datas){
                li = '<li style="font-size:'+ this.opts.fontSize +'px;" data-key="'+ key +'">'+ datas[key] +'</li>';
                html.push(li);
                if(this.valList === datas[key]){
                    index = i + 1;
                }
                i++;
            }
            this.app_y_con.html(html.join('')).show();
            var currentTop = this.step * parseInt(index) - (this.step * 4);
            this._scrollTop(this.app_y_con, -currentTop, true);
        }
        else if('[object Array]' === toString.call(datas)){

            if(this.opts.multiDataSelect){

                var yData = datas[0], mData = datas[1], dData = datas[2];

                if(yData){
                    this.opts.showYear = true;
                    this._createHTML(yData, this.app_y_con, 0);
                }
                if(mData){
                    this.showMonth = true;
                    this._createHTML(mData, this.app_m_con, 1);
                }
                if(dData){
                    this.showDate = true;
                    this._createHTML(dData, this.app_d_con, 2);
                }
                this._resize();

            }else{
                this._createHTML(datas, this.app_y_con, 0);
            }
        }else{
            throw new ReferenceError('data parameter must be an array or object');
        }
    };

    APPDateField.prototype._createHTML = function(datas, el, vi){

        var html = [], li = '', index = 1, i = 0;

        for(var len = datas.length; i < len; i++){
            var data = datas[i];
            // 如果item为object
            if('[object Object]' === toString.call(data)){
                var attrs = '';
                for(var k in data){
                    if(data.hasOwnProperty(k)){
                        attrs += ' data-' + k + '="' + data[k] + '"';
                    }
                }
                attrs += 'data-adf-index="' + i + '"';
                li = '<li style="font-size:'+ this.opts.fontSize +'px;" '+ attrs +'>'+ data[this.opts.dataShowKey] +'</li>';
            }else{
                li = '<li style="font-size:'+ this.opts.fontSize +'px;">'+ datas[i] +'</li>';
            }
            html.push(li);
            if(this.valList[vi] === datas[i]){
                index = i + 1;
            }
        }

        el.html(html.join('')).show();
        var currentTop = this.step * parseInt(index) - (this.step * 4);
        this._scrollTop(el, -currentTop, true);
    };

    /**
     * 创建年份
     * @param up
     * @param down
     */
    APPDateField.prototype.createYear = function(up, down){
        if(!this.loaded)    return;
            up      = up    || this.opts.upYear;
            down    = down  || this.opts.downYear;
        var now = new Date(),
            ny = now.getFullYear(),
            html = [], li = '', style = '';

        for(var j = 1; j < up + 1; j++){
            li = this.opts.isCN ? '<li'+ style +'>'+ (ny - j) +'年</li>' : '<li>'+ (ny - j) +'</li>';
            html.unshift(li);
        }
        for(var i = 0; i <= down; i++){
            li = this.opts.isCN ? '<li'+ style +'>'+ (ny + i) +'年</li>' : '<li>'+ this.dateFm((ny + i)) +'</li>';
            html.push(li);
        }
        this.app_y_con.html(html.join(''));
        var currentTop = this.step * ( this.opts.year - parseInt(this.app_y_con.find('li').eq(0).text()) - 3);
        this._scrollTop(this.app_y_con, -currentTop);
    };

    /**
     * 创建月份
     * @return {String}
     */
    APPDateField.prototype.createMonth = function(){
        this._createLists(this.app_m_con, 1, 13, this.opts.month);
        var currentTop = this.step * parseInt(this.opts.month) - (this.step * 4);
        this._scrollTop(this.app_m_con, -currentTop);
    };

    /**
     * 创建日
<<<<<<< HEAD
     * @param flag
=======
     * @param n
>>>>>>> origin/master
     * @return {String}
     */
    APPDateField.prototype.createDate = function(flag){

        var d = 0, pr = 31, big = [1,3,5,7,8,10,12], small = [4,6,9,11],
            month = this.opts.month, html = [], li = '';
        if(!this.loaded)    return;
        if(big.indexOf(month) !== -1){
            pr = 31;
        }else if(small.indexOf(month) !== -1){
            pr = 30;
        }else if(month === 2){
            //判断 平年(28) 和 闰年(29)
            pr = (((this.opts.year % 4 === 0 ) && (this.opts.year % 100 !== 0)) || (this.opts.year % 400 === 0 )) ? 29 : 28;
        }
        while(d < pr){
            li = this.opts.isCN ? '<li>'+ (d + 1) +'日</li>' : '<li>'+ this.dateFm((d + 1)) +'</li>';
            html.push(li);
            d++;
        }
        this.app_d_con.html(html.join(''));
        this._scrollTop(this.app_d_con, -(this.step * parseInt(this.opts.date) - (this.step * 4)), flag);
    };

    /**
     * 创建小时
     * @return {[type]} [description]
     */
    APPDateField.prototype.createHours = function(){
        this._createLists(this.app_y_con, 0, 24, this.opts.hours);
        var currentTop = this.step * ( this.opts.hours - parseInt(this.app_y_con.find('li').eq(0).text()) - 3);
        this._scrollTop(this.app_y_con, -currentTop);
    };

    /**
     * 创建分钟
     * @return {[type]} [description]
     */
    APPDateField.prototype.createMins = function(){
        this._createLists(this.app_m_con, 0, 60, this.opts.minutes);
        var currentTop = this.step * parseInt(this.opts.minutes + 1) - (this.step * 4);
        this._scrollTop(this.app_m_con, -currentTop);
    };

    /**
     * 创建秒
     * @return {[type]} [description]
     */
    APPDateField.prototype.createSeconds = function(){
        this._createLists(this.app_d_con, 0, 60, this.opts.minutes);
        var currentTop = this.step * parseInt(this.opts.seconds + 1) - (this.step * 4);
        this._scrollTop(this.app_d_con, -currentTop);
    };

    /**
     * 创建数据列表
     * @param el        当前需要填充的元素
     * @param start     开始数
     * @param end       结束数
     * @param item      当前创建的类型
     * @private
     */
    APPDateField.prototype._createLists = function(el, start, end, item){
        if(!this.loaded)    return;
        var html = [], li = '', isCN = this.opts.isCN, sufix = '';

        switch (item){
            case this.opts.month:
                sufix = '月'; break;
            case this.opts.date:
                sufix = '日'; break;
            case this.opts.hours:
                sufix = '时'; break;
            case this.opts.minutes:
                sufix = '分'; break;
            case this.opts.secondes:
                sufix = '秒'; break;
        }

        while(start < end){
            li = isCN ? '<li>'+ start + sufix +'</li>' : '<li>'+ this.dateFm(start) +'</li>';
            html.push(li);
            start++;
        }
        el.html(html.join(''));
    };

    //setter AND getter 设置和获取函数
    APPDateField.prototype.getYear = function(){
        return this._getText(this.app_y_con);
    };
    APPDateField.prototype.getMonth = function(){
        return this._getText(this.app_m_con);
    };
    APPDateField.prototype.getDate = function(){
        return this._getText(this.app_d_con);
    };

    APPDateField.prototype._getText = function(element){
        var text = parseInt(this.getCurrChangeElm(element).text());
        switch(element){
            case this.app_y_con:
                this[this.opts.showTime ? 'hours' : 'year'] = text; break;
            case this.app_m_con:
                this[this.opts.showTime ? 'minutes' : 'month'] = text; break;
            case this.app_d_con:
                this[this.opts.showTime ? 'seconds' : 'date'] = text; break;
        }
        return text;
    };
    /**
     * 获取当前值
     * @param moveEL (jQuery对象)
     * @returns {*|XMLList}
     */
    APPDateField.prototype.getCurrChangeElm = function(moveEL){
        var li, num = Math.round(moveEL.position().top) / this.step;
        if(num == 0){
            num = 3;
        }else if(num >=1 && num <= 3){
            if(num == 1) num = 2;
            else if(num == 2) num = 1;
            else if(num == 3) num = 0;
        }else if(num < 0){
            num = Math.abs(num) + 3;
        }
        li = moveEL.find('li').eq(num);
        return li;
    };
    /**
     * 设置值
     * @param valList
     */
    APPDateField.prototype.setCurrentTXT = function(valList){
        var self = this;
        var vlist = valList, opts = self.opts;
        if(self.opts.data){
            this._setValue('function' === typeof this.opts.toValues ? this.opts.toValues(valList) : valList.join(',').replace(/,*$/g, ''));
            return this;
        }
        if(!vlist || !valList.length || vlist.length === 0){
            this._setValue('');
            return this;
        }

        var one = parseInt(vlist[0]),
            two = parseInt(vlist[1]),
            three = parseInt(vlist[2]);

        if(opts.showTime){
            opts.hours = one || opts.hours;
            opts.minutes = two || opts.minutes;
            opts.seconds = three || opts.seconds;
        }else{
            //只显示月 日
            if(!opts.showYear){
                vlist[0] = '';
            }
            //只显示年 月
            if(!opts.showDate){
                vlist[2] = '';
            }
            opts.year = one || opts.year;
            opts.month = two || opts.month;
            opts.date = three || opts.date;
        }

        //console.log(vlist);

        var dateStr, dy, dm, dd;
        if(opts.showTime){
            dateStr = _getValue(opts.hours, '时', ':') + _getValue(opts.minutes, '分', ':') + _getValue(opts.seconds, '分', '');
        }else{
            dy = _getValue(opts.year, '年', opts.commer);
            dm = _getValue(opts.month, '月', opts.commer);
            dd = _getValue(opts.date, '日', '');
            if(opts.showYear && opts.showMonth && !opts.showDate){
                dateStr = dy + dm.replace(opts.commer, '');
            }else if(!opts.showYear && opts.showMonth && opts.showDate){
                dateStr = dm + dd;
            }else{
                dateStr = dy + dm + dd;
            }
        }

        function _getValue(val, suffix, commer){
            return opts.isCN ? (val + suffix) : (self.dateFm(val) + commer);
        }

        this._setValue(dateStr);
    };

    APPDateField.prototype._setValue = function(value){
        if(/INPUT/gi.test(this.selectElm.tagName)){
            this.selectElm.value = value;
        }else{
            this.selectElm.innerHTML = value;
        }
    };
    APPDateField.prototype._getValue = function(){
        if(this.opts.defaultValue){
            return this.opts.defaultValue;
        }
        if(/INPUT/gi.test(this.selectElm.tagName)){
            return this.selectElm.value;
        }else{
            return this.selectElm.innerHTML;
        }
    };

    /**
     * 截取默认日期
     * @param dateString
     * @returns {Array}
     */
    APPDateField.prototype.subDefaultDate = function(dateString){

        var self = this, list = [], opts = self.opts;
        if(!dateString){
            var date = new Date();
            if(opts.showTime){
                list.push(date.getHours());
                list.push(date.getMinutes());
                list.push(date.getSeconds());
            }else{
                list.push(date.getFullYear());
                list.push(date.getMonth() + 1);
                list.push(date.getDate());
            }

        }else{
            if(opts.isCN){
                list = dateString.match(/(\d)+/gi);
            }else{
                list = dateString.match(/(\d)+/gi) || dateString.split(opts.commer || '-');
            }
        }
        if(list.length === 3){
            if(!opts.showYear){
                list[0] = '';
            }
            if(!opts.showDate){
                list[2] = '';
            }
        }else{
            if(!opts.showYear){
                list.unshift('');
            }
            if(!opts.showDate){
                list.push('');
            }
        }
        self.valList = list;
        return list;
    };

    /**
     * 获取最后的日期 (可设置)， 返回为数组
     * @param y
     * @param m
     * @param d
     * @param commer
     * @returns {string}
     */
    APPDateField.prototype.getCurrentDate = function(y, m, d){
        if(this.opts.data){
            return this.currDate;
        }
        var list = this.currDate;
        list[0] = y || list[0];
        list[1] = m || list[1];
        list[2] = d || list[2];
        this.currDate = list;
        return list;
    };

    /**
     * 初始化滚动动作,滚动到指定位置
     * @param elObj
     * @param y
     * @param flag
     * @private
     */
    APPDateField.prototype._scrollTop = function(elObj, y){

        _scrollTo(elObj[0], y, true, this, false);
        //设置凸镜效果
        (this.opts.isCircle === true) && zoomOBJ(elObj, y, this);

    };

    /**
     *
     * @private
     */
    APPDateField.prototype._events = function(){
        var opts = this.opts,
            app_y_con = this.app_y_con,
            app_m_con = this.app_m_con,
            app_d_con = this.app_d_con,
            app_main = this.app_main;

        (this.opts.showYear || this.opts.showTime) && new APPTouch(app_y_con[0], app_main[0], opts, this);
        (this.opts.showMonth || this.opts.showTime) && new APPTouch(app_m_con[0], app_main[0], opts, this);
        (this.opts.showDate || this.opts.showTime) && new APPTouch(app_d_con[0], app_main[0], opts, this);

        //完成和取消按钮
        this.app_btnOk.on('touchend', holdEvent(this, this._complete));
        this.app_btnCancel.on('touchend', holdEvent(this, this._cancel));

        this.app_btnOk.on('touchstart', this.endEvent);
        this.app_btnCancel.on('touchstart', this.endEvent);

    };

    APPDateField.prototype.endEvent = function(evt){
        evt.preventDefault();
        evt.stopPropagation();
    };

    /**
     * 日期选择 完成 事件
     * @param evt
     * @private
     */
    APPDateField.prototype._complete = function(evt){
        var vlist;
        if(this.opts.data){
            //自定义数据存在
            var liY = this.getCurrChangeElm(this.app_y_con);
            var liM = this.getCurrChangeElm(this.app_m_con);
            var liD = this.getCurrChangeElm(this.app_d_con);
            vlist = [ liY.text(), liM.text(), liD.text() ];
            this.changeElement = [ liY[0], liM[0], liD[0] ];
        }else{
            //日期时间选择
            vlist = [];
            vlist.push(this.getYear());
            vlist.push(this.getMonth());
            vlist.push(this.getDate());
        }

        this.currDate = vlist;
        //console.log(this.currDate)
        //填值给选择框
        this.setCurrentTXT(vlist);

        this._hide();
        this.complete.call(this, evt);
    };
    /**
     * 日期选择 取消 事件
     * @param evt
     * @private
     */
    APPDateField.prototype._cancel = function(evt){
        this._hide();
    };
    APPDateField.prototype._hide = function(){
        this.appWrap.css('display', 'none');
    };
    /**
     * 日期格式化
     * @//param n
     * @return {String}
     */
    APPDateField.prototype.dateFm = function(n){
        return (n < 10) ? '0' + n : n;
    };

    root.APPDateField = APPDateField;

    //////////////////////////以下是滚动对象//////////////////////////////////////////////////////////////////////////////
    /**
     * Touch对象
     * @param element   当前滚定对象
     * @param parentElement   当前滚定对象父节点
     * @param options   配置信息
     * @param target    当前实例
     * @constructor
     */
    var APPTouch = function(element, parentElement, options, target){
        //焦点对象
        this.elm = element;
        //焦点父节点
        this.elmParent = parentElement;
        //是否具有Touch事件
        this.hasTouch = 'ontouchstart' in window || window.TouchEvent;
        this.isTouchStart = false;
        this.options = options;
        this.callTarget = target;

        //存储列表
        this.vlist = {
            year: this.options.year,
            month: this.options.month,
            date: this.options.date,
            hours: this.options.hours,
            minutes: this.options.minutes,
            seconds: this.options.seconds
        };

        //滚动到
        this.dy = 0;
        //滚动层高度
        this.h = $(this.elm).height();
        //鼠标位置
        this.moveY = 0;
        //滚动层顶部坐标
        this.top = $(this.elm).position().top;
        //步长
        this.step = gVars.step;
        this.fontSize = this.callTarget.opts.fontSize;

        this.offset = {
            left: this.elmParent.offsetLeft,
            top: this.elmParent.offsetTop,
            width: $(this.elmParent).width(),
            height: $(this.elmParent).height()
        };
        this.startTime = 0;

        //触发时间侦听
        this._initEvent(element);
    };

    APPTouch.prototype = {
        _initEvent: function(element){
            if(this.hasTouch){
                element.addEventListener('touchstart', this, false);
                element.addEventListener('touchmove', this, false);
                element.addEventListener('touchend', this, false);
            }else{
                element.addEventListener('mousedown', this, false);
                element.addEventListener('mousemove', this, false);
                element.addEventListener('mouseup', this, false);
            }
        },

        handleEvent : function(evt) {
            /*evt.preventDefault();
             evt.stopPropagation();*/
            switch (evt.type) {
                case 'touchstart':
                    this._start(evt.targetTouches[0], evt);
                    break;
                case 'touchmove':
                    this._move(evt.changedTouches[0], evt);
                    break;
                case 'touchend':
                    this._end(evt.changedTouches[0], evt);
                    break;
                case 'mousedown':
                    this._start(evt);
                    break;
                case 'mousemove':
                    this._move(evt);
                    break;
                case 'mouseup':
                    this._end(evt);
                    break;
            }

            if(/SELECT|TEXTAREA|INPUT/.test(evt.target.tagName.toUpperCase())) {
                evt.preventDefault();
            }
            evt.preventDefault();
            evt.stopPropagation();
        },
        _start: function(evt){
            this.isTouchStart = true;
            this.y = this.top = $(this.elm).position().top;
            this.h = $(this.elm).height();
            this.moveY = evt.pageY; //开始位置
            this.startTime = Date.now();
            //console.log('this.h = ' + this.h)
        },
        _move: function(evt){
            if(this.isTouchStart){
                var target = $(evt.target).parent('ul');
                target.find('li').css('fontSize', this.fontSize + 'px');
                this.dy = this.y - (this.moveY - evt.pageY);

                var top = this._formateTop(this.dy);
                this._scrollTop(target[0], top, true);

                //设置凸镜效果
                (this.callTarget.opts.isCircle === true) && zoomOBJ(target, top, this.callTarget);
            }
        },
        _end: function(evt){
            this.isTouchStart = false;
            var target = $(evt.target).parent('ul');

            //判断是上拖还是下拖
            var offset =  evt.pageY - this.moveY;
            var curTop = this.y + offset;
            var top = this._formateTop(curTop);
            this._scrollTop(target[0], top, false);

            //设置凸镜效果
            (this.callTarget.opts.isCircle === true) && zoomOBJ(target, top, this.callTarget);
        },
        /**
         * 判断高度越界
         * @param top
         * @return {*}
         * @private
         */
        _formateTop: function(top){
            if(top >= (gVars.step * 3)){
                top = (gVars.step * 3);
            }else if(Math.abs(top) >= this.h - (gVars.step * 4)){
                top = -(this.h - (gVars.step * 4));
            }else{
                return top;
            }
            this.y = top;
            return top;
        },
        /**
         * 滚动层到指定位置
         * @param el
         * @param y
         * @param flag
         * @private
         */
        _scrollTop: function(el, y, flag){
            _scrollTo(el, y, flag, this, !this.callTarget.opts.showTime);
        }

    };

    ///////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * 改变对象作用域
     * @param obj
     * @param func
     * @return {Function}
     */
    function holdEvent(obj, func){
       var args = [];
        for(var i=2; i<arguments.length; i++){
            args.push(arguments[i]);
        }
        return function(e){
            args.push(e);
            func.call(obj, e, args);
        }
    }

    /**
     * 滚动到指定位置
     * @param el    当前需要滚动的元素
     * @param y     目标位置
     * @param flag  是否渐进滚动
     * @param obj   当前对象
     * @param isM2  滚动后是否重新获取 2月份的天数
     * @returns {boolean}
     * @private
     */
    function _scrollTo(el, y, flag, obj, isM2){
        if(!el) { return false; }
        y = y || 0;
        var step = gVars.step, isAPPDateField = obj instanceof APPTouch;
        if(flag){
            el.style.top = y + 'px';
            isM2 && _getMonth2Days(el, obj);
        }else{
            $(el).off().animate({ top: y }, 10, function(){
                var mesc = y % step;
                //console.log(mesc)
                if(mesc !== 0){
                    var top = step * Math.round(y / step) - ( Math.abs(mesc) < step ? 0 : step);
                    $(this).animate({ top: top }, function(){
                        isM2 && _getMonth2Days(el, obj);
                        _moveEnd();
                    });
                    obj.y = top;
                }else{
                    _moveEnd();
                }
            });
        }

        function _moveEnd(){
            if(!isAPPDateField) return;
            obj.callTarget.moveElment = obj.elm;
            var li = obj.callTarget.getCurrChangeElm($(el));
            obj.callTarget.moveEnd.call(obj.callTarget, li[0], el);
        }
    }

    //根据润平年西安市日期
    function _getMonth2Days(el, obj){

        /////获取滚动end后的焦点值==-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-START
        if(!obj.isTouchStart && !obj.callTarget.opts.data){

            obj.callTarget.opts.year = obj.callTarget.getYear();
            obj.callTarget.opts.month = obj.callTarget.getMonth();
            if(!$(el).hasClass('app-s-date-con')){
                obj.callTarget.createDate(false);
            }
        }
    }

    /**
     * 设置层凸镜效果
     * @param elObj
     * @param y
     */
    function zoomOBJ(elObj, y, target){
        //设置凸镜效果
        var index = Math.round(y / gVars.step);   //当前eq
        var count = Math.round(elObj.height() / gVars.step);  //总共的eq
        //确定位置
        if(index >= count){
            index = count - 1;
        }else if(index >=1 && index <= 3){
            if(index == 1){
                index = 3 - index;
            }else if(index == 2){
                index = 3 - index;
            }else if(index == 3){
                index = 0;
            }
        }else if(index <= 0){
            index = Math.abs(index) + 3;
        }

        //console.log(self.step)

        var uls = target.app_center_con.find('ul').filter(function(m){
                return $(this).css('display') != 'none';
            }),
            ulsLen = uls.length;

        //只显示当前的
        $.each(elObj.find('li'), function(i, item){
            if(index - 4 > i || i > index + 4){
                $(item).css('visibility', 'hidden');
            }else{
                $(item).attr('style', '');
            }
        });

        //循环缩放 上
        _repeat('up');
        //循环缩放 下
        _repeat('down');

        function _repeat(type){
            var i = 0, len = 4, li, eqIndex,
                fs = target.opts.fontSize,
                ti = 0, tiStep = 5,
                skew = 0, skewStep = 10;

            for(; i < len; i++){
                eqIndex = 'up' === type ? index - i : index + i;
                li = (elObj.find('li').eq(eqIndex))[0];
                if(!li)   continue;

                //设置 text-indent
                if(ulsLen === 3){
                    li.style.cssText = 'font-size:' + fs + 'px; text-indent:' + ti + 'px; -webkit-transform: skewX('+ skew +'deg)';
                    elObj.hasClass('app-s-year-con') && _left();
                    elObj.hasClass('app-s-date-con') && _right();
                }else{
                    li.style.fontSize = fs + 'px';
                }
                fs -= 4.0;
            }

            function _left(){
                ti += tiStep;
                (type === 'down') ? (skew += skewStep) : (skew -= skewStep);
            }

            function _right(){
                ti -= tiStep;
                (type === 'down') ? (skew -= skewStep) : (skew += skewStep);
            }


        }



    }

}).call(this);





