const through = require('through2'),
	File = require('vinyl'),
	path = require('path'),
	fs = require('fs'),
	cheerio = require('cheerio');

const gutil = require('gulp-util'),
	PluginError = gutil.PluginError;

const PLUGIN_NAME = 'gulp-uit-index';

function gulpUitIndex(opt) {
	var default_opt = {
		inJson: true, // true = json in html, false = html, json
		html: true, // true = output html, false = json only
		qrcode: false, // true = output qrcode, false = qrcode remove
		filename: 'index',
		title: '파일 리스트'
	};
	var option = require('util')._extend(default_opt, opt);

	var filelist = {'___default' : {groupList: []}};

	function bufferJson(file, enc, cb) {
		var fileobj = {path: file.relative, dir : path.dirname(file.relative), basename: path.basename(file.relative)};
		if(file.isNull() || file.relative == option.filename+'.html' || file.relative == option.filename+'.json') {
			cb();
			return;
		}

		if(file.isStream()) {
			this.emit('error', new PluginError('gulp-uit-index', 'Streaming not supported'));
			cb();
			return;
		}

		var $ = cheerio.load(file.contents.toString(enc),{decodeEntities: false});
		fileobj.title = $('title').eq(0).text();
		var pri_title = $.html().match(/<!--\s*pageTitle\s*:\s*(?:"|')(.*?)(?:"|')\s*-->/);
		if(pri_title) {
			fileobj.title = pri_title[1].trim();
		} else {
			fileobj.title = fileobj.title || fileobj.basename;
		}
		var group = fileobj.title.match(/\[(.*)\](.*)/);
		if(group) {
			fileobj.title = group[2].trim();
			if(filelist[group[1].trim()]) {
				filelist[group[1].trim()].groupList.push(fileobj);
			} else {
				filelist[group[1].trim()] = {groupList: [fileobj]};
			}
		} else {
			filelist['___default'].groupList.push(fileobj);
		}
		cb();
	}

	function endStream(cb) {
		if(!option.inJson) {
			this.push(new File({
				path: option.filename+'.json',
				contents : new Buffer(JSON.stringify(filelist, null, '	'))
			}));
		}
		if(option.html) {
			fs.readFile(__dirname+'/lib/gulp-nts-uit-index-helper/index_template.html', (err, data) => {
				if(err) {
					this.emit('error', new PluginError('gulp-uit-index', 'Not found template.html'));
					cb();
					return;
				}
				var outputFile = new File({path: option.filename+'.html'});
				var script = option.inJson ? '<script type="text/javascript">\n		var filelist_json = '+JSON.stringify(filelist, null)+';\n	</script>' : '';
				var $ = cheerio.load(data.toString(),{decodeEntities: false});
				$('.hd_h1').eq(0).text(option.title);
				if(!option.qrcode) $('.qr_code').remove();
				var html = $.html().replace(/<!--\s*inject\s*:\s*filelist_json\s*-->/, script);
				outputFile.contents = new Buffer(html);
				this.push(outputFile);
				cb();
			});
		} else {
			cb();
		}
	}

	return through.obj(bufferJson, endStream);
}

module.exports = gulpUitIndex;