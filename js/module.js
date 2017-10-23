var initHTML = document.querySelector('.toDoList');

var MODULE = (function() {
    var initData = [
        {
            id: 0,
            renderId: 0,
            title: 'first',
            date: '2017-10-24 ',
            state: true
        },
        {
            id: 1,
            renderId: 0,
            title: 'second',
            date: '2017-10-25 ',
            state: false
        },
        {
            id: 2,
            renderId: 0,
            title: 'third',
            date: '2017-10-28 ',
            state: false
        }
    ];
    var htmlTemplate = {
        wrap: 'section',

        html: ' <input type=\"checkbox\" class=\"task__checkbox\" {{state}}>' +
        ' <label class=\"task__title\ {{state}}">{{title}} {{date}}</label>' +
        ' <button class=\"deleteTask\">Delete</button>',

        addTask:
        '<input type = text class=\"task__input\">' +
        '<input type="date" class="cal">' +
        '<button type=\"button\" class=\"task__add-button\">add</button>',

        filters: '<div class="checkTask today">сегодня</div><div class="checkTask tomorrow">завтра</div><div class="checkTask week">неделя</div>'

    }

    var toDoListRenderWrap = document.createElement('div');

    function init(html) {
        var data =  JSON.parse(localStorage.getItem("toDoList")) || initData;

        var toDoListElem = document.createElement('section');

        var application = new App(html, data, toDoListElem);


        // Отрисовываем страницу

        application.render();

        // Привязываем обраотчики к массиву
        application.createProxy();

        // Делигируем обработчик приложению
        application.eventListeners();
    }

    var App = function App(initHtml, initData, toDoListElem, proxy) {
        this.initHtml = initHtml;
        this.data = initData;
        this.toDoElem = toDoListElem;
        this.proxy = proxy || {};
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
            get(target, prop) {

                self.render(this);

                 localStorage.setItem('toDoList', JSON.stringify(self.data));

                return target[prop];
            },
            set(target, prop, value) {
                target[prop] = value;
                self.render(self.data);
                localStorage.setItem('toDoList', JSON.stringify(self.data));
                return true;
            }
        });
        return this.proxy;
    }

    App.prototype.render = function () {
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

        this.data.forEach((item) => {
            item.renderId = i;

            var elem = document.createElement('section');

            elem.className = item.renderId;
            elem.innerHTML = this.templater(htmlTemplate.html)(item);
            toDoListRenderWrap.appendChild(elem);
            if(item.state === true) {
                elem.children[0].checked = item.state;
            }
            i++;
        });

        // Кнопка добавления тасков

        addBtn.innerHTML = htmlTemplate.addTask;

        toDoListRenderWrap.appendChild(addBtn);

        // Отрисовываем тудуЛист

        this.initHtml.appendChild(toDoListRenderWrap);

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
        var input = document.querySelector('.task__input');
        var cal = document.querySelector('.cal');

        this.proxy.push({
                        id: this.data.length + 1,
                        title: input.value,
                        date: cal.value,
                        state: false
                   });
    }
    
    App.prototype.del = function (num) {
        this.proxy.splice(num, 1);
    }
    App.prototype.setState = function (num) {
        this.proxy[num].state = !this.proxy[num].state;
    }
    App.prototype.filters = function (target) {

        var day = 60 * 60 * 24 * 1000;

        var tomorrow = 60 * 60 * 60 * 24 * 1000 * 2;

        var week = 60 * 60 * 60 * 24 * 1000 * 7;

        var self = this;

        function getFiltered(time) {
            var now =  Date.now();
            return res = self.proxy.filter((item) => {

                var ms = Date.parse(item.date);
                if(ms < now + time && ms > now) {
                   return true;
                }
            });
        }
        function renderFilter(time) {
            getFiltered(time);
            self.proxy.splice(0, self.proxy.length);
            res.forEach((item)=>{
                self.proxy.push(item);
            });
        }
        switch(target[1]) {
            case 'today':
                console.log(1);
                renderFilter(day);
                break;
            case 'tomorrow':
                console.log(2);
                renderFilter(tomorrow);
                break;
            case 'week':
                console.log(3);
                renderFilter(week);
                break;
        }
    }
    return  {
        init: init
    }


})();

MODULE.init(initHTML);