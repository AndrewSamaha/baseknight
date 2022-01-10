const ClientState = () => ({
    state_index: -1,
    init_states: [
        init_request_params,
        init_request_params_waiting,
        init_request_initial_gamestate,
        init_request_initial_gamestate_waiting,
        create_game_ui,
        main_game_loop
    ],
    
    init_request_params: () => {
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
    },

    init_request_params_waiting: () => {
        let nullCount = 0;
        for (const property in GameParams) {
            if (GameParams[property] == null) nullCount++;
        }
        if (nullCount == 0) {
            state_index++;
            console.log("received all parameters, going to main_game_loop")
        }
    },

    init_request_params_success: (data, textStatus, jqXHR) => {
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
});

export default ClientState;
