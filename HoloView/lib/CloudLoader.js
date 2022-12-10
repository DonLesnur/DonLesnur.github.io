/**
 * @author mrdoob / http://mrdoob.com/
 */

var CloudLoader = function ( editor ) {
	var scope = this;
	var signals = editor.signals;
    
	this.loadFile = function ( file ) {

       
		var filename = file.name;
		var extension = filename.split( '.' ).pop().toLowerCase();

		switch ( extension ) {

			case 'babylonmeshdata':

				var reader = new FileReader();
				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;
					var json = JSON.parse( contents );

					var cloudloader = new THREE.BabylonLoader();

					var geometry = cloudloader.parseGeometry( json );
                    
					var material = new THREE.PointCloudMaterial( { size: 0.05, sizeAttenuation: true, alphaTest: 0.5 } );
				       
                    var mesh = new THREE.PointCloud( geometry, material );
					mesh.name = filename;

					editor.addObject( mesh );
					editor.select( mesh );

				}, false );
				reader.readAsText( file );

				break;

			case 'ctm':

				var reader = new FileReader();
				reader.addEventListener( 'load', function ( event ) {

					var data = new Uint8Array( event.target.result );

					var stream = new CTM.Stream( data );
					stream.offset = 0;

					var cloudloader = new THREE.CTMLoader();
					cloudloader.createModel( new CTM.File( stream ), function( geometry ) {

						geometry.sourceType = "ctm";
						geometry.sourceFile = file.name;

                        
                        
                        var material = new THREE.PointCloudMaterial( { size: 0.05, sizeAttenuation: true, alphaTest: 0.5 } );
				        var mesh = new THREE.PointCloud( geometry, material );
                        
						mesh.name = filename;

						editor.addObject( mesh );
						editor.select( mesh );

					} );

				}, false );
				reader.readAsArrayBuffer( file );

				break;


			case 'js':
			case 'json':

			case '3geo':
			case '3mat':
			case '3obj':
			case '3scn':

				var reader = new FileReader();
				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					// 2.0

					if ( contents.indexOf( 'postMessage' ) !== -1 ) {

						var blob = new Blob( [ contents ], { type: 'text/javascript' } );
						var url = URL.createObjectURL( blob );

						var worker = new Worker( url );

						worker.onmessage = function ( event ) {

							event.data.metadata = { version: 2 };
							handleJSON( event.data, file, filename );

						};

						worker.postMessage( Date.now() );

						return;

					}

					// >= 3.0

					var data;

					try {

						data = JSON.parse( contents );

					} catch ( error ) {

						alert( error );
						return;

					}

					handleJSON( data, file, filename );

				}, false );
				reader.readAsText( file );

				break;
  

			case 'ply':
            
				var reader = new FileReader();
				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var geometry = new THREE.PLYLoader().parse( contents );
					geometry.sourceType = "ply";
					geometry.sourceFile = file.name;
                    
                    var material = new THREE.PointCloudMaterial( { size: 0.05, sizeAttenuation: true, alphaTest: 0.5 } );
				    var mesh = new THREE.PointCloud( geometry, material );
                        
					
					mesh.name = filename;

					editor.addObject( mesh );
					editor.select( mesh );

				}, false );
				reader.readAsText( file );

				break;

			case 'stl':

				var reader = new FileReader();
				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var geometry = new THREE.STLLoader().parse( contents );
					geometry.sourceType = "stl";
					geometry.sourceFile = file.name;

				
                    
                    var material = new THREE.PointCloudMaterial( { size: 0.05, sizeAttenuation: true, alphaTest: 0.5 } );
				    var mesh = new THREE.PointCloud( geometry, material );  
                    
					mesh.name = filename;

					editor.addObject( mesh );
					editor.select( mesh );

				}, false );

				if ( reader.readAsBinaryString !== undefined ) {

					reader.readAsBinaryString( file );

				} else {

					reader.readAsArrayBuffer( file );

				}

				break;

			/*
			case 'utf8':

				var reader = new FileReader();
				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var geometry = new THREE.UTF8Loader().parse( contents );
					var material = new THREE.MeshLambertMaterial();

					var mesh = new THREE.Mesh( geometry, material );

					editor.addObject( mesh );
					editor.select( mesh );

				}, false );
				reader.readAsBinaryString( file );

				break;
			*/

			case 'vtk':

				var reader = new FileReader();
				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var geometry = new THREE.VTKLoader().parse( contents );
					geometry.sourceType = "vtk";
					geometry.sourceFile = file.name;

            
                    
                        var material = new THREE.PointCloudMaterial( { size: 0.05, sizeAttenuation: true, alphaTest: 0.5 } );
				        var mesh = new THREE.PointCloud( geometry, material );
                    
                    
					mesh.name = filename;

					editor.addObject( mesh );
					editor.select( mesh );

				}, false );
				reader.readAsText( file );

				break;
                
            case 'txt':
            case 'csv':
            case 'asc':
            case 'xyz':
            
				var reader = new FileReader();
				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var geometry = new THREE.TXTLoader().parse( contents );
/*
					
                    var geometry = new THREE.Geometry();
                    
                    var i;
                    
                    for ( i = 0; i < 10000000; i ++ ) {

					var vertex = new THREE.Vector3();
					vertex.x = Math.random() * 2000 - 1000;
					vertex.y = Math.random() * 2000 - 1000;
					vertex.z = Math.random() * 2000 - 1000;

					geometry.vertices.push( vertex );

				}
                    
*/
                    
					
                    geometry.sourceType = "txt";
					geometry.sourceFile = file.name;

                    var material = new THREE.PointCloudMaterial( { size: 0.05, sizeAttenuation: true, alphaTest: 0.5 } );
				    var mesh = new THREE.PointCloud( geometry, material );
                        
					
					mesh.name = filename;

					editor.addObject( mesh );
					editor.select( mesh );

				}, false );
				reader.readAsText( file );

				break;   
                
                


			default:

				alert( 'Unsupported cloud format (' + extension +  ').' );

				break;

		}

	}

	var handleJSON = function ( data, file, filename ) {

		if ( data.metadata === undefined ) { // 2.0

			data.metadata = { type: 'Geometry' };

		}

		if ( data.metadata.type === undefined ) { // 3.0

			data.metadata.type = 'Geometry';

		}

		if ( data.metadata.version === undefined ) {

			data.metadata.version = data.metadata.formatVersion;

		}

        
		if ( data.metadata.type === 'BufferGeometry' ) {

			var cloudloader = new THREE.BufferGeometryLoader();
			var result = cloudloader.parse( data );

			var mesh = new THREE.Mesh( result );

			editor.addObject( mesh );
			editor.select( mesh );

		} else if ( data.metadata.type.toLowerCase() === 'geometry' ) {

			var cloudloader = new THREE.JSONLoader();
			var result = cloudloader.parse( data );

			var geometry = result.geometry;
			var material;

			if ( result.materials !== undefined ) {


					material = new THREE.PointCloudMaterial( { size: 0.05, sizeAttenuation: true, alphaTest: 0.5 } );

				} else {

					material = result.materials[ 0 ];

				}


			geometry.sourceType = "ascii";
			geometry.sourceFile = file.name;

			var mesh;

			if ( geometry.animation && geometry.animation.hierarchy ) {

				mesh = new THREE.SkinnedMesh( geometry, material );


			}else{
                
                
				mesh = new THREE.PointCloud( geometry, material );
                
            }

			mesh.name = filename;

			editor.addObject( mesh );
			editor.select( mesh );

		} else if ( data.metadata.type.toLowerCase() === 'object' ) {

			var cloudloader = new THREE.ObjectLoader();
			var result = cloudloader.parse( data );

			if ( result instanceof THREE.Scene ) {

				editor.setScene( result );

			} else {

				editor.addObject( result );
				editor.select( result );

			}

		} else if ( data.metadata.type.toLowerCase() === 'scene' ) {

			// DEPRECATED

			var cloudloader = new THREE.SceneLoader();
			cloudloader.parse( data, function ( result ) {

				editor.setScene( result.scene );

			}, '' );

		}

	};

}
