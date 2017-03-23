var gulp = require('gulp');
var debug = require('gulp-debug');
var clean = require('gulp-clean');
var pug = require('gulp-pug');
var changed = require('gulp-changed');
var sass = require('gulp-sass');
var gutil = require('gulp-util');
var browserSync   = require('browser-sync').create();
var autoprefixer = require('gulp-autoprefixer');
var exec = require('child_process').exec;

//var root = '../ttstatic.github.io/'; // always add slash('/') at the end
var root = 'build/'; // always add slash('/') at the end
var dir = 'drinkcircle'; // project folder

var paths = {
    // This must be in the right order, so linked files are processed first.
    pug: [
      'includes/**/*.pug',
      'assets/vendor/**/*.pug',
      'layout/**/*.pug',
      'partials/**/*.pug',
      'product_maintenance/**/*.pug',
      './*.pug',
      '!**/_*.pug',
      '!node_modules/**/*',
      '!assets/vendor/tooltwist-views-client/boilerplate/**/*',
    ],
    scss: 'assets/css/**/*.scss',
    js: 'assets/scripts/**/*.js'
}

// - ###########################################################################
// - Runs the 'clean' task first before it run all other tasks.
// - ###########################################################################
gulp.task('default', ['clean'], function(cb) {
    exec('gulp main', function(err,stdout,stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});
gulp.task('main', ['pug-all', 'sass', 'js', 'copy', 'bower']);

// - ###########################################################################
// - Compile PUG files to HTML
// - ###########################################################################
gulp.task('pug-all', function() {
    /*
    * Compile ALL pug files except files with
    * file names that starts with an underscore('_').
    */
    return gulp.src(paths.pug)
    // Convert the pug files to html files
    .pipe(pug({
        doctype: 'html',
        pretty: true
    }))
    // Handle ug errors nicely
    .on('error', function(err){
        gutil.log(err.message);
        this.emit('end'); // prevents watch from dying
    })
    // Write a message
    .pipe(debug({title:'Installed'}))
    // Place the resultant HTML file into the destination directory.
    .pipe(gulp.dest(root + dir))
    // Refresh the page in the browser
    .pipe(browserSync.stream());
});

gulp.task('pug-incremental', (done) => {

    var dest = root + dir;
    gulp.src(paths.pug)
    // Look for files newer than the corresponding .html
    // file in the destination directory.
    .pipe(changed(dest, {extension: '.html'}))
    // Convert the pug files to html files
    .pipe(pug({
        doctype: 'html',
        pretty: true
    }))
    // Handle ug errors nicely
    .on('error', function(err){
        gutil.log(err.message);
        this.emit('end'); // prevents watch from dying
    })
    // Write a message
    .pipe(debug({title:'Installed'}))
    // Place the resultant HTML file into the destination directory.
    .pipe(gulp.dest(dest))
    // Refresh the page in the browser
    .pipe(browserSync.stream());


    done();
});


gulp.task('watch', () => {
    gulp.watch(paths.pug,['pug-incremental']);
});


// - ###########################################################################
// - Compile JS files
// - ###########################################################################
gulp.task('js', function() {
    return gulp.src(paths.js)
    // .pipe(browserify())
    // .pipe(uglify())
    .pipe(gulp.dest(root + dir + '/assets/scripts'))
    .pipe(browserSync.stream());;
});

// - ###########################################################################
// - Compile SASS files to CSS
// - ###########################################################################
gulp.task('sass', function() {
    return gulp.src(paths.scss)
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest(root + dir + '/assets/css'))
    .pipe(browserSync.stream());
});

// - ###########################################################################
// - Copy assets (css, images, scripts, etc...)
// - ###########################################################################
var assetsBaseDir = "./assets";
var assets = [
    assetsBaseDir + '/css/**/*.css',
    assetsBaseDir + '/images/**/*.*',
    // assetsBaseDir + '/scripts/**/*.*',
    assetsBaseDir + '/vendor/bootstrap/dist/**/*.*',
    assetsBaseDir + '/vendor/**/*.*',
    assetsBaseDir + '/fonts/**/*.*',
    "!" + assetsBaseDir + '/css/*.scss',
    "!" + assetsBaseDir + '/vendor/**/*.pug',
];
gulp.task('copy', function() {
    gulp.src(assets, { base: './'})
    .pipe(gulp.dest(root + dir));
});

// - ###########################################################################
// - Copy plugins from bower
// - ###########################################################################
var bowerBaseDir = "./bower_components";
var bower = [
    bowerBaseDir + '/accounting/**/*.*',
    bowerBaseDir + '/angular/**/*.*',
    bowerBaseDir + '/angular-sanitize/**/*.*',
    bowerBaseDir + '/angular-datatables/**/*.*',
    bowerBaseDir + '/angular-material/**/*.*',
    bowerBaseDir + '/angular-aria/**/*.*',
    bowerBaseDir + '/angular-animate/**/*.*',
    bowerBaseDir + '/ckeditor/**/*.*',
    bowerBaseDir + '/angular-ckeditor/**/*.*',
    bowerBaseDir + '/animate.css/**/*.*',
    bowerBaseDir + '/bootstrap/dist/**/*.*',
    bowerBaseDir + '/font-awesome/**/*.*',
    bowerBaseDir + '/jquery/dist/**/*.*',
    bowerBaseDir + '/typeahead.js/dist/**/*.*',
    bowerBaseDir + '/ng-tags-input/**/*.*',
    bowerBaseDir + '/jquery.cookie/**/*.*',
    bowerBaseDir + '/moment/**/*.*',
    bowerBaseDir + '/owl.carousel/dist/**/*.*',
    bowerBaseDir + '/mustache.js/*.*',
    bowerBaseDir + '/bootbox.js/*.*',
    bowerBaseDir + '/dx-chartjs/*dx.chartjs.js',
    bowerBaseDir + '/globalize/**/*.*',
    '!' + bowerBaseDir + '/jquery.cookie/*.json', // Exclude '.json' files
    '!' + bowerBaseDir + '/font-awesome/scss/**', // Exclude 'scss' folder
    '!' + bowerBaseDir + '/font-awesome/less/**', // Exclude 'less' folder
    '!' + bowerBaseDir + '/font-awesome/*.json', // Exclude '.json' files
    '!' + bowerBaseDir + '/font-awesome/*.txt', // Exclude '.txt' files
    '!' + bowerBaseDir + '/animate.css/*.js', // Exclude '.json' files
    '!' + bowerBaseDir + '/animate.css/*.json' // Exclude '.json' files
];
gulp.task('bower', function() {
    gulp.src(bower, { base: './'})
    .pipe(gulp.dest(root + dir));
});

// - ###########################################################################
// - Clean task (deletes the public folder)
// - ###########################################################################
gulp.task('clean', function() {
    return gulp.src(root + dir, { read: false })
    .pipe(clean({force: true})); // added the 'force' option because the
    // directory is outside the gulpfile.js's
    // root folder
});

// - ###########################################################################
// - Serve app and watch
// - ###########################################################################
gulp.task('serve', function() {
    browserSync.init({
        server: {
            baseDir: root + dir
        },
        port: 3030,
        //reloadDelay: 200 // Give the server time to pick up the new files.
    });
    console.log('')
    console.log('Please note that "serve" compiles and installs changed')
    console.log('pugs, but not other pugs that are dependant upon them.')
    console.log('To force compile every pug, use "gulp serve-all".');
    console.log('')
    console.log('')
    gulp.watch(paths.scss, ['sass']);
    gulp.watch(paths.js, ['js']);
    //    gulp.watch('./**/*.pug',['pug-watch']);
    gulp.watch(paths.pug,['pug-incremental']);
});

gulp.task('serve-all', function() {
    browserSync.init({
        server: {
            baseDir: root + dir
        },
        port: 3030,
        //reloadDelay: 200 // Give the server time to pick up the new files.
    });
    console.log('')
    console.log('Please note that "serve-all" compiles and installs')
    console.log('ALL pugs, so is quite slow. To only compile changed')
    console.log('pugs, use "gulp serve".');
    console.log('')
    console.log('')
    gulp.watch(paths.scss, ['sass']);
    gulp.watch(paths.js, ['js']);
    //    gulp.watch('./**/*.pug',['pug-watch']);
    gulp.watch(paths.pug,['pug-all']);
});
