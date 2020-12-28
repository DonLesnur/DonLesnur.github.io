var locations =[]
var temp_arr=[]
var des_stack=[]
var antPolyline
var mymap

function init() {

/*
        //Code für IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();

		xmlhttp.onreadystatechange = function() {
				if (this.readyState == 4 && this.status == 200) {
					//console.log(xmlhttp.responseText);
					
					json = JSON.parse(this.responseText); 
				}
			}
		xmlhttp.open("GET", "./data/cel_objects.geojson", false);	
		xmlhttp.send();
        
        
		//console.log(json)
		
		load_loc()
		
		function load_loc(){
			xmlhttp = new XMLHttpRequest();
			
			
			xmlhttp.onreadystatechange = function() {
					if (this.readyState == 4 && this.status == 200) {
						//console.log(xmlhttp.responseText);
						
						loc = JSON.parse(this.responseText); 
					}
				}
			xmlhttp.open("GET", "./data/loc.json", false);	
			xmlhttp.send();
        }
	*/
	//var curpms=[]
	json = json[0]
	loc = loc[0]
	//loc = JSON.parse(loc)
	
		
	for (i = 0; i < json.features.length; i ++) {

		locations.push({System:json.features[i].properties.System,
						Orbit:json.features[i].properties.Orbit,
						Stellar_Object:json.features[i].properties.PMS,
						Location_Type:json.features[i].properties.Location_Type,
						Locations:crarr(json.features[i].properties.PMS),
						Coordinates:json.features[i].geometry.coordinates})
						if (typeof locations[locations.length-1].Locations === "undefined"){
							locations[locations.length-1].Locations=[locations[locations.length-1].Stellar_Object]
						}
	}
		

	function crarr(pms){		
		for (j = 0; j < loc.features.length; j ++) {
			if(pms==loc.features[j].PMS){
				var tarr=[]
				for (k = 0; k < loc.features[j].Locations.length; k ++) {
					tarr.push(loc.features[j].Locations[k].Location)
				}
			}
		}
		return tarr;
	}
		
	
	mymap = L.map('map').setView([-0.02,0.05], 13);
	get_header()
	fill_drop()
	init_map(json);


}

function get_header(){
	var col=['&#215;','&#8679;','&#8681;','System','Orbit','Stellar Object','Location']
    var tbl_head=''
    for (i = 0; i < col.length; i ++) {
        tbl_head+='<th>'+col[i]+'</th>'
    }
    document.getElementById('dep_thead').innerHTML = tbl_head
}

function fill_drop(){
	//var c=0;
    for (i = 0; i < locations.length; i ++) {

		for (j=0;j<locations[i].Locations.length;j++){
			//console.log(locations[i].Locations[j])
			temp_arr.push([locations[i].Locations[j],locations[i].Stellar_Object,i,j])
		}
    }
    
	temp_arr.sort();
	//console.log(temp_arr)
    //var drop_dep_cont=''
    for (i = 0; i < temp_arr.length; i ++) {
        set_cont(i)
    }
    //document.getElementById('drop_dep').innerHTML = drop_dep_cont; 
}

function set_cont(i){
	var text=temp_arr[i][0]+', '+temp_arr[i][1]
	document.getElementById('drop_dep').innerHTML+='<a class="dropdown-item" style="display:block;" href="#"  onclick="drop_sel('+temp_arr[i][2]+','+temp_arr[i][3]+')">'+text+'</a>'
}
function search_location(){
    var searchtxt=document.getElementById("inp_search").value;
    //document.getElementById('drop_dep').class.add
    document.getElementById("drop_dep").classList.add("show");
    document.getElementById('drop_dep').innerHTML = '';
    //drop_dep_cont=''
    if(searchtxt==""){
		document.getElementById("drop_dep").classList.remove("show")
		for (i = 0; i < temp_arr.length; i ++) {
			set_cont(i)
        }

    }else{
        for (i = 0; i < temp_arr.length; i ++) {
            if (temp_arr[i][0].toLowerCase().includes(searchtxt.toLowerCase())||temp_arr[i][1].toLowerCase().includes(searchtxt.toLowerCase())){
				set_cont(i)
            }
        }
    }
}

function drop_sel(id,loc_id){
	document.getElementById("drop_dep").classList.remove("show");
	des_stack.push([id,loc_id])
	set_dest()
}

function set_dest(){
	var tbl=''
	var line=[]
	for (i = 0; i < des_stack.length; i ++) {
		tbl+='<tr>'
		tbl+='<td>'+'<button type="button" class="btn btn-danger" onclick="delete_item('+i+',false)">&#215;</button></td>'
		tbl+='<td>'+'<button type="button" class="btn btn-primary" onclick="move_item('+i+',true)">&#8679;</button></td>'
		tbl+='<td>'+'<button type="button" class="btn btn-primary" onclick="move_item('+i+',false)">&#8681;</button></td>'
		tbl+='<td>'+locations[des_stack[i][0]].System+'</td>'
		tbl+='<td>'+locations[des_stack[i][0]].Orbit+'</td>'
		tbl+='<td>'+locations[des_stack[i][0]].Stellar_Object+'</td>'
		tbl+='<td>'+locations[des_stack[i][0]].Locations[des_stack[i][1]]+'</td>'
		tbl+='</tr>'	

		line.push([locations[des_stack[i][0]].Coordinates[1],locations[des_stack[i][0]].Coordinates[0]])
	}

	if(antPolyline!=undefined){
		mymap.removeLayer(antPolyline)
	}
	if(des_stack.length>1){
		
		antPolyline = L.polyline.antPath(line,{
			"delay": 2000,
			"dashArray": [
			10,
			20
			],
			"weight": 5,
			"color": "#0000FF",
			"pulseColor": "#FFFFFF",
			"paused": false,
			"reverse": false,
			"hardwareAccelerated": true
		});
		antPolyline.addTo(mymap)
	}
	document.getElementById('dep_tbody').innerHTML=tbl
	
}
function delete_item(pos){
	des_stack.splice(pos,1)
	set_dest()
}

function move_item(pos,dir){
	if(dir){
		if(pos>0){
			des_stack=array_move(des_stack,pos,pos-1)
		}
	}else{
		if(pos<des_stack.length-1){
			des_stack=array_move(des_stack,pos,pos+1)
		}
	}
	set_dest()
	
	function array_move(arr, old_index, new_index) {
		if (new_index >= arr.length) {
			var k = new_index - arr.length + 1;
			while (k--) {
				arr.push(undefined);
			}
		}
		arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
		return arr; // for testing
	};
}

function clearMap() {
	console.log(mymap._layers)
    for(i in mymap._layers) {
        if(mymap._layers[i]._path != undefined) {
            try {
                mymap.removeLayer(mymap._layers[i]);
            }
            catch(e) {
                console.log("problem with " + e + mymap._layers[i]);
            }
        }
    }
}


function get_locations(pms){
	
	var ret_val=""

	for (i = 0; i < temp_arr.length; i ++) {
		if(temp_arr[i][1]===pms){
        //text='<table class="table table-dark table-hover"><tbody><tr><td>'+temp_arr[i][0]+'</td><td>'+locations.data[temp_arr[i][1]][2]+'</td><td>'+locations.data[temp_arr[i][1]][1]+'</td></tr></tbody></table>'

        ret_val+='<br><a style="display:block;" href="#"  onclick="drop_sel('+temp_arr[i][2]+','+temp_arr[i][3]+')">'+temp_arr[i][0]+'</a>'
        }
    }
	
	return ret_val;
}

function init_map(json){

	var geojson = L.geoJSON(json, {
		  
		style: function (feature) {
			//console.log(feature)
			switch(feature.properties.Location_Type) {
				
				case "Star":
					return {
						color: "yellow",
						radius: 30
					};
					break;
				case "Planet":
					return {
						color: "red",
						radius: 20
					};
					break;
				case "Moon":
					return {
						color: "blue",
						radius: 10
					};
					break;
				case "Space Station":
					return {
						color: "green",
						radius: 5
					};
					break;
				case "Comm Array":
					return {
						color: "black",
						radius: 2
					};
					break;
				default:
				//return {color: feature.properties.color};
			}
		},
		
		onEachFeature: function(feature, layer) {
	
		var popupText = "<b>Orbit:</b> " + feature.properties.Orbit +
			"<br><b>Typ:</b> " + feature.properties.Location_Type+
			"<br><b>Name:</b> " + feature.properties.PMS +
			"<br><b>Stationen:</b>" + get_locations(feature.properties.PMS) ;
			
	
		layer.bindPopup(popupText, {
			closeButton: true,
			offset: L.point(0, -20)
		});
		layer.on('mouseover', function() {
			layer.openPopup();
		});
		
		},
		
		pointToLayer: function(feature, latlng) {
		return L.circleMarker(latlng, {
			 
		});
		},
	
	}).addTo(mymap); 
}