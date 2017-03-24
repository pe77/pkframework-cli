#!/usr/bin/env node

// load shit
var commander 	= require('commander');
var chalk 		= require('chalk');
var livereload 	= require('livereload');
var http 		= require("http");
var https 		= require("follow-redirects").https;
var serveStatic = require('serve-static')
var finalhandler = require('finalhandler')
var ts 			= require('typescript');
var exec 		= require('child_process').exec;
var fs 			= require('fs-extra')
// var ghdownload 	= require('github-download');
var AdmZip 		= require('adm-zip');
var ProgressBar = require('progress');

// general vars
var lrserver;
var server;
var serverStatic;
var data;
var port = 8011;
var serverUrl;
var indexPath = process.cwd() + '/index.html';


commander
.version('0.7.4')
.arguments('arg')
// .option('-u, --username <username>', 'github username')
.option('-p, --package <package>', 'select package to start [default=basic]')
.action(function(command) {

	if(command == 'go')
		go();
	//

	if(command == 'init')
		init();
	//

	if(command == 'install')
		install();
	//

})
.parse(process.argv);

// install dependencies
function install()
{
	console.log(chalk.yellow('[1/5]') + chalk.green(' init install ...'));

	// check if exist pkconfig.json
	var pkconfigFullPath = process.cwd() +  '/pkconfig.json';
	fs.exists(pkconfigFullPath, function(exists) { 

		var readConfig = function()
		{
			// read config file
			console.log(chalk.yellow('[3/5]') + chalk.green(' load config ...'));
			fs.readFile(pkconfigFullPath, 'utf8', function (err,data) {
			  if (err) return console.log(chalk.red('err...'), err);


			  downloadDependencies(JSON.parse(data))
			});
		}
		
		console.log(chalk.yellow('[2/5]') + chalk.green(' check pkconfig file exists['+exists+'] ...'));
		if(!exists)
		{
			generateDefaultConfig(pkconfigFullPath, readConfig);
		}
		else
		{
			readConfig();
		}
	});
}

function downloadDependencies(config)
{
	console.log(chalk.yellow('[4/5]') + chalk.green(' download assets ...'));

	var assetsZipFile = process.cwd() +  '/assets.zip';
	download(config.install.assets.url, assetsZipFile, err=>{
		if (err) return console.log(chalk.red('err...'), err);

		// extract	
		var zip = new AdmZip(assetsZipFile);
		var zipEntries = zip.getEntries();

		var extractEntryFolder = ''
		if(config.install.assets.url.indexOf('github') > -1)
			extractEntryFolder = zipEntries[0]["entryName"];
		//

		zip.extractEntryTo(extractEntryFolder, process.cwd() +  '/assets', false, true);

		// remove zip 
		fs.unlinkSync(assetsZipFile);

		var totalDependencies = Object.keys(config.install.dependencies).length;
		var depCount = 1;

		if(totalDependencies)
			console.log(chalk.yellow('[5/5]') + chalk.green(' download dependencies ...'));
		else
			console.log(chalk.yellow('[5/5]') + chalk.green(' no dependencies ...'));
		//
		

		for (let depName in config.install.dependencies)
		{	
			let depPathLocation = process.cwd() +  '/'+depName;
			let depZipLocation = depPathLocation+'.zip';

			console.log(chalk.gray('- [1/3] ['+chalk.cyan(depName)+']') + chalk.green(' download :'+chalk.gray(config.install.dependencies[depName].url)));

			download(config.install.dependencies[depName].url, depZipLocation, err=>{
				if (err) return console.log(chalk.red('err...'), err);

				var zip = new AdmZip(depZipLocation);
				var zipEntries = zip.getEntries();

				console.log(chalk.gray('- [2/3] ['+chalk.cyan(depName)+']') + chalk.green(' extract...'));

				// if need extract main folder ({project-main}/{important_things})
				var extractEntryFolder = ''
				if(config.install.dependencies[depName].url.indexOf('github') > -1)
					extractEntryFolder = zipEntries[0]["entryName"];
				//

				if(config.install.dependencies[depName].use)
					extractEntryFolder+= config.install.dependencies[depName].use;
				//

				zip.extractEntryTo(extractEntryFolder, process.cwd() +  '/vendor/' + depName, false, true);
				
				fs.unlinkSync(depZipLocation);

				console.log(chalk.gray('- [3/3] ['+chalk.cyan(depName)+']') + chalk.green.bold(' ok!'));

				if(depCount == totalDependencies)
				{
					console.log(chalk.cyan('All dependencies install!'));
					console.log(chalk.gray('next move: ') + chalk.green.bold('pkframe go'));
				}

				depCount++;
			});

			
		}
		return;
		
		
	});
}

function generateDefaultConfig(pkconfigFullPath, callBack)
{
	console.log(chalk.yellow('[2/5]') + chalk.green(' generate default pkconfig file ...'));
	// create default one
	var options = {
		install:{
			assets:{
				url:"https://github.com/pe77/pkframework-assets/archive/master.zip",
				folder:"assets"
			},
			dependencies:{
				pkframework:{
					url:"https://github.com/pe77/pkframework/archive/master.zip",
					use:'build/'
				}
			}
		}
	};

	JSON.stringify(options);

	fs.writeFile(pkconfigFullPath, JSON.stringify(options, null, 4), function(err) {
	    if (err) return console.log(chalk.red('err...'), err);

	    if(callBack)
	    	callBack();
	    //
	}); 
}

// init a new workspace
function init()
{
	console.log(chalk.yellow('[1/5]') + chalk.green(' init project ...'));

	var package = commander.package ? commander.package : 'basic';
	var zipFile = process.cwd() + "/pkframework-examples-master.zip";
	var zipFolder = process.cwd() + "/pkframework-examples-master";
	var zipFolderPack = process.cwd() + "/pkframework-examples-master/" + package;

	// check if dir is empty
	console.log(chalk.yellow('[2/5]') + chalk.green(' check folder...'));
	fs.readdir(process.cwd(), function(err, files) {
	    if (err) {
	       console.log(chalk.red('err...'), err);
	    } else {
	       if (!files.length) {

	       		console.log(chalk.yellow('[3/5]') + chalk.green(' download file...'));

	       		// dowload file
				// https://github.com/pe77/pkframework-starter/archive/master.zip
				// https://nodeload.github.com/pe77/pkframework-examples/zip/master
				download('https://nodeload.github.com/pe77/pkframework-examples/zip/master', zipFile, err=>{
					if (err) return console.log(chalk.red('err...'), err);

					console.log(chalk.yellow('[4/5]') + chalk.green(' extract...'));

					// extract	
					var zip = new AdmZip(zipFile);
					zip.extractAllTo(process.cwd(), true);


					// check if package exist
					console.log(chalk.yellow('[5/5]') + chalk.green(' check pack...'));
					fs.exists(zipFolderPack, function(exists) { 
					    
				    	// if dont exist
				    	if (!exists) {
				    		console.log(chalk.yellow('['+package+']')+' pack does not ' + chalk.red('exist'));
				    		console.log('see the packages available at ['+chalk.green('https://github.com/pe77/pkframework-examples')+']');

				    		// remove dir and zip
							fs.remove(zipFolder);
							fs.unlinkSync(zipFile);
				    		return;
				    	}

				    	// copy and delete zip and zip-folder
						fs.copy(zipFolderPack, process.cwd(), err => {
						  if (err) return console.error(err)
						  

						  	// remove dir and zip
							fs.remove(zipFolder);
							fs.unlinkSync(zipFile);

							console.log(chalk.cyan('-----------'));

							// install dependencies
							install();
						});

					    
					})


					
				});

	       }else{
	       		console.log('dir ['+chalk.gray(process.cwd())+'] is not ' + chalk.red('empty'));
	       }
	    }
	});
}

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

	console.log(chalk.yellow('[1/4]') + chalk.green(' create server on:['+port+']...'));

	// whatch dirs
	var whatchDir = process.cwd() + '/dist';
	whatchDirs = [
		process.cwd() + '/dist',
		process.cwd() + '/index.html'
	];
	lrserver.watch(whatchDirs[0], whatchDirs[1]);

	serverUrl = 'http://localhost:' + port;

	console.log(chalk.yellow('[2/4]') + chalk.gray(' server running :['+chalk.green(serverUrl)+']...'));

	var localEnvPath = __dirname + '/node_modules/.bin'
	process.env.PATH += ';' + localEnvPath; // add local to env path




	// -- TSC
	console.log(chalk.yellow('[3/4]') + chalk.green(' starting typescript compile whatch...'));

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

		console.log(chalk.yellow('[4/4]') + chalk.green(' starting browser on index.html + liverload...'));

		// open browser
		require("openurl").open(serverUrl);
	})
}



function download(url, dest, cb) {

  var file = fs.createWriteStream(dest);
  var request = https.get(url, function(response) {

  	var len = parseInt(response.headers['content-length'], 10);

  	if(len)
  	{
	  	var bar = new ProgressBar(chalk.green('downloading') + chalk.gray('[:bar]') +' :percent :etas', {
		    complete: '=',
		    incomplete: ' ',
		    width: 20,
		    total: len
		  });

	  	response.on('data', (chunk)=> {
		    bar.tick(chunk.length);
		});
  	}
	
    response.pipe(file);
    file.on('finish', function() {
    	// console.log(chalk.green.bold('complete!'));
      file.close(cb);  // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });
};