#!/usr/bin/env node

import * as fetch from 'node-fetch';
require('dotenv').config();

const USERNAME = 'smirnovanv';
const PROJECT = 'AppCenterTest-Android';
const DELAY = 100000;
const buildStatus = {
    notStarted: 'notStarted',
    inProgress: 'inProgress'
};

async function getBranches () {
    const response = await fetch(`https://api.appcenter.ms/v0.1/apps/${USERNAME}/${PROJECT}/branches`, {
        headers: {
            'X-API-Token': process.env.TOKEN
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
                'X-API-Token': process.env.TOKEN,
            },
            body: JSON.stringify({ sourceVersion: version, debug: false })
        })
    }
}

async function checkBuilds () {
    const branches = await getBranches();
    const branchStatus = branches.every((branch) => branch.lastBuild.status !== buildStatus.notStarted && branch.lastBuild.status !== buildStatus.inProgress);

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
                'X-API-Token': process.env.TOKEN
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
    setTimeout(checkBuilds, DELAY);
}

async function buildAndCheck() {
    try {
        buildBranches();
        setTimeout(checkBuilds, DELAY);
    } catch {
        console.log('error')
    }
}

buildAndCheck();