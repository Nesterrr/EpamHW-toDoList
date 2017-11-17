var initHTML = document.querySelector('.toDoList');

var MODULE = (function() {
    var htmlTemplate = {
        wrap: 'section',

        html: ' <input type=\"checkbox\" class=\"task__checkbox\" {{state}}>' +
        ' <label class=\"task__title\ {{state}}">{{title}} {{date}}</label>' +
        ' <button class=\"deleteTask\">Delete</button>',

        addTask:
        '<input type = text class=\"task__input\">' +
        '<input type="date" class="cal">' +
        '<button type=\"button\" class=\"task__add-button\">add</button>',

        filters: '<div class="checkTask today">сегодня</div><div class="checkTask tomorrow">завтра</div><div class="checkTask week">неделя</div><button type="button" class="checkTask removeFilter">X</button>'
    }

    var toDoListRenderWrap = document.createElement('div');

    function init(html, initData) {
        var data =  JSON.parse(localStorage.getItem("toDoList")) || initData;

        var toDoListElem = document.createElement('section');

        var initParams = {
            html: html,
            data: data,
            toDoListElem: toDoListElem,
            proxy: {}
        }

        var application = new App(initParams);

        // Отрисовываем страницу

        application.render();

        // Привязываем обраотчики к массиву
        application.createProxy();

        // Делигируем обработчик приложению
        application.eventListeners();

        initParams.input = document.querySelector('.task__input');
        initParams.cal = document.querySelector('.cal');
    }

    var App = function App(initParams) {
        this.initHtml = initParams.html;
        this.data = initParams.data;
        this.toDoElem = initParams.toDoListElem;
        this.proxy = initParams.proxy;
    }
    App.prototype.templater = function(html) {
        return function(items) {
            for (var x in items) {
                var re = '{{\\s?' + x + '\\s?}}';
                html = html.replace(new RegExp(re, 'ig'), items[x]);
            }
            return html;
        };
    };

    App.prototype.createProxy = function () {
        var self = this;
        this.proxy = new Proxy(this.data, {
            set(target, prop, value) {
                target[prop] = value;
                self.render();

                localStorage.setItem('toDoList', JSON.stringify(self.data));

                return true;
            }
        });
        return this.proxy;
    }

    App.prototype.render = function (filter) {
        let dt = filter || this.data;

        this.initHtml.appendChild(toDoListRenderWrap);

        if(toDoListRenderWrap) {
            toDoListRenderWrap.parentNode.removeChild(toDoListRenderWrap);
            toDoListRenderWrap = document.createElement('div');

            this.initHtml.appendChild(toDoListRenderWrap);
        }

        var filters = document.createElement('section');

        filters.className = 'filters';
        filters.innerHTML = htmlTemplate.filters;

        toDoListRenderWrap.appendChild(filters);

        var addBtn = document.createElement('section');

        // Счётчик, для индексации тасков при отрисовке

        var i = 0;

        // Создаем Node-таски из массива

        dt.forEach((item) => {
            item.renderId = i;

            var elem = document.createElement('section');

            elem.className = item.renderId;
            elem.innerHTML = this.templater(htmlTemplate.html)(item);
            toDoListRenderWrap.appendChild(elem);
            if(item.state === true) {
                elem.children[0].checked = 'checked';//item.state;
            }
            i++;
        });

        // Кнопка добавления тасков

        addBtn.innerHTML = htmlTemplate.addTask;

        toDoListRenderWrap.appendChild(addBtn);

        // Отрисовываем тудуЛист

        this.initHtml.appendChild(toDoListRenderWrap);
        console.log('render');
        return this;
    }

    App.prototype.eventListeners = function () {
        this.initHtml.addEventListener('click', (event) => {

            var target = event.target;
            if(target.className === 'task__add-button') {
                event.preventDefault();
                this.add();
            }
            if(target.classList[0] === 'deleteTask') {
                event.preventDefault();

                this.del(target.parentNode.className);
            }
            if(target.classList[0] === 'checkTask') {
                this.filters(target.classList);
            }
            if(target.classList[0] === 'task__checkbox') {
                event.preventDefault();
                this.setState(target.parentNode.className);
            }
        });
    }

    App.prototype.add = function () {
        const input = document.querySelector('.task__input');
        const cal = document.querySelector('.cal');

        this.proxy.push({
                        id: this.data.length + 1,
                        title: input.value,
                        date: cal.value,
                        state: ''
                   });
    }
    
    App.prototype.del = function (num) {
        this.proxy.splice(num, 1);
    }
    App.prototype.setState = function (num) {
        this.proxy[num].state = !this.proxy[num].state;
        localStorage.setItem('toDoList', JSON.stringify(this.data));
        this.render();
    }
    App.prototype.filters = function (target) {

        const DAY = 60 * 60 * 12 * 1000;

        const TOMORROW = 60 * 60 * 48 * 1000;

        const WEEK = 60 * 60 * 24 * 1000 * 7;

        const self = this;

        function getFiltered(time) {
            if(time === 0) {
                return self.data;
            } else {
                var now = Date.now();
                return res = self.data.filter((item) => {

                    var ms = Date.parse(item.date);
                    if (ms < now + time) { //&& ms > now) {
                        return true;
                    }
                });
            }
        }

        switch(target[1]) {
            case 'today':
                self.render(getFiltered(DAY));
                break;
            case 'tomorrow':
                self.render(getFiltered(TOMORROW));
                break;
            case 'week':
                self.render(getFiltered(WEEK));
                break;
            case 'removeFilter':
                self.render(getFiltered(0));
                break;
        }
    }
    return  {
        init: init
    }
})();

MODULE.init(initHTML, initData);