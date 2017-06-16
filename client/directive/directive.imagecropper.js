angular.module('myApp').directive('imagecropper', function(cropperService,FileUploader,logService) {
    return {
        restrict: 'E',
        replace: 'true',
        templateUrl: '/client/directive/template/tpl.imagecropper.html',

        link: function(scope,elem,attr){
            scope.fileuploader = new FileUploader();
            scope.fileuploader.filters.push({
                name: 'imageFilter',
                fn: function(item /*{File|FileLikeObject}*/, options) {
                    var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                    return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
                }
            });

            scope.fileuploader.onWhenAddingFileFailed =
                scope.fileuploader.onErrorItem =
                    scope.fileuploader.onErrorItem =
                        function(fileItem, response, status, headers){scope.upload_error(fileItem, response, status, headers)};
            scope.fileuploader.onAfterAddingAll =
                function(fileItem, response, status, headers){ scope.upload_success(fileItem, response, status, headers)};

            scope.upload_error = function(fileItem, response, status, headers){
                logService.log({
                    userFeedback: "Dateiupload fehlgeschlagen",
                    serverFeedback: { data: { error: {debug: "Details: " + response}}}

                });
            };
            scope.upload_success = function(fileItem, response, status, headers){
                console.log(scope.fileuploader.queue);
                if ( (/\.(png|jpeg|jpg|gif)$/i).test(scope.fileuploader.queue[0].file.name) ) {
                    var reader = new FileReader();
                    reader.addEventListener("load", function () {
                        var img = document.getElementById("cropperImage");
                        img.src = reader.result;
                        img.onload = function() {
                            scope.init_cropper(img);
                        };

                    });

                    reader.readAsDataURL(scope.fileuploader.queue[0]._file);
                }else{
                    logService.log({
                        userFeedback: "Preview fehlgeschlagen",
                        serverFeedback: { data: { error: {debug: "Details: "}}}
                    });
                }

            };

            scope.options = {
                textInputFile: attr.textInputFile
            };
            scope.cropper = cropperService;
            scope.model = scope.$eval(attr.input);
            scope.model.logo = "";
            scope.init_cropper = function(img){
                var obj = {};
                obj.type = "";
                obj.cropArea = 'cropperArea';
                obj.image = img;
                obj.previewArea = '#cropperPreview';
                obj.aspectRatio= 1.863;
                scope.cropper.cropper(obj);
                obj.image.addEventListener('cropend', function () {

                });
            };
            scope.cropper.onCrop = function(){
                console.log("doooiiiey");
                scope.model.logo = false;
            };
            scope.imageToModel = function(){
                scope.model.logo = scope.cropper.getCroppedCanvas();
            };

            scope.$on('$destroy', function () {
                scope.progress=false;
                elem.off('change');
            });
        }
    };
});