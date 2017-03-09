module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                sourceMap: true,
                sourceMapIncludeSources: true,
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: [
                    'src/Emitter.js',
                    'src/peer.js',
                    'src/couchfriends.api.js'
                ],
                dest: 'build/couchfriends.api-latest.js'
            }
        },
        less: {
            production: {
                options: {
                    plugins: [
                        new (require('less-plugin-clean-css'))({})
                    ]
                },
                files: {
                    "build/assets/couchfriends.ui.css": "src/assets/couchfriends.ui.less"
                }
            }
        },
        copy: {
            main: {
                src: 'src/assets/*',
                dest: 'build/assets/',
                flatten: true,
                expand: true,
                filter: 'isFile'
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Default task(s).
    grunt.registerTask('default', ['uglify', 'less', 'copy']);

    grunt.loadNpmTasks('grunt-contrib-less');

    grunt.loadNpmTasks('grunt-contrib-copy');

};