# PK Frameword :: Client 
Client for [pkframwork](https://github.com/pe77/pkframework) | install, server, liveload, typescript whatch...

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
Basically it will download one of the [pkframework-examples](https://github.com/pe77/pkframework-examples) as the initial template for you.

```bash
$ pkframe init
```

#### Options

These are keys in the options object you can pass

- `-p [pkg-name]` example he will use as the initial template [default=basic]

> You can see anothers 'templates' [here](https://github.com/pe77/pkframework-examples). Just follow folders name.




## go

This is where the magic happens.

```bash
$ pkframe go
```

This command does many things:

- Starts a web-server to test your game
- Compile(and watch modifications) typescript code and deploy
- Start your browse with liverload. Auto update whenever the code is updated

This command expects to find an [index.html], where you will start your browser with liveload.
Typescript compiler will watch for .ts files modifications except for the [assets, node_modules, vendor] folders and will deploy them to [dist / js / app.js].

```
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



