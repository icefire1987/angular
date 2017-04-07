angular.module('myApp').directive('filereader', function() {
    var vm = this;


    vm.initFileReader = function(cb){
       this.reader = new FileReader();

       this.reader.onloadend = cb.onloadend;
       return this.reader;
    };

    vm.checkFileTyp = function(){
        if(vm.fileObj.raw){
            var isSuccess;
            vm.fileObj.extension = vm.fileObj.raw.name.split('.').pop().toLowerCase();  //file extension from input file
            isSuccess = vm.fileTypes.indexOf(vm.fileObj.extension) > -1;
            return isSuccess;
        }
        return false;

    };

    vm.parseCSV = function(e,seperator){
        if (!e) {
            var data = reader.content;
        } else {
            var data = e.target.result;
        }
        var arr = [];
        var quote = false;  // true means we're inside a quoted field

        // iterate over each character, keep track of current row and column (of the returned array)
        for (var row = col = c = 0; c < data.length; c++) {
            var cc = data[c]; // current character, next character
            var nc = data[c+1];

            arr[row] = arr[row] || [];             // create a new row if necessary
            arr[row][col] = arr[row][col] || '';   // create a new column (start with empty string) if necessary

            // If the current character is a quotation mark, and we're inside a
            // quoted field, and the next character is also a quotation mark,
            // add a quotation mark to the current column and skip the next character
            if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }

            // If it's just one quotation mark, begin/end quoted field
            if (cc == '"') { quote = !quote; continue; }

            // If it's a comma and we're not in a quoted field, move on to the next column
            if (cc == seperator && !quote) { ++col; continue; }

            // If it's a newline and we're not in a quoted field, move on to the next
            // row and move to column 0 of that new row
            if (cc == '\n' && !quote) { ++row; col = 0; continue; }

            if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }
            if (cc == '\n' && !quote) { ++row; col = 0; continue; }
            // Otherwise, append the current character to the current column
            arr[row][col] += cc;

        }
        console.log(arr)
        return arr;
    };
    return {
        restrict: 'A',
        replace: 'false',
        scope: {
            cb : '&'
        },
        link: function(scope,elem){
                elem.bind('change', function(event){
                    var files = event.target.files;
                    vm.fileObj = {};
                    vm.fileObj.raw = files[0];
                    vm.fileTypes = ['csv','CSV'];
                    if(vm.checkFileTyp()){
                        vm.reader = vm.initFileReader({
                            onloadend : function(data){
                                scope.cb({data: vm.parseCSV(data,';')});
                            }
                        });

                        vm.reader.readAsText(vm.fileObj.raw);


                    }
                });
            }
        };
});