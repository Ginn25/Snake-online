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
        
        movePlayer({
            playerId:playerId,
            moveKey:player.direction
        })
        
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
        const player = {
            playerId: params.playerId,
            x: 'x' in params ? params.x : random(0,canvas.width-1),
            y: 'y' in params ? params.y : random(0,canvas.height-1),
            pontos: 0,
            calda: [],
            velocity: 100,
            direction: 'direction' in params ? params.direction : null,
            ativo: false,
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
            const player = state.players[id]
            if(player.x == params.x && player.y == params.y && id != params.playerId) result.player = player
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
                if(direction == 'ArrowDown') return 
                return true
            },
            ArrowRight(){
                if(direction == 'ArrowLeft') return 
                return true
            },
            ArrowLeft(){
                if(direction == 'ArrowRight') return 
                return true
            },
            ArrowDown(){
                if(direction == 'ArrowUp') return 
                return true
            }
        }

        const testFunc = testDirection[keyPressed]
        
        if(testFunc){
            if(testFunc()) player.direction = keyPressed 
        }else{
            movePlayer({
                playerId: params.playerId,
                moveKey: params.keyPressed,
                pressed:params.pressed
            })
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
            },
            [' '](player){
                player.run = !player.run
                player.velocity = 100
            }
        }

        function run(){
            if(player.energy > 0){
                player.velocity = 35
                player.energy--
            }else{
                player.velocity = 100
                player.run = false
            }
        }

        const player = state.players[params.playerId]
        const moveKey = params.moveKey
        const moveFunc = acceptedMoves[moveKey]

        if(player && moveFunc){
            player.ativo = true
            player.pastPosition = { x: player.x, y: player.y }
            
            if(player.run) run()
            moveFunc(player)
            checkMove(player)
            //updateCalda(player)
            if(player.calda.length > 0) moveCalda(player,acceptedMoves)
        }
        // notifyAll
    }

    function newCalda(player){
        console.log(player)
        const x = player.pastPosition.x
        const y = player.pastPosition.y

        player.calda.push({
            x: x,
            y: y,
            direction: player.direction
        })
    }

    function updateCalda(player){
        for(let id = player.calda.length-1; id >= 0 ; id--){
            const calda = player.calda[id]
            if(id == 0) {
                calda.direction = player.direction
            }else{
                calda.direction = player.calda[id-1].direction
            } 
        }
    }

    function moveCalda(player,moves){
        for(let calda of player.calda){
            const func = moves[calda.direction]
            func(calda)
        }
    }

    function fruitCollision(params){
        const fruit = params.fruit 
        const player = params.player

        newCalda(player)
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
        directionPlayer,
        movePlayer,
        newFruit,
        removeFruit,
        random,
        updateState,

        newId
    }
}

function random(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function newId(){
    let abc = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']

    return ''+abc[random(0,25)]+random(0,9)+abc[random(0,25)]+random(0,9)+abc[random(0,25)]+random(0,9)+abc[random(0,25)]+random(0,9)+abc[random(0,25)]+''
}
