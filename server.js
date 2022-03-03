import createGame from "./public/game.js"

export default function server(){
    
    const game = createGame({width:80,height:47})
    const id = game.newId()

    function connect(clientGame){

        console.log('- Player '+ id +' online -')

        game.newPlayer({playerId:id})

        clientGame.updateState(game.state)
        clientGame.startPlayers(id)
        clientGame.startFruits()
        //let otherPlayerId = game.newId
        //clientGame.newPlayer({playerId:otherPlayerId,direction:'ArrowDown'})
        //setInterval(() => {
        //    clientGame.movePlayer({playerId:otherPlayerId,moveKey:'ArrowDown'})
        //}, 100); 
    }

    return {
        connect,
        id
    }
}