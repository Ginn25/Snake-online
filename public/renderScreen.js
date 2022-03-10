export default function renderScreen(canvas,state,requestAnimationFrame,playerId){
    const ctx = canvas.getContext('2d')

    ctx.clearRect(0,0,canvas.width,canvas.height)
    
    for(let id in state.players){
        const player = state.players[id]

        player.move = false

        let cor = player.ativo ? 'green': 'rgba(0,255,0,100)'
        
        if(playerId == id) { cor = player.ativo ? 'rgb(70,0,180)': 'rgba(120,0,180,1)' }
        if(!player) return

        for(let calda of player.calda){
            ctx.fillStyle = cor
            ctx.fillRect(calda.x,calda.y,1,1) 
        }
        player.move = true
    }

    for(let id in state.fruits){
        const fruit = state.fruits[id]
        if(fruit){
            ctx.fillStyle = 'rgb(180,20,20)'
            ctx.fillRect(fruit.x,fruit.y,1,1)
        }
    }

    requestAnimationFrame(()=>{
        renderScreen(canvas,state,requestAnimationFrame,playerId)
    })
}