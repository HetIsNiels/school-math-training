var Rekenen = (function () {
    function Rekenen() {
    }
    Rekenen.setupListeners = function () {
        document.body.addEventListener('click', Rekenen.clickHandler, false);
        Rekenen.setupAnimations();
        if (window.location.hash.indexOf('hardcore') != -1) {
            Rekenen.tables.push(Math.PI);
            Rekenen.multipliers.push(Math.PI);
        }
        Rekenen.calculateTables();
    };
    Rekenen.setupAnimations = function () {
        var methods = document.getElementById('buttons').getElementsByClassName('title');
        for (var methodIndex = 0; methodIndex < methods.length; methodIndex++) {
            var method = methods.item(methodIndex);
            method.style.top = method.offsetTop + 'px';
            console.log(method.offsetTop);
        }
    };
    Rekenen.calculateTables = function () {
        Rekenen.tables.forEach(function (table) {
            var element = document.createElement('button');
            element.id = 'table-button-' + (table == Math.PI ? 'PI' : table.toString());
            element.classList.add('table-button');
            element.setAttribute('data-table', table.toString());
            element.setAttribute('data-action', 'removeTables;setTable;startTask');
            element.textContent = 'Tafel van ' + table;
            document.getElementById('table-selection').appendChild(element);
        });
        var element = document.createElement('button');
        element.id = 'table-button-random';
        element.classList.add('table-button');
        element.setAttribute('data-table', 'random');
        element.setAttribute('data-action', 'removeTables;setTable;startTask');
        element.textContent = 'Willekeurig';
        document.getElementById('table-selection').appendChild(element);
    };
    Rekenen.clickHandler = function (event) {
        var element = event.target;
        if (element.parentNode.hasAttribute('data-action'))
            element = element.parentNode;
        var condition = element.getAttribute('data-condition');
        var action = element.getAttribute('data-action');
        if (action == null)
            return;
        if (condition != null) {
            condition = condition.toLowerCase();
            if (condition == 'taskis' && Rekenen.task != element.getAttribute('data-condition-task'))
                return;
            else if (condition == 'taskisnot' && Rekenen.task == element.getAttribute('data-condition-task'))
                return;
        }
        event.preventDefault();
        action.split(';').forEach(function (action) {
            Rekenen.handleAction(action, element);
        });
    };
    Rekenen.prepareTask = function (task) {
        if (task == null)
            return;
        if (task.toLowerCase() == 'train') {
            if (Rekenen.randomTable) {
                document.getElementById('task-train').innerHTML = '<h1>Willekeurige tafels oefenen kan niet!</h1>';
                return;
            }
            document.getElementById('task-train').innerHTML = '<h1>Tafel van ' + Rekenen.table + '</h1>';
            Rekenen.multipliers.forEach(function (i) {
                var element = document.createElement('div');
                element.classList.add('table');
                element.textContent += i + ' x ' + Rekenen.table + ' = ' + (Rekenen.table * i);
                document.getElementById('task-train').appendChild(element);
            });
        }
        else if (task.toLowerCase() == 'quiz') {
            if (!Rekenen.randomTable)
                document.getElementById('task-quiz').innerHTML = '<h1>Tafel van ' + Rekenen.table + '</h1>';
            else
                document.getElementById('task-quiz').innerHTML = '<h1>Willekeurige tafels</h1>';
            var results = document.createElement('div');
            results.id = 'quiz-results';
            results.className = 'notif hidden clickable';
            var form = document.createElement('form');
            document.getElementById('task-quiz').appendChild(results);
            Rekenen.multipliers.forEach(function (i) {
                var table = (Rekenen.randomTable ? Rekenen.tables[Math.floor(Math.random() * Rekenen.tables.length)] : Rekenen.table);
                var multiplier = (Rekenen.randomTable ? Rekenen.multipliers[Math.floor(Math.random() * Rekenen.tables.length)] : i);
                var element = document.createElement('div');
                element.classList.add('table');
                element.textContent += multiplier + ' x ' + table + ' = ';
                var input = document.createElement('input');
                input.type = 'number';
                input.required = true;
                input.min = '0';
                input.max = '999';
                input.placeholder = element.textContent;
                input.setAttribute('data-solution', (table * multiplier).toString());
                element.appendChild(input);
                form.appendChild(element);
            });
            var button = document.createElement('button');
            button.setAttribute('data-action', 'quizValidate');
            button.className = 'big';
            button.textContent = 'Resultaten bekijken';
            form.appendChild(button);
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                Rekenen.handleAction('quizValidate', form);
            });
            document.getElementById('task-quiz').appendChild(form);
        }
    };
    Rekenen.handleAction = function (action, element) {
        switch (action.toLowerCase()) {
            case 'settask':
                var task = element.getAttribute('data-task');
                if (task == null)
                    break;
                Rekenen.task = task;
                break;
            case 'closetask':
                var query = document.querySelectorAll('.view.shown');
                if (query.length > 0)
                    query.item(0).classList.remove('shown');
                Rekenen.task = null;
                break;
            case 'resettable':
                Rekenen.table = null;
                break;
            case 'togglebuttons':
                document.getElementById('buttons').classList.toggle('hidden');
                if (!document.getElementById('buttons').classList.contains('hidden')) {
                    var query = document.querySelectorAll('.title.active');
                    if (query.length > 0) {
                        query.item(0).classList.remove('active');
                        query.item(0).classList.add('inactive');
                    }
                    document.getElementById('header').classList.remove('showArrow');
                }
                else
                    document.getElementById('header').classList.add('showArrow');
                break;
            case 'settitlechild':
                var titleElement = element.getElementsByClassName('title').item(0);
                if (titleElement != null) {
                    titleElement.classList.remove('inactive');
                    titleElement.classList.add('active');
                }
                break;
            case 'selecttables':
                document.getElementById('table-selection').classList.add('shown');
                break;
            case 'removetables':
                document.getElementById('table-selection').classList.remove('shown');
                break;
            case 'starttask':
                Rekenen.prepareTask(Rekenen.task);
                document.getElementById('task-' + Rekenen.task).classList.add('shown');
                break;
            case 'settable':
                var table = element.getAttribute('data-table');
                if (table == null)
                    break;
                else
                    Rekenen.randomTable = table.toLowerCase() == 'random';
                Rekenen.table = parseFloat(table);
                break;
            case 'quizvalidate':
                var inputs = document.getElementById('task-quiz').getElementsByTagName('input');
                var points = 0;
                for (var elementIndex = 0; elementIndex < inputs.length; elementIndex++) {
                    var input = inputs.item(elementIndex);
                    input.className = '';
                    if (input.value != input.getAttribute('data-solution'))
                        input.classList.add('incorrect');
                    else {
                        input.classList.add('correct');
                        points++;
                    }
                }
                var grade = (points / Rekenen.multipliers.length * 10).toFixed(2);
                document.getElementById('quiz-results').innerHTML = 'Je hebt ' + points + ' punt' + (points != 1 ? 'en' : '') + ' van de ' + Rekenen.multipliers.length + ' punten gehaald. Je cijfer is een ' + grade + '!';
                if (points < 5) {
                    document.getElementById('quiz-results').setAttribute('data-action', 'downloadPDF');
                    document.getElementById('quiz-results').classList.add('error');
                    document.getElementById('quiz-results').innerHTML += '<br />We raden je aan om nog even te oefenen. Klik hier om de oefen-PDF te downloaden.';
                }
                else if (points == 10) {
                    document.getElementById('quiz-results').setAttribute('data-action', 'downloadCertificate');
                    document.getElementById('quiz-results').classList.add('good');
                    document.getElementById('quiz-results').innerHTML += '<br />Klik hier om je certificaat te downloaden.';
                }
                else {
                    document.getElementById('quiz-results').setAttribute('data-action', '');
                    document.getElementById('quiz-results').classList.add('good');
                }
                break;
            case 'downloadpdf':
                window.open('assets/documents/practice.pdf', '_blank');
                break;
            case 'downloadcertificate':
                window.open('assets/documents/certificate.pdf', '_blank');
                break;
            default:
                console.log('Unknown action ' + action);
                console.log(element);
        }
    };
    // table x multiplier
    Rekenen.tables = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    Rekenen.multipliers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    Rekenen.task = 'welcome';
    Rekenen.randomTable = false;
    Rekenen.table = null;
    return Rekenen;
})();
window.addEventListener('load', Rekenen.setupListeners);
//# sourceMappingURL=rekenen.js.map