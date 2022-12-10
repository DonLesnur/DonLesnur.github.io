function scalemodel(object){

	//console.log (object);
    var xmin = Infinity;
    var xmax = -Infinity;
    var ymin = Infinity;
    var ymax = -Infinity;
    var zmin = Infinity;
    var zmax = -Infinity;

    for (var i = 0; i < object.geometry.vertices.length; i++) {
        var v = object.geometry.vertices[i];
        if (v.x < xmin)
            xmin = v.x;
        else if (v.x > xmax)
            xmax = v.x;
        if (v.y < ymin)
            ymin = v.y;
        else if (v.y > ymax)
            ymax = v.y;
        if (v.z < zmin)
            zmin = v.z;
        else if (v.z > zmax)
            zmax = v.z;
    }
    /*console.log("object.geometry.vertices.length= "+ object.geometry.vertices.length);
    console.log("xmin= "+ xmin);
    console.log("xmax= "+ xmax);
    console.log("ymin= "+ ymin);
    console.log("ymax= "+ ymax);
    console.log("zmin= "+ zmin);
    console.log("zmax= "+ zmax);
	*/
    /* translate the center of the object to the origin */
    var centerX = (xmin+xmax)/2;
    var centerY = (ymin+ymax)/2;
    var centerZ = (zmin+zmax)/2;
    var max = Math.max(centerX - xmin, xmax - centerX);
    max = Math.max(max, Math.max(centerY - ymin, ymax - centerY) );
    max = Math.max(max, Math.max(centerZ - zmin, zmax - centerZ) );
    var scale = 3/max;
    object.position.set( -centerX, -centerY, -centerZ );
    console.log("Loading finished, scaling object by " + scale);
    console.log("Center at ( " + centerX + ", " + centerY + ", " + centerZ + " )");

    /* Create the wrapper, model, to scale and rotate the object. */

    model = new THREE.Object3D();
    model.add(object);
    model.scale.set(scale,scale,scale);
    rotateX = rotateY = 0;
	if(object.geometry.animations!==undefined){
		mixer.clipAction( object.geometry.animations[ 0 ], object )
								.setDuration( 1 )			// one second
								.startAt( - Math.random() )	// random phase (already running)
								.play();
	}

	group.add(model);
    render();
}

 function abortRead() {
    reader.abort();
  }

  function errorHandler(evt) {
    switch(evt.target.error.code) {
      case evt.target.error.NOT_FOUND_ERR:
        alert('File Not Found!');
        break;
      case evt.target.error.NOT_READABLE_ERR:
        alert('File is not readable');
        break;
      case evt.target.error.ABORT_ERR:
        break; // noop
      default:
        alert('An error occurred reading this file.');
    };
  }

function collectfiles(files){

	var filestack=[],imagestack=[]

    //var extraFiles = {}, file;
	//if(files.length > 2){
	//	alert('Maximum 2 files.');
	//	exit();
	//};

	for (var i = 0; i < files.length; i++) {
		if(files[i].type.split("/",1)[0]=="image"){
			imagestack.push(files[i])
		}else{
			filestack.push(files[i])
		}
    }
	if(filestack.length==1){
		loadfile(filestack[0],imagestack)
	}else{
		alert("Bitte eine 3D-Datei wählen");
	}


}


function loadfile(file,imagelist){

	if (group) {
        scene.remove(group);
		group = new THREE.Group();
		scene.add( group );
    }

	set_initval();

    renderer.setClearColor();
    render();

	var filename = file.name;
	var extension = filename.split( '.' ).pop().toLowerCase();


	reader = new FileReader();
	reader.onerror = errorHandler;
	reader.onabort = function(e) {
		alert('File read cancelled');
	};
	reader.onloadstart = function(e) {

		document.getElementById('loadingbar').style.display = 'block' ;
	};
	reader.onload = function(e) {
		// Ensure that the progress bar displays 100% at the end.
		document.getElementById('infofield').innerHTML=filename+' geladen.' ;
		document.getElementById('loadingbar_bg').style.width = '100%' ;
		document.getElementById('loadingbar_perc').textContent='100%' ;
	}

	reader.addEventListener( 'progress', function ( event ) {

		var size = '(' + Math.floor( event.total / 1000 ) + ' KB)';
		var progress = Math.floor( ( event.loaded / event.total ) * 100 ) +'%';
		document.getElementById('infofield').innerHTML='Lade: '+filename+' '+size ;
		document.getElementById('loadingbar_perc').textContent =progress ;
		document.getElementById('loadingbar_bg').style.width = progress ;
		console.log( 'Loading', filename, size, progress );

	} );

	try{
		switch ( extension ) {

			case 'amf':

				alert( 'Unsupported file format (' + extension +  ').' );
				break;

				reader.addEventListener( 'load', function ( event ) {

					var loader = new THREE.AMFLoader();
					var amfobject = loader.parse( event.target.result );

					editor.execute( new AddObjectCommand( amfobject ) );

				}, false );
				reader.readAsArrayBuffer( file );

				break;

			case 'awd':

				alert( 'Unsupported file format (' + extension +  ').' );
				break;

				reader.addEventListener( 'load', function ( event ) {

					var loader = new THREE.AWDLoader();
					var scene = loader.parse( event.target.result );

					editor.execute( new SetSceneCommand( scene ) );

				}, false );
				reader.readAsArrayBuffer( file );

				break;

			case 'babylon':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;
					var json = JSON.parse( contents );

					var loader = new THREE.BabylonLoader();
					var scene = loader.parse( json );


					//if(scene.children.length>1){
						scene.traverse( function ( object ) {
							if ( object instanceof THREE.Mesh ) {
								object.material = new THREE.MeshLambertMaterial();
								object.geometry = new THREE.Geometry().fromBufferGeometry( object.geometry );
								scalemodel(object);
							}

						} );
					/*}else{
						scene.traverse( function ( object ) {
							if ( object instanceof THREE.Mesh ) {
								object.material = new THREE.MeshLambertMaterial();
								//object.geometry = new THREE.Geometry().fromBufferGeometry( object.geometry );
							}
						} );
						//scalemodel(scene);
						group.add(scene);
					}
					*/

					//group.add(scene);
					render();


				}, false );
				reader.readAsText( file );

				break;

			case 'babylonmeshdata':

				alert( 'Unsupported file format (' + extension +  ').' );
				break;

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;
					var json = JSON.parse( contents );

					var loader = new THREE.BabylonLoader();

					var geometry = loader.parseGeometry( json );
					var material = new THREE.MeshLambertMaterial();

					var mesh = new THREE.Mesh( geometry, material );
					mesh.name = filename;

					scalemodel(mesh);

				}, false );
				reader.readAsText( file );

				break;

			case 'ctm':
				

				reader.addEventListener( 'load', function ( event ) {

					var data = new Uint8Array( event.target.result );

					var stream = new CTM.Stream( data );
					stream.offset = 0;
					console.log(data)
					var loader = new THREE.CTMLoader();
					//loader.createModel( new CTM.File( stream ), function( geometry ) {
					//loader.load( data, function( geometry ) {
					loader.load( "./models/sc/corsair.ctm", function( geometry ) {

						//geometry.sourceType = "ctm";
						//geometry.sourceFile = file.name;
						//
						//var material = new THREE.MeshLambertMaterial();
						//
						//var mesh = new THREE.Mesh( geometry, material );
						//mesh.name = filename;
						//
						//scalemodel(mesh);
						var mat = new THREE.MeshLambertMaterial({color: 0xff8888});
						group = new THREE.Mesh(geometry, mat);
						group.scale.set(20, 20, 20);
						scene.add(group);
						

					} , {});

				}, false );
				reader.readAsArrayBuffer( file );

				break;

			case 'dae':
				reader.addEventListener( 'load', function ( event ) {
				var dae_path;
				var files=[file];

				for (var i = 0; i < imagelist.length; i++) {
					files.push(imagelist[i])
				}


				var extraFiles = {}, file_b;
				for (var i = 0; i < files.length; i++) {
					file_b = files[i];
					extraFiles[file_b.name] = file_b;

					//Filename ends in .dae/.DAE
					if (files[i].name.match(/\w*.dae\b/i)) {
						dae_path = files[i].name;
						console.log(dae_path);
					}
				}
					console.log(extraFiles)
				const manager = new THREE.LoadingManager();
				manager.setURLModifier(function (url, path) {

				url = url.split('/');
				url = url[url.length - 1];
						//console.log("URL>>"+url);
				if (extraFiles[url] !== undefined) {

					var blobURL = URL.createObjectURL(extraFiles[url]);
					console.log(blobURL); //Blob location created from files selected from file input
					return blobURL;

				}

				return url;
				});

				var loader = new THREE.ColladaLoader(manager);
				loader.load(dae_path, function (collada) {

				var animations = collada.animations;
				mixer = new THREE.AnimationMixer( collada.scene );

				if(collada.animations.length>0){
					var action = mixer.clipAction( animations[ 0 ] ).play();
				}
				console.log(collada);
				//var dae = collada.scene;

				group.add(collada.scene);
				render();
				});

				}, false );
				reader.readAsText( file);



				break;
			case 'fbx':

				alert( 'Unsupported file format (' + extension +  ').' );
				break;

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var loader = new THREE.FBXLoader();
					var object = loader.parse( contents );

					editor.execute( new AddObjectCommand( object ) );

				}, false );
				reader.readAsText( file );

				break;

			case 'glb':
			case 'gltf':

				alert( 'Unsupported file format (' + extension +  ').' );
				break;

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var loader = new THREE.GLTFLoader();
					loader.parse( contents, function ( result ) {

						result.scene.name = filename;
						editor.execute( new AddObjectCommand( result.scene ) );

					} );

				}, false );
				reader.readAsArrayBuffer( file );

				break;


			case 'json':
			case '3geo':
			case '3mat':
			case '3obj':
			case '3scn':

				alert( 'Unsupported file format (' + extension +  ').' );
				break;

			case 'js':
				//console.log("got json")
				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					// 2.0

					if ( contents.indexOf( 'postMessage' ) !== - 1 ) {

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


			case 'kmz':

				alert( 'Unsupported file format (' + extension +  ').' );
				break;

				reader.addEventListener( 'load', function ( event ) {

					var loader = new THREE.KMZLoader();
					var collada = loader.parse( event.target.result );

					collada.scene.name = filename;

					editor.execute( new AddObjectCommand( collada.scene ) );

				}, false );
				reader.readAsArrayBuffer( file );

				break;

			case 'md2':

				alert( 'Unsupported file format (' + extension +  ').' );
				break;

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var geometry = new THREE.MD2Loader().parse( contents );
					var material = new THREE.MeshLambertMaterial( {
						morphTargets: true,
						morphNormals: true
					} );

					var mesh = new THREE.Mesh( geometry, material );
					mesh.mixer = new THREE.AnimationMixer( mesh );
					mesh.name = filename;

					scalemodel(mesh);

				}, false );
				reader.readAsArrayBuffer( file );

				break;

			case 'obj':

				//alert( 'Unsupported file format (' + extension +  ').' );
				//break;
				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var scene = new THREE.OBJLoader().parse( contents );
					scene.name = filename;

					if(imagelist!==undefined){
						var image_reader = new FileReader();
						image_reader.onload  = function(theFileData) {

							var texture = new THREE.TextureLoader().load( theFileData.target.result );
							texture.image.crossOrigin = "anonymous";
							try{
								scene.traverse( function ( object ) {
									if ( object instanceof THREE.Mesh ) {
										object.material.map = texture;
										object.geometry = new THREE.Geometry().fromBufferGeometry( object.geometry );
										scalemodel(object);
									}
								} );
							}
							catch(err){
								group.add(scene);
							}
						}
						image_reader.readAsDataURL(imagelist);
					}else{

						scene.traverse( function ( object ) {
							if ( object instanceof THREE.Mesh ) {
								object.material = new THREE.MeshLambertMaterial();
								object.geometry = new THREE.Geometry().fromBufferGeometry( object.geometry );
								scalemodel(object);
							}

						} );


					}


					render();


				}, false );
				reader.readAsText( file );

				break;

			case 'playcanvas':

				alert( 'Unsupported file format (' + extension +  ').' );
				break;

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;
					var json = JSON.parse( contents );

					var loader = new THREE.PlayCanvasLoader();
					var object = loader.parse( json );

					editor.execute( new AddObjectCommand( object ) );

				}, false );
				reader.readAsText( file );

				break;

			case 'ply':

				reader.addEventListener( 'load', function ( event ) {


					var contents = event.target.result;
					//console.log(contents);
					var geometry = new THREE.BufferGeometry();
					geometry = new THREE.PLYLoader().parse( contents );


					var material = new THREE.PointCloudMaterial( { size: 0.05, sizeAttenuation: true, alphaTest: 0.5 } );

					material.vertexColors = THREE.VertexColors;
					material.side = THREE.DoubleSide;
					try{
						geometry = new THREE.Geometry().fromBufferGeometry( geometry );
						geometry.sourceType = "ply";
						geometry.sourceFile = file.name;

						if(pointormesh()){
							var mesh=new THREE.PointCloud(geometry, material);
						}else{
							var mesh=new THREE.Mesh(geometry, material);
						}

						mesh.name = filename;
						//console.log(mesh);


						scalemodel(mesh);
					}
					catch(err){
						geometry.sourceType = "ply";
						geometry.sourceFile = file.name;
						if(pointormesh()){
							var mesh=new THREE.PointCloud(geometry, material);
						}else{
							var mesh=new THREE.Mesh(geometry, material);
						}
						mesh.name = filename;
						//console.log(mesh);
						//scalemodel(mesh);
						group.add(mesh);

					}

				}, false );
				reader.readAsText( file );

				break;

			case 'stl':

				alert( 'Unsupported file format (' + extension +  ').' );
				break;

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var geometry = new THREE.STLLoader().parse( contents );
					geometry.sourceType = "stl";
					geometry.sourceFile = file.name;

					var material = new THREE.MeshLambertMaterial();

					var mesh = new THREE.Mesh( geometry, material );
					mesh.name = filename;

					scalemodel(mesh);

				}, false );

				if ( reader.readAsBinaryString !== undefined ) {

					reader.readAsBinaryString( file );

				} else {

					reader.readAsArrayBuffer( file );

				}

				break;

			/*
			case 'utf8':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var geometry = new THREE.UTF8Loader().parse( contents );
					var material = new THREE.MeshLambertMaterial();

					var mesh = new THREE.Mesh( geometry, material );

					scalemodel(mesh);

				}, false );
				reader.readAsBinaryString( file );

				break;
			*/

			case 'vtk':

				alert( 'Unsupported file format (' + extension +  ').' );
				break;

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var geometry = new THREE.VTKLoader().parse( contents );
					geometry.sourceType = "vtk";
					geometry.sourceFile = file.name;

					var material = new THREE.MeshLambertMaterial();

					var mesh = new THREE.Mesh( geometry, material );
					mesh.name = filename;

					scalemodel(mesh);

				}, false );
				reader.readAsText( file );

				break;

			case 'wrl':

				alert( 'Unsupported file format (' + extension +  ').' );
				break;

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var result = new THREE.VRMLLoader().parse( contents );

					editor.execute( new SetSceneCommand( result ) );

				}, false );
				reader.readAsText( file );

				break;

			default:

				alert( 'Unsupported file format (' + extension +  ').' );

				break;

		}
	}catch(err){
		alert("Fehler")
	}

	function handleJSON( data, file, filename ) {
		try{

			if ( data.metadata === undefined ) { // 2.0

				data.metadata = { type: 'Geometry' };

			}

			if ( data.metadata.type === undefined ) { // 3.0

				data.metadata.type = 'Geometry';

			}

			if ( data.metadata.formatVersion !== undefined ) {

				data.metadata.version = data.metadata.formatVersion;

			}

			switch ( data.metadata.type.toLowerCase() ) {

				case 'buffergeometry':

					var loader = new THREE.BufferGeometryLoader();
					var result = loader.parse( data );

					var mesh = new THREE.Mesh( result );

					scalemodel(mesh);

					break;

				case 'geometry':

					var loader = new THREE.JSONLoader();

					var tpath;
					if(file.dir!==undefined){
						tpath=file.dir.substring(0,file.dir.lastIndexOf('/')+1);
					}

					var result = loader.parse( data,tpath);
					//console.log(result.materials.length);
					var geometry = result.geometry;
					var material= new THREE.MeshLambertMaterial();

					if ( result.materials !== undefined ) {

						/*if ( result.materials.length > 1 ) {
							//MultiMaterial not jet supported
							//material = new THREE.MultiMaterial( result.materials );
							material = new THREE.MeshLambertMaterial();

						} else */if(result.materials.length =1) {

							if(file.dir!==undefined){

								material = result.materials[ 0 ];
							}else if(image!==undefined){
								//console.log("bla")
								material = result.materials[ 0 ];
								var image_reader = new FileReader();
								var texture_image = new Image();
								texture_image.crossOrigin = "anonymous";
								var texture_image_data;

								image_reader.onload  = function(theFileData) {
									texture_image_data = theFileData.target.result;
									texture_image.src = texture_image_data;

									texture = new THREE.Texture();

									texture_image.onload = function () {
										texture.image = texture_image;
										texture.needsUpdate = true;
										material.map = texture;
									};
								}
								image_reader.readAsDataURL(image);
							}else{

								material = new THREE.MeshLambertMaterial();

							}
						}else{

							material = new THREE.MeshLambertMaterial();
						}
					} else {

						material = new THREE.MeshLambertMaterial();

					}
					material.morphTargets = true;
					material.color.setHex( 0xffffff );
					geometry.sourceType = "ascii";
					geometry.sourceFile = file.name;

					var mesh;

					if ( geometry.animation && geometry.animation.hierarchy ) {

						mesh = new THREE.SkinnedMesh( geometry, material );

					} else {

						mesh = new THREE.Mesh( geometry, material );

					}

					var mesh=new THREE.Mesh(geometry, material);

					mesh.name = filename;

					scalemodel (mesh);


					break;

				case 'object':

					var loader = new THREE.ObjectLoader();

					//loader.setTexturePath( scope.texturePath );

					var result = loader.parse( data );

					group.add(result)

					break;

				case 'app':

					alert("Upps. Beim Lesen der Datei ist ein Fehler aufgetreten. Der Vorgang wurde abgebrochen.")

					break;

			}

		}catch(err){
			alert("Upps. Beim Lesen der Datei ist ein Fehler aufgetreten. Der Vorgang wurde abgebrochen.");
			set_initval();
		}
	}

	function pointormesh(){
		var r = confirm("Als Punktwolke laden?");
		if (r == true) {
			return true;
		} else {
			return false;
		}
	}

}
