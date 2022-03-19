export default function createGame(canvas){

    const state = {
        players:[],
        fruits:[],
        baseEnergy: 20
    }
    
    const observers = []

    function newObserver(observerFunc){ observers.push(observerFunc) }

    function observersExe(params){ for(const observerFunc of observers){ observerFunc(params) } }

    function startFruits(){
        if(state.fruits.length < 1000) newFruit({})
        setTimeout(startFruits,4000)
    }

    function startBots(){
        moveBots()
        setTimeout(startBots,100)
    }

    function startPlayers(playerId){
        const player = state.players[playerId]
        
        if(!player) { newPlayer({playerId}); startPlayers(playerId) ;return }
        
        if(player.ativo){
            movePlayer({
                playerId:playerId,
                moveKey:player.direction
            })
        }

        setTimeout(startPlayers,player.delay,playerId)
    }

    function updateState(newState){
        Object.assign(state,newState)
    }

    function newBot(id = 'bot:'+newId()){
        newPlayer({playerId: id,direction: 'ArrowUp'})
    }

    function moveBots(){

        let bots = []

        for(let id in state.players){ if(id.includes('bot:')) bots.push(state.players[id]) }

        if(bots.length < 15) newBot()

        for(let bot of bots){
            directionPlayer({playerId:bot.playerId,keyPressed:moveRandom(bot)})
            movePlayer({
                playerId: bot.playerId,
                moveKey: bot.direction 
            })
        }
    }

    function moveRandom(bot){
        const moves = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight']
        const key = random(0,1200)

        if(key <= 100) return moves[3]
        if(key <= 200) return moves[2]
        if(key <= 300) return moves[1]
        if(key <= 400) return moves[0]
        if(key <= 1000) return bot.direction
    }

    function newPlayer(params){
        const x = 'x' in params ? params.x : random(0,canvas.width-1)
        const y = 'y' in params ? params.y : random(0,canvas.height-1)

        const player = {
            playerId: params.playerId,
            x: x,
            y: y,
            calda: [{x,y}],
            delay: 100,
            direction: 'direction' in params ? params.direction : null,
            ativo: true,
            energy: 60,
            run: false
        }
        
        if(playerCollison(player)){
            newPlayer(params)
        }else{
            state.players[`${params.playerId}`] = player
        } 
    }

    function removePlayer(params){
        delete state.players[`${params.playerId}`]
    }

    function newFruit(params){
        
        const fruit = {
            fruitId: 'fruitId' in params ? params.fruitId : newId(),
            x: 'x' in params ? params.x : random(0,canvas.width-1),
            y: 'y' in params ? params.y : random(0,canvas.height-1),
        }
        state.fruits[`${fruit.fruitId}`] = fruit
    }

    function removeFruit(params){
        delete state.fruits[`${params.fruitId}`]
    }

    function playerCollison(player){

        for(const id in state.players){
            if(player.playerId == id) continue
            
            const otherPlayer = state.players[id]

            for(const calda of otherPlayer.calda){
                if(calda.x == player.x && calda.y == player.y){

                    for(let fruit of player.calda){ if(random(0,3) > 0) newFruit({x: fruit.x, y: fruit.y}) }

                    removePlayer({playerId:player.playerId})

                    otherPlayer.energy += state.baseEnergy

                    return true
                }
            }
        }
    }

    function fruitCollision(player){
        
        for(let id in state.fruits){
            const fruit = state.fruits[id]
            
            if(fruit.x == player.x && fruit.y == player.y){
                player.energy += state.baseEnergy

                removeFruit({fruitId: fruit.fruitId})
            }
        }
    }

    function directionPlayer(params){
        const player = state.players[params.playerId]
        const keyPressed = params.keyPressed
        const direction = player.direction

        if(player.pausa) return

        switch (keyPressed) {
            case direction: break
            case ' ': player.correndo = !player.correndo ; break
            case 'ArrowUp':
                if(direction != 'ArrowDown') player.direction = 'ArrowUp'
                break
            case 'ArrowDown':
                if(direction != 'ArrowUp') player.direction = 'ArrowDown'
                break
            case 'ArrowLeft':
                if(direction != 'ArrowRight') player.direction = 'ArrowLeft'
                break
            case 'ArrowRight':
                if(direction != 'ArrowLeft') player.direction = 'ArrowRight'
                break
        }
        player.pausa = true
    }

    function movePlayer(params){
        
        const acceptedMoves = {
            ArrowUp(player){
                player.y = (player.y - 1 + canvas.height) % canvas.height
            },
            ArrowDown(player){
                player.y = (player.y + 1 + canvas.height) % canvas.height
            },
            ArrowLeft(player){
                player.x = (player.x - 1 + canvas.width) % canvas.width
            },
            ArrowRight(player){
                player.x = (player.x + 1 + canvas.width) % canvas.width
            }
        }

        function correr(){
            if(player.correndo && player.energy > 60){
                player.delay = 45
                player.energy--
            }else{
                player.correndo = false
                player.delay = 100
            }
        }

        const player = state.players[params.playerId]
        const moveFunc = acceptedMoves[params.moveKey]

        if(player && moveFunc){
            correr()
            moveFunc(player)
            updateCalda(player)
            fruitCollision(player)
            playerCollison(player)
            player.pausa = false
        }
    }

    function updateCalda(player){
        const pontos = player.energy/state.baseEnergy

        player.calda.unshift({x: player.x ,y: player.y})

        player.calda.splice(pontos,player.calda.length)
    }

    return {
        state,
        startPlayers,
        startFruits,
        startBots,
        newObserver,
        observersExe,
        newBot,
        moveBots,
        newPlayer,
        removePlayer,
        movePlayer,
        directionPlayer,
        newFruit,
        removeFruit,
        updateState,

        random,
        newId
    }
}

function random(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Para fim de testes

function newId(){
    let abc = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']

    return ''+abc[random(0,25)]+random(0,9)+abc[random(0,25)]+random(0,9)+abc[random(0,25)]+random(0,9)+abc[random(0,25)]+random(0,9)+abc[random(0,25)]+''
}
