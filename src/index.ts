/*****
 License
 --------------
 Copyright © 2017 Bill & Melinda Gates Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

 Contributors
 --------------
 This is the official list (alphabetical ordering) of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.

 * Gates Foundation
 - Name Surname <name.surname@gatesfoundation.com>

 * Crosslake
 - Pedro Sousa Barreto <pedrob@crosslaketech.com>

 --------------
 ******/

'use strict'

import axios, { AxiosResponse, AxiosInstance } from "axios";
import { readFile } from 'fs/promises';
import {DockerFileStatus, RepoItem, RepoNvmrcFileStatus} from "./types";

const GITHUB_API_BASE_URL = "https://api.github.com";
const GITHUB_RAW_BASE_URL = "https://raw.githubusercontent.com";
const USE_TEST_DATA_FILE = false;
const TEST_DATA_FILE_PATH = "./data/test-data.json";

let client:AxiosInstance;

const keys = Object.getOwnPropertyNames(new RepoItem());
function pick(obj:any){
    // @ts-ignore
    return  Object.assign({}, ...keys.map(key => ({ [key]: obj[key] })))
}

async function setup():Promise<void> {
    client = axios.create({
        timeout: 10000,
    })
}

async function fetchRepos(): Promise<any[]> {
    let items:any[] = [];

    if(USE_TEST_DATA_FILE){
        let fileData = JSON.parse(await readFile(TEST_DATA_FILE_PATH, "utf8"));
        if(fileData && fileData.items){
            items = fileData.items;
        }
        return items;
    }

    // @ts-ignore
    const resp: AxiosResponse<any> = await client.get(GITHUB_API_BASE_URL + "/search/repositories?per_page=500&q=org:mojaloop+language:typescript+language:javascript");

    if(resp && resp.data && resp.data.total_count >0){
        console.log(`Found ${resp.data.total_count} matching repositories`);
        items = resp.data.items;
    }

    return items;
}

async function parseAndSortReposList(itemsData:any):Promise<RepoItem[]>{
    const parsedItems : RepoItem[] = [];
    itemsData.forEach((item:any) => {
        parsedItems.push(pick(item));
    });

    // @ts-ignore
    parsedItems.sort((a, b) => a.pushed_at < b.pushed_at ? 1 : -1 );

    //console.log(parsedItems);
    return parsedItems;
}


async function checkAndParseNvmrcFile(repo:RepoItem): Promise<RepoNvmrcFileStatus> {
    return await client.get(GITHUB_RAW_BASE_URL + `/mojaloop/${repo.name}/${repo.default_branch}/.nvmrc`).then(resp => {
        return {hasFile: true, nodeVersion: resp.data.replace(/\r?\n|\r/g, "")}; // remove all kinds of newlines and cr's
    }).catch(reason => {
        return {hasFile: false};
    });
}

async function checkAndParseDockerfile(repo:RepoItem): Promise<DockerFileStatus> {
    return await client.get(GITHUB_RAW_BASE_URL + `/mojaloop/${repo.name}/${repo.default_branch}/Dockerfile`).then(resp => {
        //const lines:string[] = resp.data.split("\n");
        const regex = new RegExp("^FROM node\:(\\S*)(?: as .*)?", "gim");

        const regexResp = regex.exec(resp.data);
        if(regexResp && regexResp.length >= 2 && regexResp[1].length > 0){
            return {hasFile: true, nodeVersion: regexResp[1]};
        }

        return {hasFile: false};
    }).catch(reason => {
        return {hasFile: false};
    });
}

function printOut(repos: RepoItem[]): void{
    let debugLine = "";
    let i=0;

    for (const repo of repos) {
        debugLine = `${i} | ${repo.name} |`;
        if(repo.nvmrcStatus.hasFile) {
            debugLine += ` .nvmrc -> ${repo.nvmrcStatus.nodeVersion}`;
        }else{
            debugLine += ` (no .nvmrc)`;
        }

        if(repo.dockerStatus.hasFile) {
            debugLine += ` | Dockerfile image -> ${repo.dockerStatus.nodeVersion}`;
        }else{
            debugLine += ` | (no Dockerfile)`;
        }

        if(repo.topics && repo.topics.length>0)
            debugLine += ` | topics: ${repo.topics.join(",")}`

        debugLine += ` | lastChanged: ${repo.updated_at}`
        console.log(debugLine);
        i++;
    }
}

async function run(): Promise<void> {
    await setup();

    const itemsData = await fetchRepos();
    const parsedRepos: RepoItem[] = await parseAndSortReposList(itemsData);

    for (const repo of parsedRepos) {
        [repo.nvmrcStatus, repo.dockerStatus] = await Promise.all([checkAndParseNvmrcFile(repo), checkAndParseDockerfile(repo)]);
    }

    printOut(parsedRepos);
}

run().then(value => {
    console.log("done");
}).catch(error => {
    console.error(error);
})
