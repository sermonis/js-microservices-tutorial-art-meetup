const path = require( 'path' );
const bunyan = require( 'bunyan' );

/**
** Get some meta info from the package.json.
**/
const { name, version } = require( '../package.json' );

/**
** Set up a logger.
**/
const getLogger = ( serviceName, serviceVersion, level ) => bunyan.createLogger( { 
	
	name: `${ serviceName }:${ serviceVersion }`, 
	level,

} );

/**
** Configuration options 
** for different environments.
**/
module.exports = {

	development: {

		name,
		version,
		serviceTimeout: 30,

		log: () => getLogger( name, version, 'debug' ),

		data: {
			
			feedback: path.join( __dirname, '../data/feedback.json' ),
		
		},

	},

	production: {

		name,
		version,
		serviceTimeout: 30,

		log: () => getLogger( name, version, 'info' ),

		data: {
			
			feedback: path.join( __dirname, '../data/feedback.json' ),
		
		},

	},

	test: {

		name,
		version,
		serviceTimeout: 30,

		log: () => getLogger( name, version, 'fatal' ),

		data: {
			
			feedback: path.join( __dirname, '../data/feedback.json' ),
		
		},

	},

};