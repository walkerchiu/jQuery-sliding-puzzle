/*
* Sliding Puzzle
*
* https://github.com/walkerchiu/jQuery-sliding-puzzle
*
*/

(function(factory){
    if (typeof define === 'function' && define.amd) {   /* RequireJS */
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {           /* Backbone.js */
        factory(require('jquery'));
    } else {                                            /* Jquery plugin */
        factory(jQuery);
    }
}(function($){
    'use strict';

    var obj, settings, distance, url;
    var gametimer, counter, duration;
    var showTag = 0, showTip = 1, showPic = 0;
    var puzzle_orign, puzzle_work;
    var rx, ry;
    var padding = 0;
    let scores = {
        reset: function () {
            this.step_total = 0;
            this.step_now = 0;
            this.success = 0;
        }
    };
    let DefaultSettings = {
        'outerWidth': $(window).outerWidth(),
        'outerHeight': $(window).outerHeight(),
        'width': 3,
        'height': 3,
        'distance': 100,
        'task': 'num',
        'duration': 300,
        'entropy': 500
    };

    const Timer = function Timer(fn, t) {
        var timerObj = setInterval(fn, t);
        this.stop = function () {
            if (timerObj) {
                clearInterval(timerObj);
                timerObj = null;
            }
            return this;
        }
        this.start = function () {
            if (!timerObj) {
                this.stop();
                timerObj = setInterval(fn, t);
            }
            return this;
        }
        this.adjust = function (newT) {
            t = newT;
            return this.stop().start();
        }
        this.reset = function (d) {
            duration = d;
            return this.stop().start();
        }
    }
    const isEqual = function (value, other) {
        for (var i = 0; i < value.length; i++)
            if ((value[i] !== other[i])) return false;
        return true;
    };
    const delay = function (s) {
        return new Promise( function (resolve,reject) {
            setTimeout(resolve,s); 
        });
    };

    function countDown(type, timer) {
        let minutes, seconds, result;
        duration = settings.duration;

        function formater() {
            minutes = parseInt(duration / 60, 10)
            seconds = parseInt(duration % 60, 10);

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;
            result = minutes + ":" + seconds;

            timer.html(result);

            if (result == "00:00") { counter.stop(); GameOver(); }
            duration = (--duration < 0) ? timer : duration;
        }
        formater();

        if (type) counter = new Timer(formater, 1000);
        else      counter.reset(duration);
    }
    function initPicSelector() {
        let selector_w = obj.find(".game-option .game-pic-w"),
            selector   = obj.find(".game-option .game-pic");
        selector_w.empty(); selector.empty();
        $.each(items.pic, function (index, value) {
            selector_w.append($("<option>", {'value': index, 'text':value[0][2]}));
        });
        $.each(items.pic[0], function (index, value) {
            selector.append($("<option>", {'value': value[1], 'text':value[0], 'data-width': value[2], 'data-height': value[3]}))
        });
        selector.find('option:eq(0)').prop('selected', true);
    }
    function initContainer() {
        distance = settings.distance;
        let w = settings.outerWidth,
            h = settings.outerHeight;
        if (settings.task == 'pic') {
            w -= 40;
            h -= 40;
        }
        do {
            if (distance*settings.width < w && distance*settings.height < h)
                break;
            else
                distance--;
        } while(1);
    }
    function initShow() {
        obj.find(".game-wrap").empty().css("width", settings.width * distance).css("height", settings.height * distance);
        obj.find(".game-step-total").html(scores.step_total);
        obj.find(".game-step-now").html(scores.step_now);
        obj.find(".game-score-success").html(scores.success);

        let size = settings.width * settings.height;
        let li;

        if (settings.task == 'pic') {
            if (showTip) padding = 20;
            obj.find(".game-wrap").css("background", "no-repeat url('"+url+"') 0px 0px");
            obj.find(".game-wrap").css("padding", padding)
                                  .css("width", (settings.width * distance)+(padding*2))
                                  .css("height", (settings.height * distance)+(padding*2));
            obj.find("item").css("box-shadow", "none");
        } else {
            padding = 0;
        }

        let i = 0;
        let bh = -padding;
        let bv = -padding;
        puzzle_orign = []; puzzle_work = [];
        for (let y=0; y<settings.height; y++) {
            puzzle_orign.push([]); puzzle_work.push([]);
            for (let x=0; x<settings.width; x++) {
                li = $("<li>", {'class': "item", 'data-id': i, 'data-pos': x+'_'+y}).append($("<span>", {'class': "item-tag", 'text': i+1}));
                if (settings.task == 'pic') {
                    li.append($("<div>", {'class': "item-data hidden", 'text': i+1}))
                      .css('background', "transparent no-repeat url('"+url+"') "+bh+"px "+bv+"px");
                    puzzle_orign[y].push(i);
                    puzzle_work[y].push(i);
                }
                else if (settings.task == 'num') {
                    li.append($("<div>", {'class': "item-data", 'text': i+1}));
                    puzzle_orign[y].push(i);
                    puzzle_work[y].push(i);
                }
                else if (settings.task == 'en') {
                    let tmp = (typeof items.en[i] === 'undefined') ? "" : items.en[i];
                    li.append($("<div>", {'class': "item-data", 'text': tmp}));
                    puzzle_orign[y].push(tmp);
                    puzzle_work[y].push(tmp);
                }
                else if (settings.task == 'tw') {
                    let tmp = (typeof items.tw[i] === 'undefined') ? "" : items.tw[i];
                    li.append($("<div>", {'class': "item-data", 'text': tmp}));
                    puzzle_orign[y].push(tmp);
                    puzzle_work[y].push(tmp);
                }
                obj.find(".game-wrap").append(li);
                bh-=100;
                i++;
            }
            bh = -padding;
            bv-=100;
        }
        obj.find("li").css("width", distance).css("height", distance);
        obj.find(".item-data").css("width", distance).css("height", distance).css("line-height", distance + 'px');

        let r = Math.floor(Math.random() * size);
        rx = r % settings.width;
        ry = Math.floor(r/settings.width);
        li = obj.find("li[data-id='"+r+"']");
        li.removeClass("item").addClass("item-empty");
        if (settings.task == 'pic') {
            li.data("background", li.find(".item-data").css("background")).css('background', "");
        }
        li.find(".item-data").remove();
        puzzle_orign[ry][rx] = -1;
        puzzle_work[ry][rx]  = -1;
        disarray();
        counter.start();
        if (showTag) obj.find(".item-tag").show();
        if (showPic) obj.find(".item-data").removeClass("hidden");
        if (showTip) obj.find(".game-wrap li").addClass("item-tip");
    }
    function change(status, from, to) {
        let a = obj.find("li[data-pos='"+from[0]+'_'+from[1]+"']");
        let b = obj.find("li[data-pos='"+to[0]+'_'+to[1]+"']");
        let tmp;

        a.toggleClass("item").toggleClass("item-empty");
        b.toggleClass("item").toggleClass("item-empty");

        tmp = a.find(".item-data");
        a.find(".item-data").remove();
        b.append(tmp);
        if (settings.task == 'pic') {
            tmp = a.css("background");
            a.css("background", b.css("background"));
            b.css("background", tmp);
        }

        tmp = puzzle_work[from[1]][from[0]];
        puzzle_work[from[1]][from[0]] = puzzle_work[to[1]][to[0]];
        puzzle_work[to[1]][to[0]] = tmp;
        if (status) {
            obj.find(".game-step-now").html(++scores.step_now);
            obj.find(".game-step-total").html(++scores.step_total);
        }
    }
    function disarray() {
        let entropy = settings.entropy;
        let r;
        let top, right, left, bottom, value;
        do {
            r = Math.floor((Math.random() * 4));
            top    = [rx,   ry-1];
            right  = [rx+1, ry];
            left   = [rx-1, ry];
            bottom = [rx,   ry+1];
            value = [right, left, top, bottom][r];

            if (value[0] >= 0 && value[0] < settings.width && value[1] >= 0 && value[1] < settings.height) {
                change(0, value, [rx, ry]);
                rx = value[0]; ry = value[1];
                entropy--;
            }
        } while (entropy > 0);
    }
    function clear() {
        counter.stop();
        if (settings.task == 'pic') {
            obj.find(".game-wrap li").addClass("item-success");
            obj.find(".game-wrap li.item-empty").css("background", obj.find(".game-wrap li.item-empty").data("background"))
                                                .removeClass("item-empty").addClass("item");
        }
        delay(1000).then( function () {
            let title = $("<div>", {'class': "lead", 'text': "Success!"}).css("line-height", distance*settings.height + 'px');
            obj.find(".game-wrap").css("padding", 0).html($("<li>", {'class': "game-success"}).append(title)
                                                                    .css("width", distance*settings.width+(padding*2)).css("height", distance*settings.height+(padding*2))
                                                                    .css("line-height", distance*settings.height + 'px'));
            return delay(300);
        }).then( function () {
            if (showTip) padding = 20;
            initShow();
        });
    }
    function GameOver() {
        let title = $("<div>", {'class': "lead", 'text': "~ Game Over ~"});
        let score = $("<p>").html("Success: "+scores.success);
        let moves = $("<p>").html("Total Moves: "+scores.step_total);
        let li = $("<li>", {'class': "game-over"}).append(title).append(score).append(moves)
                                                  .css("width", distance*settings.width+(padding*2))
                                                  .css("height", distance*settings.height+(padding*2));
        obj.find(".game-wrap").css("padding", 0).prepend(li).children("li.game-over").fadeIn();
    }

    $.fn.SlidingPuzzle_init = function (options) {
        settings = $.extend(DefaultSettings, options);
        gametimer = $(this).find(".game-timer");
        obj = $(this);
        scores.reset();
        initPicSelector();

        obj.find(".game-option .game-width").val(settings.width);
        obj.find(".game-option .game-height").val(settings.height);
        obj.find(".game-option .game-duration").val(settings.duration);

        $(this).on("click", ".item", function () {
            if ($(this).hasClass("item-success")) return;

            let thisId = $(this).data("id");
            let thisX  = Number($(this).data("pos").split("_")[0]);
            let thisY  = Number($(this).data("pos").split("_")[1]);
            let top    = [thisX,   thisY-1];
            let right  = [thisX+1, thisY];
            let left   = [thisX-1, thisY];
            let bottom = [thisX,   thisY+1];

            $.each([right, left, top, bottom], function (index, value) {
                if (value[0] >= 0 && value[0] < settings.width && value[1] >= 0 && value[1] < settings.height && puzzle_work[value[1]][value[0]] == -1) {
                    change(1, [thisX, thisY], value);
                    return false;
                }
            });
            if (!!puzzle_work && !!puzzle_orign && !(puzzle_work<puzzle_orign || puzzle_orign<puzzle_work)) {
                console.log("Finish");
                obj.find(".game-score-success").html(++scores.success);
                scores.step_now = 0;
                obj.find(".game-step-now").html(scores.step_now);
                clear();
            }
        });
        $(this).on("change", ".game-pic-w", function () {
            let selector   = obj.find(".game-option .game-pic");
            selector.empty();
            $.each(items.pic[$(this).val()], function (index, value) {
                selector.append($("<option>", {'value': value[1], 'text':value[0], 'data-width': value[2], 'data-height': value[3]}))
            });
            selector.find('option:eq(0)').prop('selected', true);
        });
        $(this).on("click", ".option-btn", function () {
            obj.find(".game-option").slideToggle();
            obj.find(".restart-btn").toggle(); $(this).toggle();
        });
        $(this).on("click", ".switchTag", function () {
            obj.find(".item-tag").toggle();
            showTag = !showTag;
        });
        $(this).on("click", ".switchTip", function () {
            padding = ($(this).is(":checked")) ? 20 : 0;
            if (padding == 20)
                obj.find(".game-wrap").css("background", "no-repeat url('"+url+"') 0px 0px");
            else
                obj.find(".game-wrap").css("background", "none");
            obj.find(".game-wrap li").toggleClass("item-tip");
            showTip = !showTip;
        });
        $(this).on("click", ".switchPic", function () {
            obj.find(".item-data").toggleClass("hidden");
            showPic = !showPic;
        });
        $(this).on("click", ".close-btn", function () {
            obj.find(".game-option").slideUp();
            obj.find(".option-btn").show();
            obj.find(".restart-btn").hide();
        });
        $(this).on("click", ".restart-btn", function () {
            settings.duration = obj.find(".game-option .game-duration").val();
            if (settings.task == 'pic') {
                settings.width  = obj.find(".game-option .game-pic option:selected").data('width');
                settings.height = obj.find(".game-option .game-pic option:selected").data('height');
                padding = 20;
            } else {
                settings.width  = obj.find(".game-option .game-width").val();
                settings.height = obj.find(".game-option .game-height").val();
            }
            url = obj.find(".game-option .game-pic option:selected").val();

            scores.reset();
            countDown(0, gametimer);
            initContainer();
            initShow();
            if (showTip)
                obj.find(".game-wrap li").addClass("item-tip");
            else
                obj.find(".game-wrap").css("background", "none");
            obj.find(".game-option").slideUp();
            obj.find(".option-btn").show(); $(this).hide();
        });

        if (settings.task == 'pic') {
            countDown(1, gametimer);
            $(".restart-btn").trigger("click");
        } else {
            initContainer();
            countDown(1, gametimer);
            initShow();
        }
    };

    const items = {'pic': [[['A','https://example.com/a.jpg',2,2]],
                           [['B','https://example.com/b.jpg',3,3]],
                           [['C','https://example.com/c.jpg',4,2],
                            ['D','https://example.com/d.jpg',4,5]]],
                   'en': ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],
                   'tw': ['ㄅ','ㄆ','ㄇ','ㄈ','ㄉ','ㄊ','ㄋ','ㄌ','ㄍ','ㄎ','ㄏ','ㄐ','ㄑ','ㄒ','ㄓ','ㄔ','ㄕ','ㄖ','ㄗ','ㄘ','ㄙ','ㄧ','ㄨ','ㄩ','ㄚ','ㄛ','ㄜ','ㄝ','ㄞ','ㄟ','ㄠ','ㄡ','ㄢ','ㄣ','ㄤ','ㄥ','ㄦ'] };

}));
