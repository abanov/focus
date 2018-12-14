//Автор(с): Абанов Владислав

var CELL_NONE   = 0;
var CELL_BALL   = 1;
var CELL_POINT  = 2;
var CELL_BLOCK  = 3;
var CELL_USER   = 4;

var GAME_MENU   = 0;
var GAME_PLAY   = 1;

var CELL_SIZE   = 42;
var FIELD_COLS  = 14;
var FIELD_ROWS  = 10;
var FIELD_WIDTH = CELL_SIZE * FIELD_COLS;
var FIELD_HEIGHT= CELL_SIZE * FIELD_ROWS;

var g_iball  = new Image();
var g_iblock = new Image();
var g_ipoint = new Image();

var g_left   = (screen.width - FIELD_WIDTH)/2;
var g_top    = 22;
var g_html   = g_objAt("field");
var g_user   = new Array(g_objAt("user1"), g_objAt("user2"));
var g_field  = new Array();
var g_balls  = new Array();
var g_hlevel = g_objAt("level");
var g_hstep  = g_objAt("step");

var   g_row   = 0;
var   g_col   = 0;
var   g_frame = 0;
var   g_step  = 0;
var   g_level = 0;
var   g_timer;
var   g_state = GAME_MENU;


//скрытие или появление игры
function show_game(show){
	var mode = (show == true) ? "visible" : "hidden";
	g_objAt("gstatus").style.visibility = mode;
	g_objAt("gctrl").style.visibility   = mode;
	g_objAt("back1").style.visibility   = mode;
	g_objAt("back2").style.visibility   = mode;
	g_objAt("back3").style.visibility   = mode;
	g_objAt("back4").style.visibility   = mode;
	g_objAt("user1").style.visibility   = mode;
	g_objAt("user2").style.visibility   = mode;

	if(!show){
		g_objAt("point").innerHTML = "";
		g_html.innerHTML = "";
	}
}


//скрытие ил появление меню
function show_menu(show){
	var mode = (show) ? "visible" : "hidden";
	g_objAt("glogo").style.visibility = mode;
	g_objAt("tlogo").style.visibility = mode;
	g_objAt("blogo").style.visibility = mode;
}


//загрузка ресурсов игры
function load_images(){
	var img = new Image();
	img.src = "data/background.jpg";

	g_state = GAME_MENU;

	var w = FIELD_WIDTH  / 2;
	var h = FIELD_HEIGHT / 2;

	var back = g_objAt("back1");
	back.src = img.src;
	back.style.left = g_left + "px";
	back.style.top  = g_top  + "px";

	back = g_objAt("back2");
	back.src = img.src;
	back.style.left = (g_left + w) + "px";
	back.style.top  = g_top + "px";

	back = g_objAt("back3");
	back.src = img.src;
	back.style.left = (g_left + w) + "px";
	back.style.top  = (g_top  + h) + "px";

	back = g_objAt("back4");
	back.src = img.src;
	back.style.left = (g_left) + "px";
	back.style.top  = (g_top + h) + "px";

	delete img;
	img = null;

	var arr;
	for(var i = 0; i < FIELD_ROWS; ++i){
		arr = new Array();
		for(var j = 0; j < FIELD_COLS; ++j)
			arr.push(CELL_NONE);
		g_field.push(arr);
	}

	g_iball.src  = "data/ball.png";
	g_iblock.src = "data/block.png";
	g_ipoint.src = "data/point.png";

	var o = g_objAt("gstatus");
	o.width      = FIELD_WIDTH + "px";
	o.style.left = g_left + "px";

	g_objAt("gctrl").width = o.width;
	g_objAt("gctrl").style.left = o.style.left;
	g_objAt("gctrl").style.top  = "467px";

	show_game(false);
	show_menu(true);

	g_level = getCookieLevel();
	g_timer = setInterval("update_frame()", 190);

	var opera = false;
	if(navigator.appName.toLowerCase().indexOf("opera") != -1)
		opera = true;

	if(opera){
		window.onkeypress = function(e){

			if(g_state == GAME_MENU){
				if(e.keyCode == 13)
					on_start_game();
				return;
			}

			switch(e.keyCode){
			case 38: //вверх
			case 87:
			case 119:
			case 1094:
			case 1062:
				move_user(0, -1);
				break;
			case 37: //влево
			case 65:
			case 97:
			case 1092:
			case 1060:
				move_user(-1, 0);
				break;
			case 39: //вправо
			case 68:
			case 100:
			case 1074:
			case 1042:
				move_user(1, 0);
				break;
			case 40: //вниз
			case 83:
			case 1099:
			case 1067:
			case 115:
				move_user(0, 1);
				break;
			case 13: //enter
				on_restart();
				break;
			case 27: //esc
				on_exit_menu();
				break;
			}
		};

	} else {

		//управление игрой
		window.onkeydown = function(e){
			var key = window.event || e;

			if(g_state == GAME_MENU){
				if(e.keyCode == 13)
					on_start_game();
				return true;
			}

			switch(key.keyCode){
			case 38: //вверх
			case 87:
				move_user(0, -1);
				break;
			case 37: //влево
			case 65:
				move_user(-1, 0);
				break;
			case 39: //вправо
			case 68:
				move_user(1, 0);
				break;
			case 40: //вниз
			case 83:
				move_user(0, 1);
				break;
			case 13: //enter
				on_restart();
				break;
			case 27: //esc
				on_exit_menu();
				break;
			}
		};
	}
}


//позиция
function setUserPos(x, y){
	g_row = y;
	g_col = x;

	x = g_left + x * CELL_SIZE;
	y = g_top  + y * CELL_SIZE;
	var sx = x + "px";
	var sy = y + "px";
	for(var i = 0; i < g_user.length; ++i){
		g_user[i].style.left = sx;
		g_user[i].style.top  = sy;
	}

	g_objText(g_hstep, "ШАГИ - " + g_step);
	g_step += 1;
}


//удаление мячей
function balls_clear(){
	while(g_balls.length > 0){
		delete g_balls[g_balls.length - 1];
		g_balls.pop();
	}
}


//класс-объект мяч
function obj_ball(name, row, col){
	this.name = name;
	this.row  = row;
	this.col  = col;
}


//уровень
function field_level(){
	if(!getLevelAt(g_field, g_level, FIELD_ROWS, FIELD_COLS)){
		g_level = 0;
		putCookieLevel(g_level);
		alert("* * * ВЫ спасли все шестерки на районе * * *");
		on_exit_menu();
		balls_clear();
		return false;
	}
	putCookieLevel(g_level);

	g_step = 0;
	g_col  = g_row = 0;

	var type;
	for(var i = 0; i < g_field.length; ++i){
		for(var j = 0; j < g_field[i].length; ++j){
			type = g_field[i][j];
			if(type == CELL_USER){
				setUserPos(j, i);
				g_field[i][j] = CELL_NONE;
			} else
				g_field[i][j] = type;
		}
	}

	g_objText(g_hlevel, "УРОВЕНЬ - " + (g_level + 1));
	return true;
}


//инициализация поля
function field_init(){
	var i, j, x, y, n, key = 0, htm = "", phtm = "";

	if(!field_level())
		return;
	balls_clear();

	for(i = n = 0; i < g_field.length; ++i){
		for(j = 0; j < g_field[i].length; ++j){
			x   = g_left + j * CELL_SIZE;
			y   = g_top  + i * CELL_SIZE;
			key = i * FIELD_COLS + j;

			switch(g_field[i][j]){
			case CELL_BALL:
				htm += "<IMG ID=\"ball"  + n + "\" SRC=\"\" STYLE=\"position:absolute;left:" + x + "px;top:" + y + "px;\" />";
				++n;
				break;
			case CELL_BLOCK:
				htm += "<IMG ID=\"block" + key + "\" SRC=\"\" STYLE=\"position:absolute;left:" + x + "px;top:" + y + "px;\" />";
				break;
			case CELL_POINT:
				phtm += "<IMG ID=\"point" + key + "\" SRC=\"\" STYLE=\"position:absolute;left:" + x + "px;top:" + y + "px;\" />";
				break;
			}
		}
	}

	g_html.innerHTML = htm;
	g_objAt("point").innerHTML = phtm;

	//присвоить образы
	var str;
	for(i = n = 0; i < g_field.length; ++i){
		for(j = 0; j < g_field[i].length; ++j){
			key = i * FIELD_COLS + j; 
			switch(g_field[i][j]){
			case CELL_BALL:
				str = "ball" + n;
				g_objAt(str).src = g_iball.src;
				g_balls.push( new obj_ball(str, i, j) ); 
				++n;

				g_field[i][j] = CELL_NONE;
				break;
			case CELL_BLOCK:
				g_objAt("block" + key).src = g_iblock.src; 				
				break;
			case CELL_POINT:
				g_objAt("point" + key).src = g_ipoint.src;
				break;
			}
		}
	}
}


function on_start_game(){
	field_init();
	show_game(true);
	show_menu(false);
	g_state = GAME_PLAY;
}


//выход в меню
function on_exit_menu(){
	g_state = GAME_MENU;
	show_game(false);
	show_menu(true);
}


//уничтожение
function destroy_game(){
	clearInterval(g_timer);
	balls_clear();
}


//обновление анимации
function update_frame(){
	if(g_state != GAME_PLAY)
		return;

	if(g_frame == 1){
		g_user[0].style.visibility = "hidden";
		g_user[1].style.visibility = "visible";
	} else {
		g_user[0].style.visibility = "visible";
		g_user[1].style.visibility = "hidden";
	}
	g_frame ^= 1;
}


//проверка на движение
function is_open_place(c, r){
	if((c < 0) || (c >= FIELD_COLS) || (r < 0) || (r >= FIELD_ROWS))
		return false;
	else if(g_field[r][c] == CELL_BLOCK)
		return false;
	return true;	
}


//проверка на выигрыш
function is_victory(){
	for(var i = 0; i < g_balls.length; ++i){
		if(g_field[g_balls[i].row][g_balls[i].col] != CELL_POINT)
			return false;
	}
	return (g_balls.length > 0);
}


//движение пользователя
function move_user(dx, dy){
	var col = g_col + dx;
	var row = g_row + dy;
	if(! is_open_place(col, row))
		return;
	else {

		//проверить мяч, если находится на пути
		var iball = -1;
		for(var i = 0; i < g_balls.length; ++i){
			if(g_balls[i].row == row && g_balls[i].col == col){
				iball = i;
				break;
			}
		}

		if(iball != -1){
			var col1 = col + dx;
			var row1 = row + dy;
			if(! is_open_place(col1, row1))
				return;

			for(var i = 0; i < g_balls.length; ++i){
				if(g_balls[i].row == row1 && g_balls[i].col == col1)
					return;
			}
	
			var obj = g_objAt(g_balls[iball].name);
			if(obj == null)
				return;

			g_balls[iball].col = col1;
			g_balls[iball].row = row1;
			obj.style.left = (g_left + col1 * CELL_SIZE) + "px";
			obj.style.top  = (g_top  + row1 * CELL_SIZE) + "px";

			if(is_victory()){ //вы победили
				setUserPos(col, row);
				g_level += 1;
				field_init();
				return;
			}
		}
	}
	setUserPos(col, row);
}


//начать заново
function on_restart(){
	field_init();
}


fill_levels();
load_images();


