module.exports = function (config) {
    config.set({
        // base path, that will be used to resolve files and exclude
        basePath: '../',

        frameworks: ['jasmine', 'jquery-1.7.2'],

        // list of files / patterns to load in the browser
        files: [
            'src/*.js',
            'src/**/*.js',
            'tmp/*.js',
            'test/helpers/*.js',
            'test/helpers/responses/*.js',
            'test/**/*.js',
            'libs/**.js',
            {
                pattern: 'test/helpers/fixtures/*.html',
                watched: true,
                included: false,
                served: true
            }
        ],

        // list of files to exclude
        exclude: [],

        preprocessors: {
            'src/**/*.js' : ['coverage']
        },

        // use dots reporter, as travis terminal does not support escaping sequences
        // possible values: 'dots', 'progress'
        // CLI --reporters progress
        reporters: ['progress', 'junit', 'coverage'],

        junitReporter: {
            // will be resolved to basePath (in the same way as files/exclude patterns)
            outputFile: 'test-results.xml'
        },

        // web server port
        // CLI --port 9876
        port: 9002,

        // enable / disable colors in the output (reporters and logs)
        // CLI --colors --no-colors
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        // CLI --log-level debug
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        // CLI --auto-watch --no-auto-watch
        autoWatch: true,

        // If browser does not capture in given timeout [ms], kill it
        // CLI --capture-timeout 5000
        captureTimeout: 10000,

        // Auto run tests on start (when browsers are captured) and exit
        // CLI --single-run --no-single-run
        singleRun: true,

        // report which specs are slower than 500ms
        // CLI --report-slower-than 500
        reportSlowerThan: 500,

        plugins: [
            'karma-jasmine',
            //'karma-chrome-launcher',
            //'karma-firefox-launcher',
            'karma-jquery',
            'karma-coverage',
            'karma-phantomjs-launcher',
            'karma-junit-reporter',
            'karma-commonjs'
        ],

        coverageReporter : {
            type : 'html',
            dir  : 'test/coverage/'
        }
    })
};