var minifier = require('minifier');

input = [
    "./lib/js/jquery.min.js",
    "./lib/js/proto-app-in-view.min.js",
    "./lib/js/ResizeSensor.js",
    "./lib/js/theia-sticky-sidebar.js"
];
options = {
    output: "./proto-app-lib.min.js"
};
minifier.minify(input, options);
console.log('Built: proto-app-lib.min.js');

input = [
    "./lib/js/jquery.min.js",
    "./lib/js/proto-app-in-view.min.js",
    "./lib/js/ResizeSensor.js",
    "./lib/js/theia-sticky-sidebar.js",
    "./lib/js/jquery.element-visible.min.js",
    "./lib/js/tether.min.js",
    "./lib/js/bootstrap.min.js"
];
options = {
    output: "./proto-app-lib-article.min.js"
};
minifier.minify(input, options);
console.log('Built: proto-app-lib-article.min.js');