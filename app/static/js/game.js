// Dragable Vars
let dragItem = null;
let container = null;
let mapDiv = null;

let active = false;
let preDragX;
let preDragY;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;


let start, previousTimeStamp;


let GameParams = {
    StartingCoordinates: null,
    tile_types: null
}

let GameState = {
    tiles: null,
    entities: null,
    cursorX: null,
    cursorY: null,
    grid: null
}

let ClientParams = {
    grid_height: 11,
    grid_width: 11,
    cell_size: 50,
    pixel_offset_X: 0,
    pixel_offset_Y: 0
}


let state_index = -1;
let init_states = [
    init_request_params,
    init_request_params_waiting,
    init_request_initial_gamestate,
    init_request_initial_gamestate_waiting,
    create_game_ui,
    main_game_loop
]

// INIT
function init_request_params() {
    setupDragging()

    let paramStr = ""
    for (const property in GameParams) {
        paramStr += property + "&"
    }
    $.ajax({
        url: "/getparam?" + paramStr,
        context: this,
        success: init_request_params_success
    })
    state_index++;
}
function init_request_params_waiting() {
    let nullCount = 0;
    for (const property in GameParams) {
        if (GameParams[property] == null) nullCount++;
    }
    if (nullCount == 0) {
        state_index++;
        console.log("received all parameters, going to main_game_loop")
    }
}
function init_request_params_success(data, textStatus, jqXHR) {
    console.log(data)
    if (data.params) {
        console.log(data.params)
        for (const property in data.params) {
            console.log(property + ": " + data.params[property])
            if (property=="tile_types") {
                GameParams[property] = {}
                let tile_types = data.params[property]
                for (var x=0;x<tile_types.length;x++) {
                    let key = tile_types[x][0]
                    GameParams[property][key] = {}
                    GameParams[property][key].name = tile_types[x][1]
                    GameParams[property][key].css = tile_types[x][2]
                }
                console.log(GameParams[property])
            } else {
                GameParams[property] = data.params[property]
            }
        }
    }
}

// request_initial_gamestate
function init_request_initial_gamestate() {
    GameState.cursorX = GameParams.StartingCoordinates.split(',')[0]
    GameState.cursorY = GameParams.StartingCoordinates.split(',')[1]
    $.ajax({
        url: "/getstate?x=" + GameState.cursorX + '&y=' + GameState.cursorY,
        context: this,
        success: init_request_initial_gamestate_success
    })
    state_index++;
}
function init_request_initial_gamestate_waiting() {

}
function init_request_initial_gamestate_success(data, textStatus, jqXHR) {
    //console.log(data.chunk)
    GameState.tiles = {}
    for (let i = 0; i < data.chunk.tiles.length; i++) { 
        let key = data.chunk.tiles[i][0] + ',' + data.chunk.tiles[i][1]
        GameState.tiles[key] = data.chunk.tiles[i][2]
    }
    console.log(GameState.tiles)
    state_index++;
}
function getTile(x,y) {
    let key = x + ',' + y
    if (key in GameState.tiles) {
        return GameState.tiles[key]
    }
    return null
}


function create_game_ui() {
    let styleHtml = "";
    for (key in GameParams.tile_types) {
        let type = GameParams.tile_types[key]
        styleHtml += ".tile_type_" + type.name + " " + type.css.replace(/\"/g,"") + " "
    }
    $("<style>").prop("type","text/css").html(styleHtml).appendTo("head")

    const cell_height = ClientParams.cell_size, cell_width = ClientParams.cell_size;
    const grid_height = ClientParams.grid_height, grid_width = ClientParams.grid_width;
    let gtc = '1fr', gtr = '1fr'
    for (let i=1;i<grid_width;i++) gtc += ' 1fr'
    for (let i=1;i<grid_height;i++) gtr += ' 1fr'

    if (0) {
        $("#main").css('display','grid')
        $("#main").css('grid-template-columns', gtc)
        $("#main").css('grid-template-rows', gtr)
        $("#main").css('grid-gap','0px')
    }
    GameState.grid = [] 
    let i = 0

    // it's necessary to build this one column at a time such that
    // you can index GameState.grid using [x][y]
    for (var x = 0; x < grid_width; x++) {
        let column = []
        for (var y = 0; y < grid_height; y++) {    
            let cell = $("<div></div>")
            i++
            let diagonal_offset = y % 2 * ClientParams.cell_size / 2
            cell.html(i + '<br>' + x + "," + y)
            cell.addClass('cell')
            cell.css('width',cell_width)
            cell.css('height',cell_height)
            cell.css('left', x * ClientParams.cell_size + diagonal_offset)
            cell.css('top', y * ClientParams.cell_size)

            $("#main").append(cell)
            column.push(cell)
        }
        GameState.grid.push(column)
    }
    state_index++;
}

function getWorldCoordinates(gridX, gridY) {
    return [
        GameState.cursorX - Math.floor(gridX/2),
        GameState.cursorY - Math.floor(gridY/2)
    ]
}
function getWorldTile(gridX, gridY) {
    const grid_height = ClientParams.grid_height, grid_width = ClientParams.grid_width;
    let key = (GameState.cursorX - Math.floor(grid_width/2) + gridX) + ',' + (GameState.cursorY - Math.floor(grid_height/2) + gridY);
    if (key in GameState.tiles) return [GameState.tiles[key], key]
    else return [null, null]
}
function clearTileClasses() {
    for (key in GameParams.tile_types) {
        let type = GameParams.tile_types[key]
        $(".tile_type_" + type.name).removeClass("tile_type_" + type.name)
    }
}
function render() {
    const grid_height = ClientParams.grid_height, grid_width = ClientParams.grid_width;
    clearTileClasses()
    let i = 0
    for (var y = 0; y < grid_height; y++) {
        for (var x = 0; x < grid_width; x++) {
            i++
            let tile = getWorldTile(x, y);
            let key = tile[1]
            tile_type_id = tile[0]
            if (tile !== null) {
                GameState.grid[x][y].html(i + '<br>x: ' + x + ", " + y + "<br>" + key + "<br>" + tile_type_id)
                try {
                    GameState.grid[x][y].addClass("tile_type_" + GameParams.tile_types[tile_type_id].name)
                } catch {
                    //console.log(`GameState.grid[${x}][${y}] tile_type_id=${tile_type_id}`)
                }
                
            }
        }
    }
    $('#cursorpos').html(`cursorX=${GameState.cursorX},${GameState.cursorY}`)
    $('#pixel_offset').html(`ClientParams.pixel_offset=${ClientParams.pixel_offset_X},${ClientParams.pixel_offset_Y}`)
    $('#initial').html(`initial=${initialX},${initialY}`)
    $('#current').html(`current=${currentX},${currentY}`)
    $('#preDrag').html(`preDrag=${preDragX},${preDragY}`)
    let l=-777, t=-777;
    l = $('#draggy').position().left
    t = $('#draggy').position().top
    $('#draggyinfo').html(`draggy=${l},${t}`)
   // console.log("cursor: " + GameState.cursorX + "," + GameState.cursorY)
}

// MAIN
function main_game_loop() {
    render()
}
function main_game_loop_params_success(data, textStatus, jqXHR) {

}


// TIC
function tic(timestamp) {
    if (start === undefined) start = timestamp;
    const elapsed = timestamp - start;

    if (previousTimeStamp !== timestamp) {
        if (state_index >= 0 && state_index < init_states.length) {
            init_states[state_index]()
        } else {
            state_index = 0
        }
    }

    if (1) { 
        previousTimeStamp = timestamp
        window.requestAnimationFrame(tic);
    } else {
        console.log("timed out. No longer ticking.")
    }
}



$( document ).ready(function() {
    console.log( "init" )
    window.requestAnimationFrame(tic)
});