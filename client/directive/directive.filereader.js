angular.module('myApp').directive('filereader', function($interval,$timeout) {
    return {
        restrict: 'EA',
        replace: 'false',
        scope: {
            cb : '&',
            accept: '@',
            labelClass: '@',
            labelText: '@'
        },
        templateUrl: '/client/directive/template/tpl.filereader.html',
        link: function(scope,elem){
            var vm = this;
            scope.progress=false;
            initFileReader = function(cb){
                console.log("init treader")
                this.reader = new FileReader();

                this.reader.onloadstart = cb.onloadstart;
                this.reader.onloadend = cb.onloadend;
                this.reader.onprogress = function(e, fileName) {
                    console.log(e.loaded + "/" + e.total)
                    if (e.lengthComputable) {
                        scope.progress = Math.round((e.loaded * 100) / e.total);
                    }
                };
                return this.reader;
            };
            checkFileTyp = function(){
                if(vm.fileObj && vm.fileObj.raw){
                    var isSuccess;
                    vm.fileObj.extension = vm.fileObj.raw.name.split('.').pop().toLowerCase();  //file extension from input file
                    isSuccess = vm.fileTypes.indexOf(vm.fileObj.extension) > -1;
                    return isSuccess;
                }
                return false;

            };

            parseCSV = function(e,seperator){
                console.log("go")
                $interval(function() {scope.progress = 0;},0,1);
                if (!e) {
                    var data = reader.content;
                } else {
                    var data = e.target.result;
                }
                var arr = [];
                var quote = false;  // true means we're inside a quoted field

                for (var row = col = x = 0; x < data.length; x++) {
                    /*if(x%100==0){
                        $interval(function() {
                            scope.progress = Math.round((x * 100) / data.length);
                            console.log(scope.progress + " p");
                        },0,1);

                    }*/

                    var cc = data[x]; // current character, next character
                    var nc = data[x+1];

                    arr[row] = arr[row] || [];             // create a new row if necessary
                    arr[row][col] = arr[row][col] || '';   // create a new column (start with empty string) if necessary

                    // If the current character is a quotation mark, and we're inside a
                    // quoted field, and the next character is also a quotation mark,
                    // add a quotation mark to the current column and skip the next character
                    if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++x; continue; }

                    // If it's just one quotation mark, begin/end quoted field
                    if (cc == '"') { quote = !quote; continue; }

                    // If it's a comma and we're not in a quoted field, move on to the next column
                    if (cc == seperator && !quote) { ++col; continue; }

                    // If it's a newline and we're not in a quoted field, move on to the next
                    // row and move to column 0 of that new row
                    if (cc == '\n' && !quote) {
                        var counterEmpty=0;
                        for(tmpCol in arr[row]){ if(arr[row][tmpCol]==""){counterEmpty++;} }
                        if(counterEmpty==arr[row].length){
                            delete arr[row];
                            --row;
                        }
                        ++row; col = 0;
                        continue;
                    }
                    if (cc == '\r' && nc == '\n' && !quote) {
                        var counterEmpty=0;
                        for(tmpCol in arr[row]){ if(arr[row][tmpCol]==""){counterEmpty++;} }
                        if(counterEmpty==arr[row].length){
                            delete arr[row];
                            --row;
                        }
                        ++row; col = 0;
                        ++x;
                        continue;
                    }
                    if (cc == '\n' && !quote) {
                        var counterEmpty=0;
                        for(tmpCol in arr[row]){ if(arr[row][tmpCol]==""){counterEmpty++;} }
                        if(counterEmpty==arr[row].length){
                            delete arr[row];
                            --row;
                        }
                        ++row; col = 0;
                        continue;
                    }
                    // Otherwise, append the current character to the current column
                    arr[row][col] += cc;
                }
                $interval(function() {scope.progress = 100;},0,1);
                $interval.cancel();
                scope.file.rows = arr.length;
                return arr;
            };

            addRowIfNotEmpty = function(){

            };
            scope.removeFile = function(){
                console.log("remove")
                vm.fileObj = {};
                scope.file = {};
                scope.cb({data:null});
            };

            elem.bind('change', function(event){
                var files = event.target.files;
                vm.fileObj = {};
                vm.fileObj.raw = files[0];
                vm.fileTypes = ['csv','CSV'];
                scope.progress=0;
                if(checkFileTyp()){
                    vm.reader = initFileReader({
                        onloadend : function(data){
                            scope.file = vm.fileObj.raw;
                            scope.cb({data: parseCSV(data,';')});
                        },
                        onloadstart: function(){
                            scope.progress=0;
                        }
                    });
                    vm.reader.readAsText(vm.fileObj.raw);
                }
                // remove value from file input to allow same file again
                elem.find("input")[0].value="";
            });
            scope.$on('$destroy', function () {
                scope.progress=false;
                elem.off('change');
            });
        }
    };
});