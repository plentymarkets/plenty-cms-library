module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: {
            debug: ['debug'],
            doc: ['doc'],
            build: ['dist']
        },

        concat: {
            debug: {
                src: ['src/plentyFramework.js', 'src/services/*.js', 'src/directives/*.js'],
                dest: 'debug/<%= pkg.name %>-<%= pkg.version %>.js'
            }
        },

        uglify: {
            build: {
                src: 'debug/<%= pkg.name %>-<%= pkg.version %>.js',
                dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.min.js'
            }
        },

        jsdoc: {
            doc: {
                src: ['src/plentyFramework.js', 'src/**/*js'],
                options: {
                    destination: 'doc'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-jsdoc');

    grunt.registerTask('debug', ['clean:debug', 'concat:debug']);
    grunt.registerTask('doc', ['clean:doc', 'jsdoc:doc']);
    grunt.registerTask('build', ['debug', 'doc', 'clean:build', 'uglify:build']);
    grunt.registerTask('default', ['build']);

};