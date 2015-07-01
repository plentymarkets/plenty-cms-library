module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: {
            build: ['dist']
        },

        concat: {
            build: {
                src: ['src/plentyFramework.js', 'src/**/*.js'],
                dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.js'
            }
        },

        uglify: {
            build: {
                src: 'dist/<%= pkg.name %>-<%= pkg.version %>.js',
                dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.min.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('build', ['clean', 'concat', 'uglify']);
    grunt.registerTask('default', ['build']);

};