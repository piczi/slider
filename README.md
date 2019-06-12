# slider
##dom结构
\<div class="scrollBox">
        \<ul class="slider-container">
            \<li class="slider-item">
                \<img src="./images/banner1.jpg"/>
            \</li>
            \<li class="slider-item">
                \<img src="./images/banner2.jpg"/>
            \</li>
            \<li class="slider-item">
                \<img src="./images/banner3.jpg"/>
            \</li>
        \</ul>
        \<button>上一页</button>
        \<button>下一页</button>
    \</div>
    #使用
    window.onload = function () {
            const scroll = new Slider('.scrollBox',{
                autoPlay: true,
                delay: 5000
            });

            scroll.on('scrollEnd',function () {
                console.log('当前为第' + (scroll.currentPage() + 1) + '页');
            });

            scroll.on('scrollStart',function () {
                console.log('滚动开始！');
            });

            scroll.on('beginPlay',function () {
                console.log('开始播放！');
            });

            scroll.on('stopPlay',function () {
                console.log('停止播放！');
            });

            scroll.start();

            const btns = document.querySelectorAll('button');
            btns[0].addEventListener('click',function () {
                scroll.prePage();
            },false);

            btns[1].addEventListener('click',function () {
                scroll.nextPage();
            },false);
        };
