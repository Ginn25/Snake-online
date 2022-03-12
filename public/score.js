export default function(document,players){
    let displayScore = document.getElementById('lista-players')
    
    const list = ['']

    for(let id in players){ list.push(players[id]) }

    list.sort((a,b) => b.energy - a.energy)
    
    displayScore.innerHTML = ``

    for(const id in list){
        const player = list[id]
        if(id == 0) continue

        displayScore.innerHTML += `
        <article id='ranking'>
			<p> ${id}º Lugar </p>
            <p> ${parseInt(player.energy/20)} </p>
            <p> ${player.playerId} </p>
		</article> `

        if(id > 15) break;
    }
}