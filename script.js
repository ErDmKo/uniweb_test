var mymodule = angular.module('edkQuestList', [])
.directive('wordsList', function(){
    return {
        restrict: 'E',
        scope: {
            options: '=',
            items: '=',
            answers: '='
        },
        controller: ['$scope', '$window', '$timeout', function(scope, $window, $timeout) {
            var words_per_collumn = Math.ceil(scope.items.length/scope.options.colls),
                sel_words = [],
                isDef = function(val) {
                    return typeof val !== 'undefined';
                },
                getPrivOffset = function getPrivOffset(docElem) {
                    var box = { top: 0, left: 0 };
                    if (isDef(docElem[0].getBoundingClientRect)) {
                        box = docElem[0].getBoundingClientRect();
                    }
                    return {
                        top: box.top + $window.pageYOffset - docElem[0].clientTop,
                        left: box.left + $window.pageXOffset - docElem[0].clientLeft
                    };
                },
                draggPlaces = [];
            scope.colls = [];

            for (var i=0; i < scope.options.colls; i++){
                var start = i*words_per_collumn;

                scope.colls.push(
                    scope.items.slice(start, start+words_per_collumn)
                );
            }
            var distance_list = {}; 
            this.draggTest = function (element_info) {
                var elem_offset = getPrivOffset(element_info.element),
                    out = false;
                    
                for (var i=0; i < draggPlaces.length; i++) {
                    var place_info = draggPlaces[i],
                        place_offset = getPrivOffset(place_info.element),
                        distance = Math.sqrt(
                            Math.pow(elem_offset.top - place_offset.top, 2)
                            + Math.pow(elem_offset.left - place_offset.left, 2));

                    if (!distance_list.hasOwnProperty(place_info.word.id))
                        distance_list[place_info.word.id] = {}
                    distance_list[place_info.word.id].distance = distance;
                    distance_list[place_info.word.id].place = place_info;
                    distance_list[place_info.word.id].answer = element_info.answer;
                }
                var word_keys = Object.keys(distance_list);
                    min_distance = Math.min.apply(
                    null, word_keys.map(function(e){
                        return distance_list[e].distance;
                        }));
                
                for (var key in distance_list) {
                    var place_info = distance_list[key];
                    if (place_info.sel_answer && place_info.sel_answer.id == element_info.answer.id) {
                        distance_list[key].place.element.removeClass('active');
                        delete(distance_list[key].sel_answer);
                    }
                    if (min_distance < 50) {
                        if (min_distance == place_info.distance && !place_info.sel_answer) {
                            place_info.place.element.addClass('active');
                            out = place_info.place;
                            distance_list[key].sel_answer = element_info.answer;
                        }
                    }
                }
            return out;
            }
            this.addGragPlace = function(element) {

                draggPlaces.push(element);
            };
        }],
        templateUrl: 'widgets/word_list.html',
        link: function(scope, element, attrs, controller) {
            console.log(controller);
        }
    };
})
.directive('wordsAnswerPlace',[function(){
    return {
        restrict: 'E',
        require: '^wordsList',
        link: function(scope, element, attrs, wordsCtrl) {
            wordsCtrl.addGragPlace({
                element: element,
                word: scope.word,
                active: false
            });
        }
    }
}])
.directive('wordsListAnswer', [
    '$document',
    '$rootScope',
    function($document){
    return {
        restrict: 'E',
        require: '^wordsList',
        link: function(scope, element, attrs, wordsCtrl) {
            var startX = 0,
                startY = 0,
                x = 0,
                y = 0,
                parent = element.parent();

            element.css({
                cursor: 'pointer',
                position: 'relative'
            });

            element.on('mousedown', function(event) {
                event.preventDefault();
                element.addClass('dragging');
                startX = event.pageX - x;
                startY = event.pageY - y;
                $document.on('mousemove', mousemove);
                $document.on('mouseup', mouseup);
            });

            function mousemove(event) {
                wordsCtrl.draggTest({answer: scope.answer, element: element});
                y = event.pageY - startY;
                x = event.pageX - startX;
                element.css({
                  top: y + 'px',
                  left:  x + 'px'
                });
            }

            function mouseup() {
                var out = wordsCtrl.draggTest({answer: scope.answer, element: element});
                x = 0;
                    y = 0;
                    startX = 0;
                    startY = 0;
                    element.css({
                        top: '',
                        left: ''
                    })
                if (out){
                    out.element.append(element);
                } else {
                    parent.append(element);
                }
                $document.off('mousemove', mousemove);
                $document.off('mouseup', mouseup);
            }
        }
    }
}]);

var app = angular.module('myapp', [
    'ngSanitize',
    'edkQuestList'
    ])
.controller('wordsCtrl', [
    '$scope',
    '$sce',
    function($scope, $sce) {
        console.log('info');
        $scope.variable = 'test';
        $scope.paragraph = [{
            word_list: [{
                    id: 1,
                    text: $sce.trustAsHtml('неправильно'),
                },{
                    id: 2,
                    text: $sce.trustAsHtml('чей'),
                },{
                    id: 3,
                    text: $sce.trustAsHtml('Третий'),
                },{
                    id: 4,
                    text: $sce.trustAsHtml('Сентябрь <b>val</b>'),
                },{
                    id: 5,
                    text: $sce.trustAsHtml('Троллейбус'),
                },{
                    id: 6,
                    text: $sce.trustAsHtml('телефон'),
                },{
                    id: 7,
                    text: $sce.trustAsHtml('маленькие'),
                }],
            answers: [{
                    id: 1,
                    text: 'a'
                },{
                    id: 2,
                    text: 'b'
                },{
                    id: 3,
                    text: 'c'
                },{
                    id: 4,
                    text: 'd'
                }],
            options: {
                icon: true,
                text: true,
                colls: 1,
                input: true 
            }
        }, {
            word_list: [{
                    id: 1,
                    text: $sce.trustAsHtml('неправильно'),
                },{
                    id: 2,
                    text: $sce.trustAsHtml('чей'),
                },{
                    id: 3,
                    text: $sce.trustAsHtml('Третий'),
                },{
                    id: 4,
                    text: $sce.trustAsHtml('Сентябрь <b>val</b>'),
                },{
                    id: 5,
                    text: $sce.trustAsHtml('Троллейбус'),
                },{
                    id: 6,
                    text: $sce.trustAsHtml('телефон'),
                },{
                    id: 7,
                    text: $sce.trustAsHtml('маленькие'),
                }],
            answers: [{
                    id: 1,
                    text: 'a'
                },{
                    id: 2,
                    text: 'b'
                },{
                    id: 3,
                    text: 'c'
                },{
                    id: 4,
                    text: 'd'
                }],
            options: {
                icon: true,
                text: false,
                colls: 2,
                input: true 
            }
        }, {
            word_list: [{
                    id: 1,
                    text: $sce.trustAsHtml('<span style="font-size: 30px;">неправильно</span>'),
                },{
                    id: 2,
                    text: $sce.trustAsHtml('чей'),
                },{
                    id: 3,
                    text: $sce.trustAsHtml('Третий'),
                },{
                    id: 4,
                    text: $sce.trustAsHtml('Сентябрь <b>val</b>'),
                },{
                    id: 5,
                    text: $sce.trustAsHtml('Троллейбус'),
                },{
                    id: 6,
                    text: $sce.trustAsHtml('телефон'),
                },{
                    id: 7,
                    text: $sce.trustAsHtml('маленькие'),
                }],
            answers: [{
                    id: 1,
                    text: 'a'
                },{
                    id: 2,
                    text: 'b'
                },{
                    id: 3,
                    text: 'c'
                },{
                    id: 4,
                    text: 'd'
                }],
            options: {
                icon: true,
                text: true,
                colls: 3,
                input: false 
            }
        }, {
            word_list: [{
                    id: 1,
                    text: $sce.trustAsHtml('неправильно'),
                },{
                    id: 2,
                    text: $sce.trustAsHtml('чей'),
                },{
                    id: 3,
                    text: $sce.trustAsHtml('Третий'),
                },{
                    id: 4,
                    text: $sce.trustAsHtml('Сентябрь <b>val</b>'),
                },{
                    id: 5,
                    text: $sce.trustAsHtml('Троллейбус'),
                },{
                    id: 6,
                    text: $sce.trustAsHtml('телефон'),
                },{
                    id: 7,
                    text: $sce.trustAsHtml('маленькие'),
                }],
            answers: [{
                    id: 1,
                    text: 'a'
                },{
                    id: 2,
                    text: 'b'
                },{
                    id: 3,
                    text: 'c'
                },{
                    id: 4,
                    text: 'd'
                }],
            options: {
                icon: false,
                text: true,
                colls: 4,
                input: true 
            }
        }];
}]);
