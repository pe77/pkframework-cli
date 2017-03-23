#!/usr/bin/env node

// load shit
var commander 	= require('commander');
var chalk 		= require('chalk');
var livereload 	= require('livereload');
// var connect  	= require('connect');
var http 		= require("http");
var serveStatic = require('serve-static')
var finalhandler = require('finalhandler')
var ts 			= require('typescript');
var exec 		= require('child_process').exec;
var fs = require('fs')

var lrserver;
var server;
var serverStatic;
var data;
var port = 8011;
var serverUrl;
var indexPath = process.cwd() + '/index.html';


commander
.version('0.0.1')
.arguments('go')
// .option('-u, --username <username>', 'The user to authenticate as')
.action(function(command, dir) {

	if(command == 'go')
		go();
	//
})
.parse(process.argv);

// start server
function go()
{
	// SERVER
	// init liverload
	lrserver = livereload.createServer();

	// simple static server
	serverStatic = serveStatic(process.cwd(), {
		cacheControl:false
	})

	var scriptElm = "\n<script type='text/javascript' src='http://localhost:35729/livereload.js?snipver=1'></script>\n";
	var server = http.createServer(function(req, res) {
		
		var done = finalhandler(req, res);

		if(req.url == '/')
		{
			// check if file exist
			fs.exists(indexPath, function(exists) { 
			  if (exists) { 
			  	// add liver load script
			    fs.readFile(indexPath, function (err, content) {
					if (err) return done(err)

					res.setHeader('Content-Type', 'text/html');
					content = content.toString().replace(/(<head[^>]*>)/, "$1" + scriptElm)
					res.write(content);
					res.end()
				});

			  }else{
			  	console.log(chalk.red('index.html no found!'));
			  }
			}); 

			return;
			
		}

	  	serverStatic(req, res, done);
	});

	server.listen(port);

	console.log('...starting server...');

	// whatch dirs
	var whatchDir = process.cwd() + '/dist';
	whatchDirs = [
		process.cwd() + '/dist',
		process.cwd() + '/index.html'
	];
	lrserver.watch(whatchDirs[0], whatchDirs[1]);

	serverUrl = 'http://localhost:' + port;

	console.log('server running on: ' + chalk.green(serverUrl));

	var localEnvPath = __dirname + '/node_modules/.bin'
	process.env.PATH += ';' + localEnvPath; // add local to env path




	// -- TSC
	console.log('...starting typescript compile whatch...');

	var e = exec('tsc -w --noEmitHelpers', {
		cwd : process.cwd(),
	    env : localEnvPath
	});

	e.stdout.on('data', function(data) {
		data = data.replace(/[\r\n]/g, ''); // remove quebra de linha
		var colorC = chalk.green;

		if(data.indexOf('error') > -1)
			colorC = chalk.yellow;
	    //

		if(data.indexOf('File change') > -1)
	    	console.log(colorC('file change:\t') + data);
	    //

	    if(data.indexOf('Compilation complete') > -1)
	    	console.log(colorC('code updated:\t') + data);
	    //

	});
	e.stderr.on('data', function(data) {
	    console.log(chalk.red('Holy Shit! ') + data);
	});
	e.on('close', function(code) {
	    console.log(chalk.blue('file whatch close. Bye ') + code);
	});




	// -- LIVERLOAD
	// if index exist
	fs.exists(indexPath, function(exists) { 
		if(!exists)
		{
			console.log(chalk.red('index.html no found!'));
			return;
		}

		console.log('...starting browser on index.html + liverload...');

		// open browser
		require("openurl").open(serverUrl);
	})
}