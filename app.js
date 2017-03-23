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

var lrserver;
var server;
var serverStatic;
var data;
var port = 8011;
var serverUrl;


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
	// init liverload
	lrserver = livereload.createServer();

	// simple static server
	serverStatic = serveStatic(process.cwd(), {'index': ['index.html', 'index.htm']})
	var server = http.createServer(function(request, response) {
	  serverStatic(request, response, finalhandler(request, response));
	});

	server.listen(port);

	// whatch dirs
	var whatchDir = process.cwd() + '/dist';
	whatchDirs = [
		process.cwd() + '/dist',
		process.cwd() + '/index.html'
	];
	lrserver.watch(whatchDirs[0], whatchDirs[1]);

	serverUrl = 'http://localhost:' + port;

	console.log('Runnin on: ' + chalk.green(serverUrl));

	// process tps
	require('ts-node').register({
		'project':process.cwd()
	});

	// open browser
	// require("openurl").open(serverUrl);
}