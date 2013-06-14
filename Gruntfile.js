/*jslint node:true*/

module.exports = function (grunt) {

    'use strict';

    grunt.loadNpmTasks('grunt-jslint'); // load the task

    grunt.initConfig({

        jslint: {
            files: [
                'generator/meta.json'
            ],
            options: {
                failOnError: true
            }
        }

    });

    // default task.
    grunt.registerTask('default', ['jslint', 'meta_json_pretty_print']);

    // Travis CI task.
    grunt.registerTask('test', 'jslint');

    grunt.registerTask('meta_json_pretty_print', function() {
        var metadata = grunt.file.readJSON('generator/meta.json') ;
        grunt.file.write('generator/meta.json',JSON.stringify(metadata, null, 4));
    });

    grunt.registerTask('generer_depot_grain', function(dest) {
        var done = this.async();
        if (arguments.length === 0) {
            grunt.log.writeln("Il faut passer le nom du répertoire de destination à la tâche.");
            grunt.log.writeln("grunt generer_depot_grain:NOM_GRAIN");
            done(false);
        }
        var rsync = require("rsyncwrapper").rsync;
        rsync({
                src: "./generator/",
                dest: "../" + dest,
                recursive: true
              },
              function (error,stdout,stderr,cmd) {
                if ( error ) {
                    // failed
                    grunt.log.writeln(error.message);
                    done(false);
                } else {
                    grunt.log.writeln("Fichiers de base copiés dans ../" + dest);
                    // success
                    done(true);
                }
               }
             ) ;
    }) ;

};
