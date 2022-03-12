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
        newFruit({})
        setTimeout(startFruits,4000)
    }

    function startBoots(){
        moveBoots()
        setTimeout(startBoots,100)
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

        setTimeout(startPlayers,player.delay,playerId)
    }

    function updateState(newState){
        Object.assign(state,newState)
    }

    function newBoot(id = 'boot:'+newId()){
        newPlayer({playerId: id,direction: 'ArrowUp'})
    }

    function moveBoots(){

        let boots = []

        for(let id in state.players){ if(id.includes('boot:')) boots.push(state.players[id]) }

        if(boots.length < 20) newBoot()

        for(let boot of boots){
            const key = moveRandom(boot)

            movePlayer({
                playerId: boot.playerId,
                moveKey: key ? key : boot.direction 
            })
        }
    }

    function moveRandom(boot){
        const moves = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ']
        const key = random(0,1200)

        if(key <= 100) { boot.direction =  moves[3]; return }
        if(key <= 200) { boot.direction =  moves[2]; return }
        if(key <= 300) { boot.direction =  moves[1]; return }
        if(key <= 400) { boot.direction =  moves[0]; return }
        if(key <= 1000) return boot.direction
        if(key > 1190) return moves[4]
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

        if(player.move == false) return
        
        const keyPressed = params.keyPressed
        const direction = player.direction

        const testDirection = {
            ArrowUp(){
                if(direction == 'ArrowDown' || direction == 'ArrowUp') return false
                return 'ArrowUp'
            },
            ArrowRight(){
                if(direction == 'ArrowLeft' || direction == 'ArrowRight') return false
                return 'ArrowRight'
            },
            ArrowLeft(){
                if(direction == 'ArrowRight' || direction == 'ArrowLeft') return false
                return 'ArrowLeft'
            },
            ArrowDown(){
                if(direction == 'ArrowUp' || direction == 'ArrowDown') return false
                return 'ArrowDown'
            },
            [' '](){
                player.run = !player.run
                return false
            }
        }

        const testFunc = testDirection[keyPressed]
        
        if(testFunc && testFunc()) player.direction = testFunc()
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
            if(player.run && player.energy > 60){
                player.delay = 45
                player.energy--
            }else{
                player.run = false
                player.delay = 100
            }
        }

        const player = state.players[params.playerId]
        const moveKey = params.moveKey
        const moveFunc = acceptedMoves[moveKey]

        if(player && moveFunc){
            run()
            moveFunc(player)
            updateCalda(player)
            fruitCollision(player)
            playerCollison(player)
        }
    }

    function updateCalda(player){
        const pontos = player.energy/state.baseEnergy

        player.calda.unshift({x: player.x ,y: player.y})
        player.calda.splice(pontos,player.calda.length-pontos)
    }

    return {
        state,
        startPlayers,
        startFruits,
        startBoots,
        newObserver,
        observersExe,
        newBoot,
        moveBoots,
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
