'use strict'

// Dependencies
let express   = require( 'express' ),
	helmet    = require( 'helmet' ),
	http      = require( 'http' ),
	socket_io = require( 'socket.io' ),
	colors    = require( 'colors' ),
	ip        = require( 'ip' ),
	util      = require( 'util' ),
	path      = require( 'path' ),
	Projects  = require( './models/projects.class.js' )

/**
 * App class
 */
class App
{
	/**
	 * Constructor
	 */
	constructor( _options )
	{
		this.set_options( _options )

		this.domain = 'http://' + ip.address() + ':' + this.options.port

		this.set_express()
		this.set_server()
		this.set_socket()
		this.set_models()
	}

	/**
	 * Set models
	 */
	set_models()
	{
		// Set up
		this.projects = new Projects( { socket: this.sockets.main } )

		// Tests
		var project = this.projects.create_project( 'dummy' )
		project.create_folder( './toto' )
		project.get_folder( './toto//tutu/tete', true )
		project.create_file( './coucou/coco.txt', '1234' )
		project.create_file( './test-1.txt', 'content 1' )
		project.update_file( './test-1.txt', 'content 2' )
		project.update_file( './test-1.txt', 'content 31298' )
		project.update_file( './toto/tata/lorem.txt', '123456789' )
		project.update_file( './toto/tata/lorem.txt', '1aze' )
		project.update_file( './toto/tata/ipsum.txt', 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Mollitia asperiores iure, animi voluptatibus ut officiis. Molestias, quod perferendis hic totam doloremque, porro aperiam enim tenetur, maxime inventore consequuntur nisi in?' )
		project.delete_folder( './toto/tutu', true )
		// project.delete_file( './toto/tata/ipsum.txt' )
		// console.log( util.inspect( project.folders, { depth: null, colors: true } ) )
	}

	/**
	 * Set options
	 */
	set_options( _options )
	{
		// No option
		if( typeof _options !== 'object' )
			_options = {}

		if( typeof _options.port === 'undefined' )
			_options.port = 3000

		// Save
		this.options = _options
	}

	/**
	 * Set express
	 * Start express and set controllers
	 */
	set_express()
	{
		// Set up
		this.express = express()
		this.express.use( helmet() )
		this.express.set( 'view engine', 'jade' )
		this.express.set( 'views', path.join( __dirname, 'views' ) )
		this.express.use( express.static( path.join( __dirname, 'public' ) ) )

		this.express.locals.domain = this.domain

		// Controllers
		this.express.use( '/', require( './controllers/index.js' ) )
	}

	/**
	 * Set server
	 */
	set_server()
	{
		// Set up
		this.server = http.createServer( this.express )

		// Start
		this.server.listen( this.options.port, () =>
		{
			// URL
			console.log( colors.green( '---------------------------' ) )
			console.log( 'server'.green.bold + ' - ' + 'started'.cyan )
			console.log( 'server'.green.bold + ' - ' + this.domain.cyan )
		} )
	}

	/**
	 * Set socket
	 */
	set_socket()
	{
		// Set up
		this.sockets          = {}
		this.sockets.main     = socket_io.listen( this.server )
		this.sockets.app      = this.sockets.main.of( '/app' )

		// App connection event
		this.sockets.app.on( 'connection', ( socket ) =>
		{
			// Set up
			let project = null

			console.log( 'socket app'.green.bold + ' - ' + 'connect'.cyan + ' - ' + socket.id.cyan )

			// Start project
			socket.on( 'start_project', ( data ) =>
			{
				// Create project
				project = this.projects.create_project( data.name )

				console.log( util.inspect( project.folders, { depth: null, colors: true } ) )
			} )

			socket.on( 'update_file', ( data ) =>
			{
				project.update_file( data.path, data.content )

				console.log( util.inspect( project.folders, { depth: null, colors: true } ) )
			} )

			socket.on( 'create_file', ( data ) =>
			{
				project.create_file( data.path, data.content )

				console.log( util.inspect( project.folders, { depth: null, colors: true } ) )
			} )

			socket.on( 'delete_file', ( data ) =>
			{
				project.delete_file( data.path )

				console.log( util.inspect( project.folders, { depth: null, colors: true } ) )
			} )

			socket.on( 'create_folder', ( data ) =>
			{
				project.create_folder( data.path, data.content )

				console.log( util.inspect( project.folders, { depth: null, colors: true } ) )
			} )

			socket.on( 'delete_folder', ( data ) =>
			{
				project.delete_folder( data.path )

				console.log( util.inspect( project.folders, { depth: null, colors: true } ) )
			} )
		} )
	}
}

module.exports = App
