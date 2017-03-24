# PK Frameword :: Client  
Client for [pkframwork](https://github.com/pe77/pkframework) | install, server, liveload, typescript whatch...

>First of all: Sorry for my shitty english...

Installation
---------------

First, install [Node.js](https://nodejs.org/en/). Then, install the latest pkframe cli command-line tools in your terminal. 

```bash
$ npm install -g pkframe
```

Usage
---------------

## init

The init command will download a startup template for your project.
Basically this client will download one of the [pkframework-examples](https://github.com/pe77/pkframework-examples) as the initial template and dependences for you.

```bash
$ pkframe init
```

![](http://i.imgur.com/zhG4N8L.png)
-----------

#### Options

These are keys in the options object you can pass

- `-p [pkg-name]` example he will use as the initial template [default=basic]

> You can see anothers 'templates' [here](https://github.com/pe77/pkframework-examples). Just follow folders name.

## go

This is where the magic happens.

```bash
$ pkframe go
```
![](http://i.imgur.com/cSLjV2R.png)
-----------

This command does many things:

- Starts a web-server to test your game
- Compile(and watch modifications) typescript code and deploy
- Start your browse with liverload. Auto update whenever the code is updated

This command expects to find an [index.html], where you will start your browser with liveload.
Typescript compiler will watch for .ts files modifications except for the [assets, node_modules, vendor] folders and will deploy them to [dist / js / app.js].

```json
{
    "compilerOptions": {
        "module": "amd",
        "target": "es5",
        "sourceMap": true,
        "outFile": "dist/js/app.js"
    },
    "exclude": [
        "assets",
        "node_modules",
        "vendor"
    ]
}
```

>This can be configured in the tsconfig.json file itself. All initial models already come with a tsconfig.json preconfiguration. You can change if you want.

## install
Here it will download / install the dependencies listed in the configuration file [**pkconfig.json**]. Things like assests pack, ts and js lib.

```bash
$ pkframe install
```
If there is no configuration file, it will create a default.

```json
{
    "install": {
        "assets": {
            "url": "https://github.com/pe77/pkframework-assets/archive/master.zip",
            "folder": "assets"
        },
        "dependencies": {
            "pkframework": {
                "url": "https://github.com/pe77/pkframework/archive/master.zip",
                "use": "build/"
            }
        }
    }
}
```
>You do not have to worry about this command unless you wanted to create a package / template.
>It is automatically used when you use **pkframe init**

