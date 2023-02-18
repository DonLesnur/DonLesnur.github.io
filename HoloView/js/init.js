/*

With a little help by 
	https://threejs.org/examples/
	http://www.w3schools.com

	Author: Alexander Klauss
*/
var group, model, manager, loader;
var container, width, height;
var camera, scene, renderer, effect;
var cur_rot_x, cur_rot_y, cur_rot_z ;
var reader;
var anim_speed=0;
var interval;


$(function(){
  if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
	
	set_initval();
	init();
	animate();
	
	$("#sel_demo").change(function () {
		
		var href = window.location.href;
		var dir = href.substring(0, href.lastIndexOf('/')) + "/"+$("#sel_demo").val();
		var blob = null;
		var xhr = new XMLHttpRequest();
		xhr.open("GET", dir);
		xhr.responseType = "blob";//force the HTTP response, response-type header to be blob
		xhr.onload = function()
		{
			blob = xhr.response;//xhr.response is now a blob object
			blob.name=dir.substring(dir.lastIndexOf('/')+1, dir.length);
			blob.dir=dir;
			loadfile(blob)
		}
		xhr.send();
		
    });
	function init() {
		
		getwindowsize();
		container = document.getElementById("container");
		camera = new THREE.PerspectiveCamera( 60, width /  height, 1, 100000 );
		scene = new THREE.Scene();
		group = new THREE.Group();
		scene.add( group );
		//var pointlight = new THREE.PointLight( 0xffffff, 1, 0 );
		//pointlight.position.set( 0, 0, 0 );
		//scene.add( pointlight );
		//scene.add( new THREE.AmbientLight( 0x404040,0.5 ) );
		scene.add( new THREE.AmbientLight( 0xffffff,0.5 ));
		
		clock = new THREE.Clock();
		mixer = new THREE.AnimationMixer( scene );
		
		var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
		directionalLight.position.set( 100, 100, 100 );
		scene.add( directionalLight );
		directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
		directionalLight.position.set( 100, 100, -100 );
		scene.add( directionalLight );
		
		
		var texture = new THREE.TextureLoader().load( './img/grosses_staatswappen.png' );
		var texture2 = new THREE.TextureLoader().load( './img/bannergrafik.jpg' );
		var materials = [
			new THREE.MeshLambertMaterial( { color: 0xdddddd, shading: THREE.FlatShading } ),
			new THREE.MeshLambertMaterial( { color: 0xdddddd, shading: THREE.FlatShading } ),
			new THREE.MeshLambertMaterial( { color: 0xdddddd, shading: THREE.FlatShading } ),
			new THREE.MeshLambertMaterial( { color: 0xdddddd, shading: THREE.FlatShading } ),
			new THREE.MeshPhongMaterial({
				map: texture
			}),
			new THREE.MeshPhongMaterial({
				map: texture2
			})
		];
		model = new THREE.Mesh( new THREE.BoxGeometry( 1, 1, 0.07 ),  materials  );
		group.add( model );
			
		cur_rot_x=document.getElementById('rots_x').value/10;
		cur_rot_y=document.getElementById('rots_y').value/10;
		cur_rot_z=document.getElementById('rots_z').value/10;
		
		renderer = new THREE.WebGLRenderer();
		renderer.setClearColor(new THREE.Color(0, 0, 0));
		renderer.setPixelRatio( window.devicePixelRatio );
		container.appendChild( renderer.domElement );
		effect = new THREE.PeppersGhostEffect( renderer );
		effect.setSize( width , height  );
		effect.cameraDistance = document.getElementById("zoom").value;
		window.addEventListener( 'resize', onWindowResize, false );
		
	}

	function getwindowsize(){
		if(window.innerWidth>window.innerHeight){
			if(window.innerHeight<window.innerWidth*0.7){
				width=window.innerHeight;
				height=width;
				document.getElementById("menu").style.width=window.innerWidth-width+"px";
			}else{
				width=window.innerWidth*0.7;
				height=width;
				document.getElementById("menu").style.width=window.innerWidth-width+"px";
			}
		}else{
			document.getElementById("menu").style.width="100%";
			if(window.innerWidth<window.innerHeight*0.7){
				width=window.innerWidth;
				height=width;
				document.getElementById("menu").style.height=window.innerHeight-height+"px";
			}else{
				width=window.innerHeight*0.7;
				height=width;
				document.getElementById("menu").style.height=window.innerHeight-height+"px";
			}
		}
	}
	function onWindowResize() {
		getwindowsize();
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		effect.setSize( width, height );
	}
	
	
	
	function btn_press(e){
		e.preventDefault();

		interval=setInterval(function () {
			
			fieldName = $(e.currentTarget).attr('data-field');
			type      = $(e.currentTarget).attr('data-type');
			var input = $("input[id='"+fieldName+"']");
			var currentVal = parseFloat(input.val());
			var multi=1;
			var step=parseFloat(input.attr('step'));

			if ( isNaN( step)){
				step=1;
			}

			if (!isNaN(currentVal)) {
				if(Math.abs(currentVal)>100){
					multi=5;
				}else if(Math.abs(currentVal)>1000){
					multi=25;
				}

				if(type == 'minus') {
					if(currentVal > input.attr('min')) {
						input.val(currentVal - step*multi).change();
					} 
					if(parseFloat(input.val()) == input.attr('min')) {
						$(e.currentTarget).attr('disabled', true);
						clearInterval(interval);
					}
				} else if(type == 'plus') {
					if(currentVal < input.attr('max')) {
						input.val(currentVal + step*multi).change();
					}
					if(parseFloat(input.val()) == input.attr('max')) {
						$(e.currentTarget).attr('disabled', true);
						clearInterval(interval);
					}
		
				}
			} else {
				input.val(0);
			}
		}, 75);
		
	}



	//$('.btn-number').mousedown(function(e){
	$('.btn-number').on("mousedown",function(e){
	//$('.btn-number').touchstart(function(e){
		btn_press(e)

	//}).on("mouseup", function () {
	}).on("touchstart", function (e) {
		btn_press(e)
    }).on("touchend", function () {
        clearInterval(interval);
    }).on("mouseup", function () {
        clearInterval(interval);
    });
	
	$('.input-number').focusin(function(){
		$(this).data('oldValue', $(this).val());
	});
	$('.input-number').change(function() {
		minValue =  parseFloat($(this).attr('min'));
		maxValue =  parseFloat($(this).attr('max'));
		valueCurrent = parseFloat($(this).val());
		id = $(this).attr('id');	
		if(valueCurrent >= minValue) {
			$(".btn-number[data-type='minus'][data-field='"+id+"']").removeAttr('disabled')
		} else {
			$(this).val($(this).data('oldValue'));
			valueCurrent=$(this).data('oldValue')
		}
		if(valueCurrent <= maxValue) {
			$(".btn-number[data-type='plus'][data-field='"+id+"']").removeAttr('disabled')
		} else {
			$(this).val($(this).data('oldValue'));
			valueCurrent=$(this).data('oldValue')
		}
		setvalue(id,valueCurrent)
	});
	$('.input-number').keydown(function (e) {
        // Allow: backspace, delete, tab, escape, enter and .
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 190]) !== -1 ||
             // Allow: Ctrl+A
            (e.keyCode == 65 && e.ctrlKey === true) || 
             // Allow: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)) {
                 // let it happen, don't do anything
                 return;
        }
        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    });

	
});


	function animate() {
		requestAnimationFrame( animate );
		render();
	}
	function render() {
		camera.lookAt( scene.position );
		group.rotation.x += cur_rot_x;
		group.rotation.y += cur_rot_y;
		group.rotation.z += cur_rot_z;
		effect.render( scene, camera );
		mixer.update( clock.getDelta()*anim_speed );
	}

function setvalue(id,val){
	var name;
	switch(id) {
		case "zoom":
		case "zoom_inp":
			if(val>500||val<0){
				alert("Bitte wählen Sie einen Wert zwischen 0 und 500")
				break;
			}
			document.getElementById('zoom').value=val;
			document.getElementById('zoom_inp').value=val;
			effect.cameraDistance = val;
			break;
		case "pos_x":
		case "pos_x_inp":
			if(val>10000||val<-10000){
				alert("Bitte wählen Sie einen Wert zwischen -10000 und 10000")
				break;
			}
			document.getElementById('pos_x').value=val;
			document.getElementById('pos_x_inp').value=val;
			group.position.x = val/100;
			break;
		case "pos_y":
		case "pos_y_inp":
			if(val>10000||val<-10000){
				alert("Bitte wählen Sie einen Wert zwischen -10000 und 10000")
				break;
			}
			document.getElementById('pos_y').value=val;
			document.getElementById('pos_y_inp').value=val;
			group.position.y = val/100;
			break;
		case "pos_z":
		case "pos_z_inp":
			if(val>10000||val<-10000){
				alert("Bitte wählen Sie einen Wert zwischen -10000 und 10000")
				break;
			}
			document.getElementById('pos_z').value=val;
			document.getElementById('pos_z_inp').value=val;
			group.position.z = val/100;
			break;
		case "rot_x":
		case "rot_x_inp":
			if(val>360||val<-360){
				alert("Bitte wählen Sie einen Wert zwischen -360 und 360")
				break;
			}
			document.getElementById('rot_x').value=val;
			document.getElementById('rot_x_inp').value=val;
			group.rotation.x = val/57.2957795;
			break;
		case "rot_y":
		case "rot_y_inp":
			if(val>360||val<-360){
				alert("Bitte wählen Sie einen Wert zwischen -360 und 360")
				break;
			}
			document.getElementById('rot_y').value=val;
			document.getElementById('rot_y_inp').value=val;
			group.rotation.y = val/57.2957795;
			break;
		case "rot_z":
		case "rot_z_inp":
			if(val>360||val<-360){
				alert("Bitte wählen Sie einen Wert zwischen -360 und 360")
				break;
			}
			document.getElementById('rot_z').value=val;
			document.getElementById('rot_z_inp').value=val;
			group.rotation.z = val/57.2957795;
			break;
		case "rots_x":
		case "rots_x_inp":
			if(val>2||val<-2){
				alert("Bitte wählen Sie einen Wert zwischen -2 und 2")
				break;
			}
			document.getElementById('rots_x').value=val;
			document.getElementById('rots_x_inp').value=val;
			document.getElementById('btn_pause_rot').innerHTML='&#10073&#10073 Pause'
			cur_rot_x=val/10;
			break;
		case "rots_y":
		case "rots_y_inp":
			if(val>2||val<-2){
				alert("Bitte wählen Sie einen Wert zwischen -2 und 2")
				break;
			}
			document.getElementById('rots_y').value=val;
			document.getElementById('rots_y_inp').value=val;
			document.getElementById('btn_pause_rot').innerHTML='&#10073&#10073 Pause'
			cur_rot_y=val/10;
			break;
		case "rots_z":
		case "rots_z_inp":
			if(val>2||val<-2){
				alert("Bitte wählen Sie einen Wert zwischen -2 und 2")
				break;
			}
			document.getElementById('rots_z').value=val;
			document.getElementById('rots_z_inp').value=val;
			document.getElementById('btn_pause_rot').innerHTML='&#10073&#10073 Pause'
			cur_rot_z=val/10;
			break;
		case "anims":
		case "anims_inp":
			if(val>10||val<-10){
				alert("Bitte wählen Sie einen Wert zwischen -10 und 10")
				break;
			}
			document.getElementById('anims').value=val;
			document.getElementById('anims_inp').value=val;
			document.getElementById('btn_pause_rot').innerHTML='&#10073&#10073 Pause'
			anim_speed=val;
			break;
		case "light_base":
		case "light_base_inp":
			if(val>100||val<0){
				alert("Bitte wählen Sie einen Wert zwischen 100 und 0")
				break;
			}
			document.getElementById('light_base').value=val;
			document.getElementById('light_base_inp').value=val;
			//console.log(scene.children)
			setvalue('AmbientLight',val);
			
			break;
		case "light_dir":
		case "light_dir_inp":
			if(val>100||val<0){
				alert("Bitte wählen Sie einen Wert zwischen 100 und 0")
				break;
			}
			document.getElementById('light_dir').value=val;
			document.getElementById('light_dir_inp').value=val;
			setvalue('DirectionalLight',val);
			
			break;
		
		case "AmbientLight":
			var lights=scene.children;
			
			scene.children.forEach(function(element){
				if(element.type=='AmbientLight'){
					element.intensity=val/100;
				}
				
			})
			break;
		
		case "DirectionalLight":
			var lights=scene.children;
			
			scene.children.forEach(function(element){
				if(element.type=='DirectionalLight'){
					element.intensity=val/100;
				}
				
			})
			break;
	}
}

function pause_rot(){
	if(document.getElementById('btn_pause_rot').innerHTML.includes('Pause')){
		cur_rot_x=0;
		cur_rot_y=0;
		cur_rot_z=0;
		document.getElementById('btn_pause_rot').innerHTML='&#9654 Play'
	}else{
		cur_rot_x=document.getElementById('rots_x').value/10;
		cur_rot_y=document.getElementById('rots_y').value/10;
		cur_rot_z=document.getElementById('rots_z').value/10;
		document.getElementById('btn_pause_rot').innerHTML='&#10073&#10073 Pause'
	}
}

function pause_anim(){
	if(document.getElementById('btn_pause_anim').innerHTML.includes('Pause')){
		anim_speed=0;
		document.getElementById('btn_pause_anim').innerHTML='&#9654 Play'
	}else{
		anim_speed=document.getElementById('anims').value
		document.getElementById('btn_pause_anim').innerHTML='&#10073&#10073 Pause'
	}
}

function set_initval(){
	document.getElementById('sel_demo').value = 'none';
	document.getElementById('zoom').value = 10;
	document.getElementById('zoom_inp').value=10;
	document.getElementById('light_dir').value=50;
	document.getElementById('light_dir_inp').value=50;	
	document.getElementById('light_base').value=50;
	document.getElementById('light_base_inp').value=50;
	document.getElementById('pos_x').value=0;
	document.getElementById('pos_y').value=0;
	document.getElementById('pos_z').value=0;
	document.getElementById('pos_x_inp').value=0;
	document.getElementById('pos_y_inp').value=0;
	document.getElementById('pos_z_inp').value=0;
	document.getElementById('rot_x').value=0;
	document.getElementById('rot_y').value=0;
	document.getElementById('rot_z').value=0;
	document.getElementById('rot_x_inp').value=0;
	document.getElementById('rot_y_inp').value=0;
	document.getElementById('rot_z_inp').value=0;
	document.getElementById('rots_x').value=0;
	document.getElementById('rots_y').value=0;
	document.getElementById('rots_z').value=0;
	document.getElementById('rots_x_inp').value=0;
	document.getElementById('rots_y_inp').value=0;
	document.getElementById('rots_z_inp').value=0;
	document.getElementById('anims').value=0;
	document.getElementById('anims_inp').value=0;
	anim_speed=0;
	cur_rot_x=0;
	cur_rot_y=0;
	cur_rot_z=0;
	if(group!==undefined){
		effect.cameraDistance = 10;
		group.rotation.x =0; 
		group.rotation.y =0; 
		group.rotation.z =0; 
	}
	document.getElementById('btn_pause_rot').innerHTML='&#10073&#10073 Pause'
	document.getElementById('btn_pause_anim').innerHTML='&#10073&#10073 Pause'
	document.getElementById('infofield').innerHTML='' ;
	document.getElementById('loadingbar_perc').textContent='' ;
	document.getElementById('loadingbar_bg').style.width = '0%' ;
	document.getElementById('loadingbar').style.display = 'none' ;
}
