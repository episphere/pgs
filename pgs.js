console.log('pgs.js loaded')

pgs = {date:Date()}

pgs.loadScript=async(url)=>{
    let s = document.createElement('script')
    s.src=url
    return document.head.appendChild(s)
}

pgs.loadScore=async(entry='PGS000004')=>{
    const url = `https://ftp.ebi.ac.uk/pub/databases/spot/pgs/scores/${entry}/ScoringFiles/${entry}.txt.gz`
    /*
    let y
    if(pgs.localforage){
        y = pgs.localforage.getItem(url)
    }
    if(!y){
        let ab = await (await fetch(url)).arrayBuffer()
        y = pgs.pako.inflate(ab,{to:'string'})
        pgs.localforage.setItem(url,y)
    }
    return y
    */
    return pgs.pako.inflate(await (await fetch(url)).arrayBuffer(),{to:'string'})
}

pgs.textArea = async (entry='PGS000004')=>{
    let txt = await pgs.loadScore(entry);
    let ta = document.createElement('textarea'); //DOM.element('textarea');
    ta.value = txt;
    ta.style.width = '100%';
    ta.style.height = '20em';
    ta.style.color = 'lime';
    ta.style.backgroundColor = 'black';
    return ta;
}

//pgs.url='https://www.pgscatalog.org/rest/'
pgs.url='https://script.google.com/macros/s/AKfycbw1lC7UPcj34J06v_HWACyFJAPSoDB7VMI-KWbpb0mfuh9wccHPPFdbMdxGlUeyqDFM/exec?'

pgs.get=async(q='score/PGS000004?format=json')=>{ // PGS API call
    const url = pgs.url+encodeURIComponent(q)
    //return (await fetch(url)).json()
    let y
    if(pgs.localforage){
        y = await pgs.localforage.getItem(url)
    }
    if(!y){
        y = await (await fetch(url)).json()
        pgs.localforage.setItem(url,y)
    }
    return y
}

pgs.getAttr=async(id='PGS000004')=>{ // getting attributes of a PSG entry
    return await pgs.get(`score/${id}?format=json`)
}

pgs.getValues=async(id='PGS000004')=>{ // getting values of a PSG entry by parsing the PSG file
    return await pgs.parse(id)
}

pgs.score={}
//pgs.score.all=async fetch(url='https://www.pgscatalog.org/rest/score/all')


pgs.loadPako=function(){
    pgs.loadScript("https://cdnjs.cloudflare.com/ajax/libs/pako/2.0.3/pako.min.js").then(s=>{
        s.onload=function(){
            pgs.pako=pako
        }
    })
    pgs.loadScript("https://cdnjs.cloudflare.com/ajax/libs/localforage/1.9.0/localforage.min.js").then(s=>{
        s.onload=function(){
            pgs.localforage=localforage
        }
    })
    // https://cdnjs.cloudflare.com/ajax/libs/localforage/1.9.0/localforage.min.js  
}

pgs.deblank=(txt)=>{
    return txt.replace(/^[#\s]+/,'').replace(/\s+?/,'')
}

pgs.parse=async(txt)=>{
    if(!txt){ // sample score file
        txt=await pgs.loadScore('PGS000004')
    }
    if(txt.length<100){
        txt=await pgs.loadScore(txt)
    }
    let arr = txt.split(/\n/).filter(x=>x.length>0) // remove empty rows
    let y={info:pgs.deblank(arr[0])}
    let parm=''
    for(var i = 1;i<arr.length;i++){
        if(arr[i][0]=='#'){
            if(arr[i][1]=='#'){
                parm=pgs.deblank(arr[i])
                y[parm]={}
            }else{
                let av = pgs.deblank(arr[i]).split('=').map(pgs.deblank)
                y[parm][av[0]]=av[1]
            }

            //console.log(i,arr[i])
        }
        else{
            //console.log(i)
            break
        }
    }
    console.log(i,arr[i])
    y.fields = arr[i].split(/\t/g) // list
    y.values = arr.slice(i+1).map(x=>x.split(/\t/g).map(xi=>parseFloat(xi)?parseFloat(xi):xi))
    return y
}

pgs.info = async(id='PGS000004')=>{
    return await pgs.get(`score/${id}?format=json`)
}
pgs.getRsid = async(x = 'chr1:g.100880328A>T?fields=dbsnp.rsid')=>{
    let url = 'https://myvariant.info/v1/variant/'
    if(typeof(x)=='string'){
        url+=decodeURIComponent(x)
    }else{ // something like [1,100880328,"T","A"]
        url+=`chr${x[0]}:g.${x[1]}${x[3]}>${x[2]}?fields=dbsnp.rsid`
    }
    //return (await fetch(url)).json()
    let y = await (await fetch(url)).json()
    return y.dbsnp.rsid
    // chr1:g.100880328A>T?fields=dbsnp.rsid
    //https://myvariant.info/v1/variant/
}

pgs.dtFrame2Array=(fields,values)=>{
    // under development
}

if(typeof(define)!="undefined"){
    //define(pgs)
    define(['https://cdnjs.cloudflare.com/ajax/libs/pako/2.0.3/pako.min.js','https://cdnjs.cloudflare.com/ajax/libs/localforage/1.9.0/localforage.min.js'],function(pako,localforage){
        pgs.pako = pako
        pgs.localforage=localforage
        return pgs
    })
}else{
    pgs.loadPako()
}

