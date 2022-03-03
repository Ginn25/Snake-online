export default function onKeyboard(document,game){

    document.addEventListener('keydown',keyboarPressed)

    const state = {
        playerId: null
    }

    function registerPlayer(playerId){
        state.playerId = playerId
    }

    function keyboarPressed(event){
        const params = {
            playerId: state.playerId,
            keyPressed: event.key,
            pressed: event.repeat
        }
        game.directionPlayer(params)
    }

    return {
        registerPlayer,
    }

}