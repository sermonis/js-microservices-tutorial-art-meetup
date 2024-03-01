const express = require( 'express' );
const ServiceRegistry = require( './lib/ServiceRegistry' );

const service = express();
// const app = express();

module.exports = ( config ) => {

	const log = config.log();
	const serviceRegistry = new ServiceRegistry( log );

	/**
	** Add a request logging 
	** middleware in development mode.
	**/
	if ( service.get( 'env' ) === 'development' ) {

		service.use( ( req, res, next ) => {
			
			log.debug( `${ req.method }: ${ req.url }` );
			return next();
		
		} );

	}

	/**
	** IP getter middleware.
	**/
	const detectIp = ( req, res, next ) => {

		/**
		** Protocol detection (IPv4 vs. IPv6)
		** @see https://www.rapidseedbox.com/blog/ipv6-vs-ipv4
		**/
		req.params.serviceIp = req.connection.remoteAddress.includes( '::' ) 
			? `[${ req.connection.remoteAddress }]` 
			: req.connection.remoteAddress;

			
		log.debug( `detectIp middleware: ${ req.ip }` );

		next();

	};

	/**
	** 
	**/
	service.put( '/register/:serviceName/:serviceVersion/:servicePort', detectIp, ( req, res ) => {
	
		const { serviceName, serviceVersion, servicePort, serviceIp } = req.params;

		const serviceKey = serviceRegistry.register( serviceName, serviceVersion, serviceIp, servicePort );

		return res.json( { result: serviceKey } )
	
	} );

	/**
	** 
	**/
	service.delete( '/unregister/:serviceName/:serviceVersion/:servicePort', detectIp, ( req, res ) => {

		const { serviceName, serviceVersion, servicePort, serviceIp } = req.params;

		const serviceKey = serviceRegistry.unregister( serviceName, serviceVersion, serviceIp, servicePort );

		return res.json( { result: `Deleted ${ serviceKey }`} ); //

	} );

	/**
	** 
	**/
	service.get( '/find/:serviceName/:serviceVersion', ( req, res ) => {

		const { serviceName, serviceVersion } = req.params;

		const svc = serviceRegistry.get( serviceName, serviceVersion );
		
		if ( !svc ) {

			return res.status( 404 ).json( { 
				
				result: 'Service not found',
			
			} );

		}
		return res.json( svc );

	} );

	/**
	** 
	**/
	service.use( ( error, req, res, next ) => {
	
		res.status( error.status || 500 );

		// Log out the error to the console.
		log.error( error );

		return res.json( {
			
			error: {
				
				message: error.message,
			
			},
		
		} );

	} );
	
	return service;

};