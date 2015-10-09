/**
 * Created with JetBrains WebStorm.
 * User: Rodey
 * Time: 下午5:40
 * To change this template use File | Settings | File Templates.
 */

/*define(['jQuery'], function($){

});*/

/**
 * USE:
 *
 * "date" === 为焦点输入框id值
 * <input type="text" id="date" value="2014年4月1日" />
 *
 * var appDateField = new APPDateField('date', {
                        isCN: true,       //是否显示中文, 如: " 2014年4月1日 ", 否： " 2014-04-01 "
                        commer: '/',      //期间之间的间隔符, 默认为 "/"，当 isCN为 true时, 这个设置失效
                        showYear: true,   //是否显示年份, 默认为显示 （true）
                        showMonth: true,  //是否显示月份, 默认为显示 （true）
                        showDate: true,   //是否显示日, 默认为显示 （true）
                        complate: function(evt){  // "完成"按钮触发事件
                            console.log(this)
                            console.log(this.getCurrentDate(0,0,0));
                            console.log(this.currDate);
                            //alert(999)
                        },
                        cancel: function(evt){  // "取消"按钮触发事件
                            console('Cancel---');
                        }
                    });
 */


;(function(){

    'use strict';

    var root = this;
    var gVars = {
        fontSize: 1.2,
        step: 40,
        isCircle: false,
        //模板
        tpl: '<div class="app-dateField-main">'+
                '<div class="app-dateField-top">'+
                    '<span class="app-dateField-btnCancel">取消</span>'+
                    '<span class="app-dateField-btnOk">完成</span>'+
                '</div>'+
                '<div class="app-dateField-center">'+
                    '<ul class="app-dateField-year-con"></ul>'+
                    '<ul class="app-dateField-month-con"></ul>'+
                    '<ul class="app-dateField-date-con"></ul>'+
                    '<div class="app-center-current"></div>'+
                '</div>'+
                '<div class="app-dateField-bottom"></div>'+
        '</div>'
    };

    /**
     * 构建日期选择对象
     * @param selectElm
     * @constructor
     */
    var APPDateField = function(selectElm, options, complate, cancel){
        var self = this;
        var options = options || {};
        self.selectElm = $ ? $('#' + selectElm)[0] : document.getElementById(selectElm);
        self.htmlDom = null;
        self.appWrap = $ ? $('#APPDateField-con')[0] : document.getElementById('APPDateField-con');

        self.loaded = false;
        self.isRender = false;
        /**
         * 完成和取消事件判断
         */
        if((options.complate && options.complate != undefined && typeof options.complate === 'function')
            || (complate && typeof complate === 'function') ){
            self.complate = options.complate ? options.complate : complate;
        }
        if((options.cancel && options.cancel != undefined && typeof options.cancel === 'function')
            || (cancel && typeof cancel === 'function') ){
            self.cancel = options.cancel ? options.cancel : cancel;
        }

        self.currentTop = 0;
        self.step = gVars.step;

        //默认日期，从焦点对象中取值
        self.valList = [];
        //最后输出日期 (默认的， 你还可以使用对象的 getCurrentDate 方法获取，同时还可以在该方法的参数中设置 year, month, date)
        self.currDate = [];

        //组件相关元素
        self.app_top;
        self.app_btnCancel;
        self.app_btnOk;

        self.app_center_con;
        self.app_y_con;
        self.app_m_con;
        self.app_d_con;
        self.app_cen_c;


        self.opts = {
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1,
            date: new Date().getDate(),
            hours: new Date().getHours(),
            minutes: new Date().getMinutes(),
            secondes: new Date().getSeconds(),

            upYear: options.upYear || 100,
            downYear: options.downYear || 100,

            isCN: (!options.isCN && undefined != options.isCN) ? options.isCN : true,
            isVal: (!options.isVal && undefined != options.isVal) ? options.isVal : false, //是否是value值还是innerText
            isCircle: (!options.isCircle && undefined != options.isCircle) ? options.isCircle : false, //是否设置凸镜效果
            showYear: (!options.showYear && undefined != options.showYear) ? options.showYear : true,
            showMonth: (!options.showMonth && undefined != options.showMonth) ? options.showMonth : true,
            showDate: (!options.showDate && undefined != options.showDate) ? options.showDate : true,
            commer: options.commer || '-' //日期间隔默认 ‘-’

        };

        gVars.isCircle = self.opts.isCircle;

        //初始化
        self._init();

    };

    APPDateField.prototype._init = function(){
        var self = this;

        if(self.selectElm.value || self.selectElm.value !== ''){
            self.valList = self.subDefaultDate(self.selectElm.value || '');
        }
        self.setCurrentTXT(self.valList);

        //加载组件模板
        if(!self.appWrap){
            self.appWrap = document.createElement('div');
            self.appWrap.setAttribute('id', 'APPDateField-con');
            self.appWrap.setAttribute('class', 'APPDateField-con');
            //加入到页面中
            document.body.appendChild(self.appWrap);
        }else{
            $ ? ($(self.appWrap).show()) : (self.appWrap.style.display = 'block');
            self.isRender = true;
        }
        //加载模板
        self._load();
    };

    APPDateField.prototype._load = function(){
        var self = this;
        if(!self.loaded) {
            self._render();
        }
    };

    APPDateField.prototype._render = function(){
        var self = this;
        var appWrap = $(self.appWrap).html(gVars.tpl);
        var htmlDomS = appWrap;
        self.htmlDom = appWrap;
        self.app_main = appWrap.find('.app-dateField-main');
        self.app_top = appWrap.find('.app-dateField-top');
        self.app_btnCancel = appWrap.find('.app-dateField-btnCancel');
        self.app_btnOk = appWrap.find('.app-dateField-btnOk');
        self.app_center_con = appWrap.find('.app-dateField-center');
        self.app_y_con = appWrap.find('.app-dateField-year-con');
        self.app_m_con = appWrap.find('.app-dateField-month-con');
        self.app_d_con = appWrap.find('.app-dateField-date-con');
        self.app_cen_c = appWrap.find('.app-center-current');

        window.onresize = resize;
        resize();

        function resize(){
            self.app_center_con.find('ul').css({ 'width': appWrap.width() / 3 });
            if(self.opts.showYear && self.opts.showMonth && !self.opts.showDate){
                self.app_center_con.find('ul').css({ 'width': appWrap.width() / 2 });
                self.app_y_con.css({ left: 0 });
                self.app_m_con.css({ left: appWrap.width() / 2 });
                self.app_d_con.css({ left: appWrap.width() / 2 * 2, display: 'none' });
            }else if(!self.opts.showYear && self.opts.showMonth && self.opts.showDate){
                self.app_center_con.find('ul').css({ 'width': appWrap.width() / 2 });
                self.app_y_con.css({ left: 0, display: 'none' });
                self.app_m_con.css({ left: 0 });
                self.app_d_con.css({ left: appWrap.width() / 2 });
            }else if(self.opts.showYear && self.opts.showMonth && self.opts.showDate){
                self.app_y_con.css({ left: 0 });
                self.app_m_con.css({ left: appWrap.width() / 3 });
                self.app_d_con.css({ left: appWrap.width() / 3 * 2 });
            }
        }

        self.loaded = true;
        self.createYear();
        self.createMonth();
        self.createDate();


        self._events();
    };

    /**
     * 创建年份
     * @param up
     * @param down
     */
    APPDateField.prototype.createYear = function(up, down){
        var self = this;
        var up      = up    || self.opts.upYear;
        var down    = down  || self.opts.downYear;
        //this.app_y_con
        var now = new Date();
        var ny = now.getFullYear();
        var html = [];
        var li = '';
        var style = '';
        if(self.loaded){
            for(var j = 1; j < up + 1; j++){
                li = self.opts.isCN ? '<li'+ style +'>'+ (ny - j) +'年</li>' : '<li>'+ (ny - j) +'</li>';
                html.unshift(li);
            }
            for(var i = 0; i <= down; i++){
                li = self.opts.isCN ? '<li'+ style +'>'+ (ny + i) +'年</li>' : '<li>'+ self.dateFm((ny + i)) +'</li>';
                html.push(li);
            }
            self.app_y_con.html(html.join(''));
        }
        //self.currentTop = self.step * (up - 3);
        self.currentTop = self.step * ( self.opts.year - parseInt(self.app_y_con.find('li').eq(0).text()) - 3);
        self._scrollTop(self.app_y_con, -self.currentTop, true);
    };

    /**
     * 创建月份
     * @param n
     * @return {String}
     */
    APPDateField.prototype.createMonth = function(){
        var self = this;
        var now = new Date();
        var nm = self.dateFm(now.getMonth() + 1);
        var m = 1;
        var html = [];
        var li = '';
        if(self.loaded){
            while(m < 13){
                li = self.opts.isCN ? '<li>'+ m +'月</li>' : '<li>'+ self.dateFm(m) +'</li>';
                html.push(li);
                m++;
            }
            self.app_m_con.html(html.join(''));
        }
        self._scrollTop(self.app_m_con, -(self.step * parseInt(self.opts.month) - self.step * 4), true);
    };

    /**
     * 创建日
     * @param n
     * @return {String}
     */
    APPDateField.prototype.createDate = function(){
        var self = this;
        var now = new Date();
        var ny = now.getFullYear(),
            nm = self.dateFm(now.getMonth() + 1),
            nd = self.dateFm(now.getDate());
        var d = 0, pr = 31;
        var html = [];
        var li = '';
        if(self.loaded){
            if(self.opts.month == 2){
                //判断 平年(28) 和 闰年(29)
                pr = (((self.opts.year % 4 == 0 ) && (self.opts.year % 100 != 0)) || (self.opts.year % 400 == 0 )) ? 29 : 28;
                while(d < 31){
                    if(d >= pr){
                        li = self.opts.isCN ? '<li style="display:none;">'+ (d + 1) +'日</li>' : '<li style="display:none;">'+ self.dateFm((d + 1)) +'</li>';
                    }else{
                        li = self.opts.isCN ? '<li>'+ (d + 1) +'日</li>' : '<li>'+ self.dateFm((d + 1)) +'</li>';
                    }
                    html.push(li);
                    d++;
                }
            }else{
                while(d < 31){
                    li = self.opts.isCN ? '<li>'+ (d + 1) +'日</li>' : '<li>'+ self.dateFm((d + 1)) +'</li>';
                    html.push(li);
                    d++;
                }
            }
            self.app_d_con.html(html.join(''));
        }
        //var trh =  (parseInt(self.opts.date) * 50) <= 200 ? ''+ (200 - parseInt(self.opts.date) * 50) : ''+ (parseInt(self.opts.date) * 50 - 200);
        self._scrollTop(self.app_d_con, -(self.step * parseInt(self.opts.date) - self.step * 4), true);

        //console.log(self.valList)

    };

    //setter AND getter 设置和获取函数
    APPDateField.prototype.getYear = function(){
        this.year = parseInt(this.getCurrentTXT(this.app_y_con));
        return this.year;
    };
    APPDateField.prototype.setYear = function(year){
        this.year = year;
    };
    APPDateField.prototype.getMonth = function(){
        this.month = parseInt(this.getCurrentTXT(this.app_m_con));
        return this.month;
    };
    APPDateField.prototype.setMonth = function(month){
        this.month = month;
    };
    APPDateField.prototype.getDate = function(){
        //var num = Math.abs(Math.round(this.app_d_con.position().top) / 50);
        this.date = parseInt(this.getCurrentTXT(this.app_d_con));
        return this.date;
    };
    APPDateField.prototype.setDate = function(date){
        this.date = date;
    };
    /**
     * 获取当前值
     * @param moveEL (jQuery对象)
     * @returns {*|XMLList}
     */
    APPDateField.prototype.getCurrentTXT = function(moveEL){
        var num = Math.round(moveEL.position().top) / this.step;
        if(num == 0){
            num = 3;
        }else if(num >=1 && num <= 3){
            if(num == 1) num = 2
            else if(num == 2) num = 1;
            else if(num == 3) num = 0;
        }else if(num < 0){
            num = Math.abs(num) + 3;
        }
        var currentTXT = moveEL.find('li').eq(num).text();
        return currentTXT;
    };
    /**
     * 设置值
     * @param valList
     */
    APPDateField.prototype.setCurrentTXT = function(valList){
        var self = this;
        var vlist = valList;
        if(vlist && vlist.length > 0){
            if(!self.opts.showYear){
                vlist[0] = '';
            }
            if(!self.opts.showDate){
                vlist[2] = '';
            }
            self.opts.year = isNaN(parseInt(vlist[0])) ? self.opts.year : parseInt(vlist[0]);
            self.opts.month = isNaN(parseInt(vlist[1])) ? self.opts.month : parseInt(vlist[1]);
            self.opts.date = isNaN(parseInt(vlist[2])) ? self.opts.date : parseInt(vlist[2]);
        }

        //console.log(vlist);

        var dy = self.opts.isCN ? (self.opts.year + '年') : (self.opts.year + self.opts.commer),
            dm = self.opts.isCN ? (self.opts.month + '月') : (self.dateFm(self.opts.month) + self.opts.commer),
            dd = self.opts.isCN ? (self.opts.date + '日') : (self.dateFm(self.opts.date));

        if(self.opts.showYear && self.opts.showMonth && !self.opts.showDate){
            dy = self.opts.isCN ? (self.opts.year + '年') : (self.opts.year + self.opts.commer);
            dm = self.opts.isCN ? (self.opts.month + '月') : (self.dateFm(self.opts.month) + self.opts.commer);
            dd = '';
            self.selectElm.value = dy + dm;
        }else if(!self.opts.showYear && self.opts.showMonth && self.opts.showDate){
            dy = '';
            dm = self.opts.isCN ? (self.opts.month + '月') : (self.dateFm(self.opts.month) + self.opts.commer);
            dd = self.opts.isCN ? (self.opts.date + '日') : (self.dateFm(self.opts.date));
            self.selectElm.value = dm + dd;
        }else{
            self.selectElm.value = dy + dm + dd;
        }




        /*if(self.opts.isCN){
            dateValue = self.opts.year + '年' + self.opts.month + '月' + self.opts.date + '日';
        }else{
            dateValue = self.opts.year + self.opts.commer + self.dateFm(self.opts.month) + self.opts.commer + self.dateFm(self.opts.date);
        }*/
    };

    /**
     * 截取默认日期
     * @param dateString
     * @returns {Array}
     */
    APPDateField.prototype.subDefaultDate = function(dateString){

        var self = this, list = [];
        if(!dateString && dateString == ''){
            var date = new Date();
            list.push(date.getFullYear());
            list.push(date.getMonth() + 1);
            list.push(date.getDate());
        }else{
            if(self.opts.isCN){
                list = dateString.match(/(\d)+/gi);
            }else{
                list = dateString.split(self.opts.commer || '-');
            }
        }
        if(list.length == 3){
            if(!self.opts.showYear){
                list[0] = '';
            }
            if(!self.opts.showDate){
                list[2] = '';
            }
        }else{
            if(!self.opts.showYear){
                list.unshift('');
            }
            if(!self.opts.showDate){
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
    APPDateField.prototype.getCurrentDate = function(y, m, d, commer){
        var list = this.currDate;
        (!y || y == undefined || y == null || y == 0) ? y = list[0] : y;
        (!m || m == undefined || m == null || m == 0) ? m = list[1] : m;
        (!d || d == undefined || d == null || d == 0) ? d = list[2] : d;
        list[0] = y;
        list[1] = m;
        list[2] = d;
        //return list.join(commer || '/');
        return list;
    };

    /**
     * 初始化滚动动作,滚动到指定位置
     * @param elObj
     * @param y
     * @param flag
     * @private
     */
    APPDateField.prototype._scrollTop = function(elObj, y, flag){
       var flag = !flag ? flag : true;
        if(flag){
            elObj.stop().animate({'top': y}, 500, function(){
                var mesc = y % self.step;
                //console.log(mesc)
                if(mesc != 0){
                    var top = self.step * Math.round(y / self.step) - ( Math.abs(mesc) < self.step ? 0 : self.step);
                    $(this).animate({ top: top });
                }
            });
        }else{
            elObj[0].style.top = y + 'px';
        }
        //设置凸镜效果
        zoomOBJ(elObj, y);

    };

    /**
     *
     * @private
     */
    APPDateField.prototype._events = function(){
        var self = this;
        var app_y_con = self.app_y_con;
        var app_m_con = self.app_m_con;
        var app_d_con = self.app_d_con;
        var app_main = self.app_main;
        var appYCON_touch = new APPTouch(app_y_con[0], app_main[0], self.opts);
        var appMCON_touch = new APPTouch(app_m_con[0], app_main[0], self.opts);
        var appDCON_touch = new APPTouch(app_d_con[0], app_main[0], self.opts);

        //完成和取消按钮
        self.app_btnOk.bind('touchend', holdEvent(self, self._complate));
        self.app_btnCancel.bind('touchend', holdEvent(self, self._cancel));

        self.app_btnOk.bind('touchstart', self.endEvent);
        self.app_btnCancel.bind('touchstart', self.endEvent);

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
    APPDateField.prototype._complate = function(evt){
        //console.log(self.complate)
        //console.log(this.getYear())
        //console.log(this.getMonth())
        //console.log(this.getDate())
        var vlist = [];
        vlist.push(this.getYear());
        vlist.push(this.getMonth());
        vlist.push(this.getDate());

        this.currDate = vlist;
        //console.log(this.currDate)

        this.setCurrentTXT(vlist);

        this.appWrap.style.display = 'none';
        this.complate.call(this, evt);
    };
    /**
     * 日期选择 取消 事件
     * @param evt
     * @private
     */
    APPDateField.prototype._cancel = function(evt){
        this.appWrap.style.display = 'none';
    };
    /**
     * 日期格式化
     * @//param n
     * @return {String}
     */
    APPDateField.prototype.dateFm = function(n){
        return (n < 10) ? '0' + n : n;
    };

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////以下是滚动对象///////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * Touch对象
     * @param elmObj
     * @constructor
     */
    var APPTouch = function(elmObj, elmObjParent, options){
        //焦点对象
        this.elm = elmObj;
        //焦点父节点
        this.elmParent = elmObjParent;
        //是否具有Touch事件
        this.hasTouch = 'ontouchstart' in window || window.TouchEvent;
        this.isMobile = /Mobile/gi.test(navigator.userAgent);
        this.isTouchStart = false;
        this.options = options;

        //存储列表
        this.vlist = {
            year: this.options.year,
            month: this.options.month,
            date: this.options.date,
            hours: this.options.hours,
            minutes: this.options.minutes,
            seconds: this.options.seconds
        };

        //开始滚动时位置
        this.startY = 0;
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
        this.fontSize = gVars.fontSize;

        this.offset = {
            left: this.elmParent.offsetLeft,
            top: this.elmParent.offsetTop,
            width: $(this.elmParent).width(),
            height: $(this.elmParent).height()
        };
        this.startTime = Date.now || function getTime(){ return new Date().getTime(); };

        //触发时间侦听
        this._initEvent(elmObj);
    };

    APPTouch.prototype = {
        _initEvent: function(_elmObj){
            if(this.hasTouch){
                _elmObj.addEventListener('touchstart', this, false);
                _elmObj.addEventListener('touchmove', this, false);
                _elmObj.addEventListener('touchend', this, false);
            }else{
                _elmObj.addEventListener('mousedown', this, false);
                _elmObj.addEventListener('mousemove', this, false);
                _elmObj.addEventListener('mouseup', this, false);
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
        _start: function(evt, parentE){
            this.isTouchStart = true;
            this.y = this.top = $(this.elm).position().top;
            this.h = $(this.elm).height();
            this.startY = this.top;
            this.moveY = evt.pageY; //开始位置
            this.startTime = Date.now || function getTime(){ return new Date().getTime(); };
            //console.log('this.h = ' + this.h)
        },
        _move: function(evt, parentE){
            if(this.isTouchStart){
                var target = $(evt.target).parent('ul');
                target.find('li').css('fontSize', this.fontSize + 'em');
                this.dy = this.y - (this.moveY - evt.pageY);

                var top = this._formateTop(this.dy);
                this._scrollTop(target[0], top, true);

                //设置凸镜效果
                zoomOBJ(target, top);
            }
        },
        _end: function(evt, parentE){
            this.isTouchStart = false;
            var target = $(evt.target).parent('ul');

            //判断是上拖还是下拖
            ///this.dy = Math.abs((e.pageY - this.moveY)) * 50;
            var offset =  evt.pageY - this.moveY;
            var curTop = this.y + offset;
            var speed = offset / (new Date().getTime() - this.startTime);
            if(Math.abs(speed) > 0.5) {
                curTop -= speed * this.step;
            }

            var top = this._formateTop(curTop);
            this._scrollTop(target[0], top, false);

            //设置凸镜效果
            zoomOBJ(target, top);
        },
        /**
         * 判断高度越界
         * @param top
         * @return {*}
         * @private
         */
        _formateTop: function(top){
            if(top >= this.step * 3){
                top = this.step * 3;
            }else if(Math.abs(top) >= this.h - this.step * 4){
                top = -(this.h - this.step * 4);
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
            if(!el || el == '') { return false; }
            var y = y || 0;
            var flag = flag && true;
            var self = this;
            if(flag){
                el.style.top = y + 'px';
            }else{
                $(el).stop().animate({ top: y }, 10, function(){
                    var mesc = y % self.step;
                    //console.log(mesc)
                    if(mesc != 0){
                        var top = self.step * Math.round(y / self.step) - ( Math.abs(mesc) < self.step ? 0 : self.step);
                        $(this).animate({ top: top });
                        self.y = top;
                    }
                });
            }


            /////获取滚动end后的焦点值==-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-START
            if(!self.isTouchStart){
                var num = supperNumber(Math.round($(el).position().top / 50));
                /*if(num == 0){
                    num = 3;
                }else if(num >=1 && num <= 3){
                    if(num == 1) num = 2
                    else if(num == 2) num = 1;
                    else if(num == 3) num = 0;
                }else{
                    num = Math.abs(num) + 3;
                }*/
                var txt = $(el).find('li').eq(num).text();
                if($(el).hasClass('app-dateField-month-con')){
                    self.vlist.month = parseInt(txt);
                    var ynum = supperNumber(Math.round($('.app-dateField-year-con').position().top / self.step));
                    self.vlist.year = parseInt($('.app-dateField-year-con').find('li').eq(ynum).text());
                }else if($(el).hasClass('app-dateField-year-con')){
                    self.vlist.year = parseInt(txt);
                    var ynum = supperNumber(Math.round($('.app-dateField-month-con').position().top / self.step));
                    self.vlist.month = parseInt($('.app-dateField-month-con').find('li').eq(ynum).text());
                }else{
                    self.vlist.date = parseInt(txt);
                    var ynum = supperNumber(Math.round($('.app-dateField-year-con').position().top / self.step));
                    self.vlist.year = parseInt($('.app-dateField-year-con').find('li').eq(ynum).text());
                    var mnum = supperNumber(Math.round($('.app-dateField-month-con').position().top / self.step));
                    self.vlist.month = parseInt($('.app-dateField-month-con').find('li').eq(mnum).text());
                }

                //console.log(self.vlist)
                /////////////////////////////////////////////////////////////////--------------------------
                if($(el).hasClass('app-dateField-month-con') || $(el).hasClass('app-dateField-year-con')){
                    var pr = 0;
                    if(self.vlist.month == 2){
                        //判断 平年 和 闰年
                        pr = (((self.vlist.year % 4 == 0 ) && (self.vlist.year % 100 != 0)) || (self.vlist.year % 400 == 0 )) ? 29 : 28;
                        for(var i = 0; i < 31; i++){
                            if(i >= pr){
                                $('.app-dateField-date-con').find('li').eq(i).css('display', 'none');
                            }
                        }
                    }else{
                        for(var i = 0; i < 31; i++){
                            $('.app-dateField-date-con').find('li').eq(i).css('display', 'block');
                        }
                    }
                }
            }
            /////==-=-=-=-=-=-=-=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-END

        }



    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    

    /**
     * 改变对象作用域
     * @param obj
     * @param func
     * @return {Function}
     */
    var holdEvent = function(obj, func){
       var args = [];
        for(var i=2; i<arguments.length; i++){
            args.push(arguments[i]);
        }
        return function(e){
            args.push(e);
            func.call(obj, e, args);
        }
    };


    var supperNumber = function(num){
        if(num == 0){
            num = 3;
        }else if(num >=1 && num <= 3){
            if(num == 1) num = 2
            else if(num == 2) num = 1;
            else if(num == 3) num = 0;
        }else{
            num = Math.abs(num) + 3;
        }
        return num;
    };
    


    /**
     * 设置层凸镜效果
     * @param elObj
     * @param y
     */
    var zoomOBJ = function(elObj, y){
        //设置凸镜效果
        var index = Math.round(y / gVars.step);   //当前eq
        var count = Math.round(elObj.height() / gVars.step);  //总共的eq
        var dd = gVars.fontSize;
        //var somer = "  ";
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

        //循环缩放 上
        for(var i = 0; i < 4; i++){
            var li = elObj.find('li').eq(index - i);
            if(li[0]){
                li[0].style.fontSize = dd + 'em';
                //li.stop().css({ 'font-size': dd }, 1);
                //li[0].innerText = somer + li[0].innerText;
            }else{
                break;
            }
            //somer = somer + "  ";
            dd -= .3;
        }
        dd = gVars.fontSize;

        //循环缩放 下
        //somer = '  ';
        for(var j = 0; j < 4; j++){
            var li = elObj.find('li').eq(index + j);
            if(li[0]){
                li[0].style.fontSize = dd + 'em';
                //li.stop().css({ 'font-size': dd }, 1);
                //li[0].innerText = somer + li[0].innerText;
            }else{
                break;
            }
            //somer = somer + "  ";
            dd -= .3;
        }

    };

    "function" == typeof define ? define(function() {
        return APPDateField;
    }) : "undefined" != typeof exports ? module.exports = APPDateField : window.APPDateField = APPDateField;

}).call(this);





