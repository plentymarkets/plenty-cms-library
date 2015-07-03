module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: {
            debug: ['debug'],
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
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('debug', ['clean:debug', 'concat:debug']);
    grunt.registerTask('build', ['debug', 'clean:build', 'uglify:build']);
    grunt.registerTask('default', ['build']);

};