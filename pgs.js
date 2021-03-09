console.log('pgs.js loaded')

pgs = {date:Date()}

pgs.loadScript=async(url)=>{
    let s = document.createElement('script')
    s.src=url
    return document.head.appendChild(s)
}

pgs.loadScore=async(entry='PGS000004')=>{
    const url = `https://ftp.ebi.ac.uk/pub/databases/spot/pgs/scores/${entry}/ScoringFiles/${entry}.txt.gz`
    //return await (await fetch(url)).arrayBuffer()
    return pgs.pako.inflate(await (await fetch(url)).arrayBuffer(),{to:'string'})
}


pgs.loadPako=function(){
    pgs.loadScript("https://cdnjs.cloudflare.com/ajax/libs/pako/2.0.3/pako.min.js").then(s=>{
        s.onload=function(){
            pgs.pako=pako
        }
    })      
}

if(typeof(define)!="undefined"){
    //define(pgs)
    define(['https://cdnjs.cloudflare.com/ajax/libs/pako/2.0.3/pako.min.js'],function(pako){
        pgs.pako = pako
        return pgs
    })
}else{
    pgs.loadPako()
}

