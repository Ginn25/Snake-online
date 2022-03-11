export default function(state,document){
    const score = document.getElementById('lista-players')
    let fruitsN = 0
    for(const i in state.fruits){ fruitsN ++ }

    score.innerHTML = `<article><p>${fruitsN}</p></article>`
    let players = []

    for(const id in state.players){ players.push(state.players[id]) }

    players.sort((a, b) => { if(a.energy > b.energy) return -1; else if(a.energy < b.energy) return 1; else return 0 })

    for(const id in players){
        if(id > 14) continue
        const player = players[id]
        score.innerHTML += `
        <article>
			<p>Pontos ${parseInt(player.energy/20)}  -  ${player.playerId}</p>
		</article>
        `
    }
    

    //requestAnimationFrame(Score(document))
}