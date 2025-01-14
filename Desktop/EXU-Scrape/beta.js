let betaDatabase = baseURL + "beta.json";

loadDatabase = async function () {
    // await CardViewer.Database.initialReadAll(betaDatabase);
    let approved = await fetch(exuDatabase)
        .then(response => response.json());
        
    let beta = await fetch(betaDatabase)
        .then(response => response.json());
    
    for(let id of Object.keys(beta)) {
        if(approved[id]) {
            delete beta[id];
        }
    }
    
    CardViewer.Database.setInitial(beta);
    
    CardViewer.excludeTcg = false;
    CardViewer.showImported = true;
    CardViewer.firstTime = false;
};
