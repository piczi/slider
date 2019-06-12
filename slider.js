(function () {
    var Slider = null;
    var diff = 0,lastTime = 0,count = 0;
    var moveXCurrent = -100,moveXLeaveIn = 0,size = 5;
    var Events = [],scrolling = false;
    var options = {},selector = '';

    //Object what to set slider doing thing
    var sliderOrders = {
        getContainer: function (selector) {
            var container = document.querySelector(selector);

            return container;
        },

        _getSliders: function () {
            var sliders = document.querySelectorAll('.slider-item');
            if (sliders.length > 0) {
                return sliders;
            } else {
                throw Error('cannot find DOM named as \"slider-items\"!');
            }
        },

        _changeItemsPosition(item,x) {
            item.style.transform = 'translateX(' + x + '%)';
        },

        _animation: function (direction,num) {
            const delta = Date.now() - lastTime;
            const items = sliderOrders._getSliders();
            direction = direction || 'next';
            num = num || null;
            let currentItem = items[count],secondItem = null;

            if (direction === 'next') {
                secondItem = items[count + 1] || items[0];
            } else {
                secondItem = items[count - 1] || items[items.length - 1];
            }

            if (num) {
                secondItem = items[num];
            }


            if (delta >= diff) {
                lastTime = Date.now();
                sliderOrders._countSize(direction);

                if (direction === 'next') {
                    if (moveXCurrent > -200) {
                        sliderOrders._setItemsPosition(currentItem,moveXCurrent,secondItem,moveXLeaveIn);
                        requestAnimationFrame(function () {
                            sliderOrders._animation(direction,num)
                        })
                    } else {
                        sliderOrders._setItemsPosition(currentItem,0,secondItem,-100);
                        moveXCurrent = -100;
                        moveXLeaveIn = 0;

                        if (!num) {
                            count >= items.length - 1 ? count = 0 : count += 1;
                        } else {
                            count = num;
                        }

                        sliderOrders.reviewEvent('scrollEnd');
                        scrolling = false;
                    }
                } else if (direction === 'pre') {
                    if (moveXCurrent < 0) {
                        sliderOrders._setItemsPosition(currentItem,moveXCurrent,secondItem,moveXLeaveIn);
                        requestAnimationFrame(function () {
                            sliderOrders._animation(direction)
                        });
                    } else {
                        sliderOrders._setItemsPosition(currentItem,0,secondItem,-100);
                        moveXCurrent = -100;
                        moveXLeaveIn = 0;

                        count === 0 ? count = items.length - 1 : count -= 1;
                        sliderOrders.reviewEvent('scrollEnd');
                        scrolling = false;
                    }
                }
            }
        },

        _countSize: function (direction) {
            if (direction === 'next') {
                moveXCurrent -= size;
                moveXLeaveIn -= size;
            } else if (direction === 'pre') {
                moveXCurrent += size;
                moveXLeaveIn += size;
            }
        },

        _setItemsPosition: function (currentItem,moveXCurrent,secondItem,moveXLeaveIn) {
            sliderOrders._changeItemsPosition(currentItem,moveXCurrent);
            sliderOrders._changeItemsPosition(secondItem,moveXLeaveIn);
        },

        initializeSlide: function (className,config) {
            options = config || {};
            selector = className;
            tools.setContainerHeight();
            this.items = sliderOrders._getSliders();
            sliderOrders._changeItemsPosition(this.items[0],-100);

            this.timer = void 0;
            this.container = sliderOrders.getContainer('.slider-container');
            this.startX = null;
            this.moveX = null;
            this.endX = null;
            this.percent = null;

            this._checkIsTouch();

            this._pageStateListener();
        },

        _isPageInView: function () {
            // 各种浏览器兼容
            var hidden, visibilityChange;
            if (typeof document.hidden !== "undefined") {
                hidden = "hidden";
                visibilityChange = "visibilitychange";
            } else if (typeof document.mozHidden !== "undefined") {
                hidden = "mozHidden";
                visibilityChange = "mozvisibilitychange";
            } else if (typeof document.msHidden !== "undefined") {
                hidden = "msHidden";
                visibilityChange = "msvisibilitychange";
            } else if (typeof document.webkitHidden !== "undefined") {
                hidden = "webkitHidden";
                visibilityChange = "webkitvisibilitychange";
            }

            return {
                hidden: hidden,
                visibilityChange: visibilityChange
            }
        },

        reviewEvent: function (eventName) {
            Events.forEach(function (item) {
                if (item.eventName === eventName) {
                    item.callBack();
                }
            });
        },

        initPrePage: function () {
            const items = sliderOrders._getSliders();
            var secondItem = items[count - 1] || items[items.length - 1];
            sliderOrders._changeItemsPosition(secondItem,-200);
            moveXLeaveIn = -200;
        },

        _diffX: function (startX,moveX) {
            return startX - moveX;
        },

        _pxTransformToPercent: function (startX,moveX) {
            var diff = sliderOrders._diffX(startX,moveX);
            var percent = null;

            if (diff !== 0) {
                percent = (diff / window.innerWidth * 100).toFixed(4);
            } else {
                percent = 0;
            }

            return percent;
        },
    };

    //开发用的逻辑
    var tools = {

        _checkIsTouch: function () {
            var isSupportTouch = "ontouchend" in document ? true : false;

            if (isSupportTouch) {
                this._fingerStateListener()
            } else {
                this._mouseStateListener();
            }
        },

        _moveFallowMouse: function (percent) {
            var currentDom = this.items[count];
            var nextDom = null,oldDom = null;

            if (percent < 0) {
                //还原先前的上一页
                oldDom = this.items[count === this.items.length - 1 ? 0 : count + 1];
                sliderOrders._changeItemsPosition(oldDom,0);

                nextDom = this.items[count === 0 ? this.items.length - 1 : count - 1];
                sliderOrders._setItemsPosition(currentDom,moveXCurrent - percent,nextDom,-200 - percent);
            } else if (percent > 0) {

                oldDom = this.items[count === 0 ? this.items.length - 1 : count - 1];
                sliderOrders._changeItemsPosition(oldDom,0);

                nextDom = this.items[count === this.items.length - 1 ? 0 : count + 1];
                sliderOrders._setItemsPosition(currentDom,moveXCurrent - percent,nextDom,0 - percent);
            }
        },
        setContainerHeight: function () {
            var itemOfSlider = sliderOrders.getContainer('.slider-item');
            var sliderContainer = sliderOrders.getContainer('.slider-container');

            sliderContainer.style.height = itemOfSlider.offsetHeight + 'px';
        },

        pageTotal: function () {
            var num = this.items.length;
            return num;
        },

        showPage: function () {
            return this.items;
        },

        currentPage: function () {
            return count;
        },

        prePage: function () {
            if (scrolling) return;
            sliderOrders.reviewEvent('scrollStart');
            this._stopScroll(this.timer);
            sliderOrders.initPrePage();
            this._turnOnePage('pre');
            options.autoPlay && (this.timer = this.beginInterval());
        },

        beginInterval: function () {
            var timer = this._changePage();

            return timer;
        },

        nextPage: function () {
            if (scrolling) return;
            sliderOrders.reviewEvent('scrollStart');
            this._stopScroll(this.timer);
            this._turnOnePage();
            options.autoPlay && (this.timer = this.beginInterval());
        },

        _changePage: function () {
            var self = this;
            sliderOrders.reviewEvent('beginPlay');
            const timer = setInterval(function () {

                sliderOrders.reviewEvent('scrollStart');
                self._turnOnePage();

            },options.delay || 5000);

            return timer;
        },

        _stopScroll: function (timer) {
            sliderOrders.reviewEvent('stopPlay');
            clearInterval(timer);
        },

        _pageStateListener: function () {
            var status = sliderOrders._isPageInView();
            var self = this;
            document.addEventListener(status.visibilityChange,function () {
                if (document[status.hidden]) {
                    self._stopScroll(self.timer);
                    console.log('用户关闭');
                } else {
                    options.autoPlay && (self.timer = self.beginInterval());
                    console.log('用户浏览');
                }
            },false)
        },

        _enterStart: function (e) {
            e.preventDefault();
            if (scrolling) return;
            this.startX = e.x || e.changedTouches[0].pageX;
            this._stopScroll(this.timer);
        },

        _moveing: function (e) {
            if (scrolling) return;

            if (this.startX !== null) {
                var percent = sliderOrders._pxTransformToPercent(this.startX,e.x || e.changedTouches[0].pageX);
                if (Math.abs(percent) > 100) return;
                this._moveFallowMouse(percent);
                this.percent = percent;
            }
        },

        _moveEnd: function () {
            if (scrolling) return;
            if (this.startX === null) return;

            if (this.percent > 0) {
                moveXCurrent = moveXCurrent - this.percent;
                moveXLeaveIn = 0 - this.percent;
                this._turnOnePage('next');
            } else if (this.percent < 0) {
                moveXCurrent = moveXCurrent - this.percent;
                moveXLeaveIn = -200 - this.percent;
                this._turnOnePage('pre');
            }

            options.autoPlay && (this.timer = this.beginInterval());

            this.startX = null;
        },

        _mouseStateListener: function () {
            const self = this;
            this.container.addEventListener('mousedown',function (e) {
                self._enterStart(e);
            },false);

            this.container.addEventListener('mousemove',function (e) {
                self._moveing(e);
            },false);

            this.container.addEventListener('mouseup',function () {
                self._moveEnd();
            },false);

            this.container.addEventListener('mouseout',function () {
                if (self.startX !== null) {
                    self._moveEnd();
                }
            },false);
        },

        _fingerStateListener: function () {
            const self = this;
            this.container.addEventListener('touchstart',function (e) {
                self._enterStart(e);
            },false);

            this.container.addEventListener('touchmove',function (e) {
                self._moveing(e);
            },false);

            this.container.addEventListener('touchend',function () {
                self._moveEnd();
            },false)
        },

        jumpToPage: function (num) {
            if (scrolling) return;
            var allPage = this.pageTotal();

            if (num >= allPage) {
                console.log('下标越界');
                return;
            }

            if (num !== count) {
                this._turnOnePage(null,num);
            };
        },

        _turnOnePage: function (direction,num) {
            direction = direction || 'next';
            num = num || null;
            scrolling = true;
            sliderOrders._animation(direction,num)
        },

        _addEvent: function (event) {
            Events.push(event);
        },

        start: function () {
            this.timer = this.beginInterval();
        },

        stop: function () {
            this._stopScroll(this.timer);
        },

        //事件绑定，支持切换前(scrollBegin)、切换后(scrollEnd)、开始前(startPlay)、停止后(stopPlay).
        on: function (eventName,callback) {
            this._addEvent({eventName: eventName,callBack: callback});
        }
    };

    sliderOrders.initializeSlide.prototype = tools;

    window.onresize = function () {
        tools.setContainerHeight();
    };

    Slider = sliderOrders.initializeSlide;

    if ( typeof module != 'undefined' && module.exports ) {
        module.exports = Slider;
    } else if ( typeof define == 'function' && define.amd ) {
        define( function () { return Slider; } );
    } else {
        window.Slider = Slider;
    }
})();