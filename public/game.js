export default function createGame(canvas){

    const state = {
        players:[],
        fruits:[],
    }
    
    const observers = []

    function startFruits(){
        newFruit({fruitId:newId()})
        setTimeout(startFruits,4000)
    }

    function startPlayers(playerId){
        const player = state.players[playerId]
        if(!player) { newPlayer({playerId}); startPlayers(playerId) ;return }
        
        if(player.ativo){
            movePlayer({
                playerId:playerId,
                moveKey:player.direction,
                pressed: false
            })
        }
        
        setTimeout(startPlayers,player.velocity,playerId)
    }

    function updateState(newState){
        Object.assign(state,newState)
    }

    function newObserver(observerFunc){
        observers.push(observerFunc)
    }

    function observerExe(params){
        for(const observerFunc of observers){
            observerFunc(params)
        }
    }

    function newPlayer(params){
        const x = 'x' in params ? params.x : random(0,canvas.width-1)
        const y = 'y' in params ? params.y : random(0,canvas.height-1)

        const player = {
            playerId: params.playerId,
            x: x,
            y: y,
            pontos: 0,
            calda: [{x,y}],
            velocity: 100,
            direction: 'direction' in params ? params.direction : null,
            ativo: true,
            energy: 0,
            run: false
        }
        
        state.players[`${params.playerId}`] = player
        
        observerExe({
            commandType: 'newPlayer',
            playerId: player.playerId,
            playerX: player.x,
            playerY: player.y
        })
    }

    function removePlayer(params){
        delete state.players[`${params.playerId}`]

        observerExe({
            commandType: 'removePlayer',
            playerId: params.playerId,
        })
    }

    function newFruit(params){
        const fruit = {
            fruitId: params.fruitId,
            x: random(0,canvas.width-1),
            y: random(0,canvas.height-1),
        }

        state.fruits[`${params.fruitId}`] = fruit

        observerExe({
            commandType: 'newFruit',
            fruitId: fruit.fruitId,
            fruitX: fruit.x,
            fruitY: fruit.y
        })
    }

    function removeFruit(params){
        delete state.fruits[`${params.fruitId}`]

        observerExe({
            commandType: 'removeFruit',
            fruitId: params.fruitId,
        })
    }

    function checkMove(player){

        const check = checkPosition(player)

        if(check.fruit){
            const fruit = check.fruit
            const params = {
                fruit: fruit,
                player: state.players[player.playerId]
            }
            fruitCollision(params)
        }
        if(check.player){
            const otherPlayer = check.player
            removePlayer({playerId:otherPlayer.playerId})
            return false
        }
        return true
    }

    function checkPosition(params){
    
        const result = {
            fruit: false,
            player: false
        }

        for(let id in state.players){
            const playerCalda = state.players[id].calda
            
            result.player = playerCalda.find( calda => calda.x == params.x && calda.y == params.y && params.playerId != id)
            if(result.player) result.player.playerId = id
        }

        for(let id in state.fruits){
            const fruit = state.fruits[id]

            if(fruit.x == params.x && fruit.y == params.y) result.fruit = fruit
        }

        return result
    }

    function directionPlayer(params){
        const player = state.players[params.playerId]
        const keyPressed = params.keyPressed
        const direction = player.direction

        const testDirection = {
            ArrowUp(){
                if(direction == 'ArrowDown') return player.direction 
                return 'ArrowUp'
            },
            ArrowRight(){
                if(direction == 'ArrowLeft') return player.direction 
                return 'ArrowRight'
            },
            ArrowLeft(){
                if(direction == 'ArrowRight') return player.direction 
                return 'ArrowLeft'
            },
            ArrowDown(){
                if(direction == 'ArrowUp') return player.direction 
                return 'ArrowDown'
            },
            [' '](){
                player.run = !player.run
                return player.direction
            }
        }

        const testFunc = testDirection[keyPressed]
        
        if(testFunc){
            player.direction = testFunc()
        }
    }

    function movePlayer(params){
    
        const acceptedMoves = {
            ArrowUp(player){
                if(player.y - 1 >= 0){ player.y -- }else{ player.y = canvas.height - 1 }
            },
            ArrowDown(player){
                if(player.y + 1 < canvas.height){ player.y ++ }else{ player.y = 0 }
            },
            ArrowLeft(player){
                if(player.x - 1 >= 0){ player.x -- }else{ player.x = canvas.width - 1 }
            },
            ArrowRight(player){
                if(player.x + 1 < canvas.width){ player.x ++ }else{ player.x = 0 }
            }
        }

        function run(){
            if(player.run && player.energy > 0){
                player.velocity = 45
                player.energy--
            }else{
                player.run = false
                player.velocity = 100
            }
        }

        const player = state.players[params.playerId]
        const moveKey = params.moveKey
        const moveFunc = acceptedMoves[moveKey]

        
        
        if(player && moveFunc){
            player.ativo = false

            run()
            moveFunc(player)
            updateCalda(player)
            checkMove(player)

            player.ativo = true 
        }
        // notifyAll
    }

    function updateCalda(player){

        player.calda.unshift({x: player.x ,y: player.y})

        if(player.calda.length-1 > player.pontos) player.calda.pop()
    }

    function fruitCollision(params){
        const fruit = params.fruit 
        const player = params.player

        player.pontos++
        if(player.energy < 100) player.energy += 10

        removeFruit({fruitId: fruit.fruitId})
    }

    return {
        state,
        startPlayers,
        startFruits,
        checkPosition,
        newObserver,
        observerExe,
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
