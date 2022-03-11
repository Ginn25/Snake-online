import createGame from "./public/game.js"

export default function server(){
    
    const game = createGame({width:100,height:57})
    const id = game.newId()

    function connect(clientGame){

        console.log('- Player '+ id +' online -')

        game.newPlayer({playerId:id})

        clientGame.updateState(game.state)
        clientGame.startPlayers(id)
        clientGame.startFruits()
        clientGame.startBoots()

        for(let i = 0; i < 15; i++) {
            clientGame.newBoot()
        }
    }

    return {
        connect,
        id
    }
}