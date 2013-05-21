AssassinJS
==========

*AssassinJS - An Access Control Framework written in Node.js*

Current Stable Version: v1.0 beta

Dev Version: v1.1

##Description
Welcome to AssassinJS - An Access Control Framework written in Node.js. AssassinJS works almost like a real world assassin, only it assassinates unwanted incoming requests to your server. So don't worry, this assassin has your back :)

AssassinJS can be used for more than just for assassinating requests. It can provide a security check on incoming requests based on filters that you specify. You can also format the data to be sent as responses with customised filters.

A generic framework that provides a safe and friendly server environment. It has the functionality to be able to expose an api for developers to develop apps that consume your api. It has the potential to act as a firewall, or even as a proxy. And it can provide analytics to who is accessing what from your server.

AssassinJS. The Secret Server Agent. At your service.

(psst... Nothing is true, Everything is Permitted)


##Prerequisites:
* Latest version of NodeJS installed
* Latest version of MongoDB installed

AssassinJS will run with out MongoDB installed, but No Filters can be applied. Without the DB, AssassinJS is reduced to just a fileserver and proxy, depending on what default controller is specified in config.json
Routes can be added and target controllers still be configured, though.

##How To Use:
After cloning the repo you will be on master, which contains the current stable build.
Run

	npm -d
	
to install all the dependancies, which will save to node_modules.
Start the mongod server if on windows, or in linux it is started by default.

Run 

	node setFirstTime.js

which ensures that the config file is set to first time installation
(The config file should have firsttime=true by default, but just to make sure)

Then run 

	node index.js

This will initialize the database collections first and then start the assassinjs server.
(firsttime will be set to false in the config file, so if you run index.js again, it will not reintialize the db collections)
(If you need to reinitialize the db collections, then ```run setFirstTime.js```)
(If you already have the db initialized, ```run setSecondTime.js``` to stop the initialization when you pull a new copy of assassinjs)

Thats it! Check your specified host and port number and goto the url
http://(your url here):(port)/assassinPanel/index.jssp

This will open up the Assassin Panel where you can configure your Routes and Filters.

##Config Parameters
The following can be changed from assassinPanel, and the effects are seen without restarting AssassinJS

* defaultController: fileserver (or) proxy (or) error
* proxyDomain: www.youtube.com (or) localhost
* proxyDomainPort: 80 (or) (any port number)
* proxyType: external (or) internal

The following can be changed from assassinPanel, and the effects are seen AFTER restarting AssassinJS

* assassinjsPort:	8000
* assassinjsAddress:	0.0.0.0
* firsttime:	true (or) false
* useDB:	true (or) false