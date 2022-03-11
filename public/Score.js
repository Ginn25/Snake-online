export default function(state,document){
    const score = document.getElementById('lista-players')

    score.innerHTML = ``
    let players = []

    for(const id in state.players){ players.push(state.players[id]) }

    players.sort((a, b) => { if(a.energy > b.energy) return -1; else if(a.energy < b.energy) return 1; else return 0 })

    for(const id in players){
        if(id > 15) continue
        const player = players[id]
        score.innerHTML += `
        <article id='ranking'>
			<p> ${eval(id)}º Lugar </p>
            <p> ${parseInt(player.energy/20)} </p>
            <p> ${player.playerId} </p>
		</article>
        `
    }
    

    //requestAnimationFrame(Score(document))
}