/**
 * Created by tpowellmeto on 29/10/2015.
 * Edited by DonLesnur on 07/10/2016.
 * based on https://github.com/mrdoob/three.js/blob/master/examples/js/effects/PeppersGhostEffect.js
 * peppers ghost effect based on http://www.instructables.com/id/Reflective-Prism/?ALLSTEPS
 * 
 */

THREE.PeppersGhostEffect = function ( renderer ) {

	var scope = this;

	scope.cameraDistance = 15;
	scope.reflectFromAbove = false;

	// Internals
	var _halfWidth, _width, _height;

	var _camera1 = new THREE.PerspectiveCamera(); //top right
	var _camera2 = new THREE.PerspectiveCamera(); //bottom right
	var _camera3 = new THREE.PerspectiveCamera(); //bottom left
	var _camera4 = new THREE.PerspectiveCamera(); //top left
	

	var _position = new THREE.Vector3();
	var _quaternion = new THREE.Quaternion();
	var _scale = new THREE.Vector3();

	// Initialization
	renderer.autoClear = false;

	this.setSize = function ( width, height ) {


		if ( width < height ) {

			_width = width / 2;
			_height = width / 2;

		} else {

			_width = height / 2;
			_height = height / 2;

		}
		renderer.setSize( width, height );

	};

	this.render = function ( scene, camera ) {

		scene.updateMatrixWorld();

		if ( camera.parent === null ) camera.updateMatrixWorld();

		camera.matrixWorld.decompose( _position, _quaternion, _scale );

		//top right
		_camera1.position.copy( _position );
		_camera1.quaternion.copy( _quaternion );
		_camera1.translateZ( scope.cameraDistance );
		_camera1.lookAt( scene.position );		
		_camera1.rotation.z += 45 * ( Math.PI / 180 );
		
		//bottom right
		_camera2.position.copy( _position );
		_camera2.quaternion.copy( _quaternion );
		_camera2.translateX( scope.cameraDistance );
		_camera2.lookAt( scene.position );
		_camera2.rotation.z += 135 * ( Math.PI / 180 );
		
		//bottom left
		_camera3.position.copy( _position );
		_camera3.quaternion.copy( _quaternion );
		_camera3.translateZ( - ( scope.cameraDistance ) );
		_camera3.lookAt( scene.position );
		_camera3.rotation.z -= 135 * ( Math.PI / 180 );
		
		//top left
		_camera4.position.copy( _position );
		_camera4.quaternion.copy( _quaternion );
		_camera4.translateX( - ( scope.cameraDistance ) );
		_camera4.lookAt( scene.position );
		_camera4.rotation.z -= 45 * ( Math.PI / 180 );

		renderer.clear();
		renderer.setScissorTest( true );

		renderer.setScissor( 0, _height , _width, _height );
		renderer.setViewport( 0,  _height , _width, _height );
	

		if ( scope.reflectFromAbove ) {

			renderer.render( scene, _camera1 );

		} else {

			renderer.render( scene, _camera3 );

		}

		renderer.setScissor(  _width , 0, _width, _height );
		renderer.setViewport( _width , 0, _width, _height );

		if ( scope.reflectFromAbove ) {

			renderer.render( scene, _camera3 );

		} else {

			renderer.render( scene, _camera1 );

		}

		renderer.setScissor( 0, 0, _width, _height );
		renderer.setViewport( 0, 0, _width, _height );


		if ( scope.reflectFromAbove ) {

			renderer.render( scene, _camera2 );

		} else {

			renderer.render( scene, _camera4 );

		}

		renderer.setScissor(  _width , _height , _width, _height );
		renderer.setViewport(  _width , _height , _width, _height );


		if ( scope.reflectFromAbove ) {

			renderer.render( scene, _camera4 );

		} else {

			renderer.render( scene, _camera2 );

		}

		renderer.setScissorTest( false );

	};


};
