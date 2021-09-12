#!/usr/bin/env node

import * as fetch from 'node-fetch';

const USERNAME = 'smirnovanv';
const PROJECT = 'AppCenterTest-Android';
const TOKEN = 'eabf22e7562cc972f803d85756e0dc5d20d7e765';

async function getBranches () {
    const response = await fetch(`https://api.appcenter.ms/v0.1/apps/${USERNAME}/${PROJECT}/branches`, {
        headers: {
            'X-API-Token': TOKEN
        },
    });
    if (response.ok) {
        const branches = await response.json();
        return branches;
    } else {
        throw new Error('Could not get branches');
    }
};

async function buildBranches () {
    const branches = await getBranches();

    for (let i = 0; i < branches.length; i++) {
        const name = branches[i].branch.name;
        const version = branches[i].lastBuild.sourceVersion;
        fetch(`https://api.appcenter.ms/v0.1/apps/${USERNAME}/${PROJECT}/branches/${name}/builds`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Token': TOKEN,
            },
            body: JSON.stringify({ sourceVersion: version, debug: false })
        })
    }
}

async function checkBuilds () {
    const branches = await getBranches();
    const branchStatus = branches.every((branch) => branch.lastBuild.status !== 'notStarted' && branch.lastBuild.status !== 'inProgress');

    if (branchStatus) {
        for (let i = 0; i < branches.length; i++) {
             const name = branches[i].branch.name;
             const status = branches[i].lastBuild.status;
             const id = branches[i].lastBuild.id;
             const startDate: Date = new Date(branches[i].lastBuild.startTime);
             const finishDate: Date = new Date(branches[i].lastBuild.finishTime);
             const buildTime = Math.round((Number(finishDate) - Number(startDate)) / 1000);

             fetch(`https://api.appcenter.ms/v0.1/apps/${USERNAME}/${PROJECT}/builds/${id}/downloads/logs`, {
              headers: {
                'X-API-Token': TOKEN
              },
             })
             .then((response) => response.json())
             .then((data) => {
                const url = data.uri;
                console.log(`${name} build ${status} in ${buildTime} seconds. Link to build logs: ${url}`);
             }).catch((err) => console.log(err));     
         }
         return;
    }

    console.log('Building branches...');
    setTimeout(checkBuilds, 100000);
}

async function buildAndCheck() {
    try {
        buildBranches();
        setTimeout(checkBuilds, 100000);
    } catch {
        console.log('error')
    }
}

buildAndCheck();