module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: {
            debug: ['debug'],
            doc: ['doc'],
            build: ['dist']
        },

        karma: {
            unit: {
                configFile: 'test/karma.conf.js',
                // Start these browsers, currently available:
                // - Chrome
                // - ChromeCanary
                // - Firefox
                // - Opera
                // - Safari (only Mac)
                // - PhantomJS
                // - IE (only Windows)
                // CLI --browsers Chrome,Firefox,Safari
                browsers: ['PhantomJS'],
                verbose: true,
                logLevel: 'WARN'
            }
        },

        htmlConvert: {
            options: {
                base: 'src/partials/',
                module: 'TemplateCache'
            },
            templates: {
                src: ['src/partials/**/*.html'],
                dest: 'tmp/templates.js'
            }
        },

        concat: {
            debug: {
                src: [ 'libs/mustache.min.js', 'src/helpers/*.js', 'tmp/templates.js', 'src/plentyFramework.js', 'src/partials/**/*.js', 'src/factories/*.js', 'src/services/*.js', 'src/directives/*.js', 'src/plentyFrameworkCompiler.js'],
                dest: 'debug/<%= pkg.name %>-<%= pkg.version %>.js'
            }
        },

        uglify: {
            compress:{
                "pure_funcs": [ 'console.log' ],
                unused: true,
                "join_vars": true
            },
            options: {
                banner:  '/**\n * Licensed under AGPL v3\n * (https://github.com/plentymarkets/plenty-cms-library/blob/master/LICENSE)\n * =====================================================================================\n * @copyright   Copyright (c) 2015, plentymarkets GmbH (http://www.plentymarkets.com)\n * @author      Felix Dausch <felix.dausch@plentymarkets.com>\n * =====================================================================================\n*/'
            },
            build: {
                src: 'debug/<%= pkg.name %>-<%= pkg.version %>.js',
                dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.min.js'
            }
        },

        yuidoc: {
            doc: {
                options: {
                    paths: 'src/',
                    outdir: 'doc/'
                }
            }
        },

        copy: {
            debug: {
                expand: true,
                src: 'lang/*',
                dest: 'debug/'
            },
            build: {
                expand: true,
                cwd: 'debug/',
                src: '**',
                dest: 'dist/'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-html-convert');

    grunt.registerTask('debug', ['clean:debug', 'copy:debug', 'htmlConvert', 'concat:debug']);
    grunt.registerTask('doc', ['clean:doc', 'yuidoc:doc']);
    grunt.registerTask('build', ['debug', 'doc', 'karma', 'clean:build', 'uglify:build', 'copy:build']);
    grunt.registerTask('build-skip-tests', ['debug', 'doc', 'clean:build', 'uglify:build', 'copy:build']);
    grunt.registerTask('default', ['debug']);

};