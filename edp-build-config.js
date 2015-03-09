exports.input = __dirname;

var path = require( 'path' );
exports.output = path.resolve( __dirname, 'output' );

var Fontmin = require('fontmin');

// var moduleEntries = 'html,htm,phtml,tpl,vm,js';
// var pageEntries = 'html,htm,phtml,tpl,vm';

exports.getProcessors = function () {
    var lessProcessor = new LessCompiler();
    var cssProcessor = new CssCompressor();
    var moduleProcessor = new ModuleCompiler();
    var jsProcessor = new JsCompressor();
    var pathMapperProcessor = new PathMapper();
    var addCopyright = new AddCopyright();

    function fontMinify(file, processContext, done) {

        var text = this.text || '';

        var entryFiles = this.entryFiles;

        if (entryFiles) {

            var entryText = [];

            processContext
                .getFilesByPatterns(entryFiles)
                .forEach(function (entryFile) {
                    entryText.push(entryFile.data);
                }
            );

            text += entryText.join('');
        }

        var srcPath = file.path;
        var outputDir = processContext.outputDir;
        var destPath = path.dirname(file.outputPath);
        destPath = path.resolve(outputDir, destPath); // 获取目标地址，传入 fontmin.dest
        file.outputPath = null; // 清除 edp 构建结果

        var fontmin = new Fontmin()
            .src(srcPath)
            .use(Fontmin.glyph({
                text: text
            }))
            .use(Fontmin.ttf2eot({
                clone: true
            }))
            .use(Fontmin.ttf2woff({
                clone: true
            }))
            .use(Fontmin.ttf2svg({
                clone: true
            }))
            .dest(destPath);

        var me = this;

        fontmin.run(function(err, files, stream) {
            if (err) {
                me.log.error(err);
            }

            done();
        });
    }

    var fontProcessor = {
        files: [ '*.ttf' ],
        entryFiles: [ '*.html' ],
        text: '他夏了夏天',
        name: 'FontCompressor',
        process: fontMinify
    }

    return {
        'default': [ lessProcessor, moduleProcessor, pathMapperProcessor, fontProcessor ],
        'release': [
            lessProcessor, cssProcessor, moduleProcessor,
            jsProcessor, pathMapperProcessor, addCopyright, fontProcessor
        ]
    };
};

exports.exclude = [
    'node_modules',
    'README',
    'package.json',
    'tool',
    'doc',
    'test',
    'module.conf',
    'dep/packages.manifest',
    'dep/*/*/test',
    'dep/*/*/doc',
    'dep/*/*/demo',
    'dep/*/*/tool',
    'dep/*/*/*.md',
    'dep/*/*/package.json',
    'edp-*',
    '.edpproj',
    '.svn',
    '.git',
    '.gitignore',
    '.idea',
    '.project',
    'Desktop.ini',
    'Thumbs.db',
    '.DS_Store',
    '*.tmp',
    '*.bak',
    '*.swp'
];

exports.injectProcessor = function ( processors ) {
    for ( var key in processors ) {
        global[ key ] = processors[ key ];
    }
};

