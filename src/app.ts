import axios from 'axios';
import dotenv from 'dotenv';
import * as fs from 'fs/promises';

interface Query {
    query: string
}

async function doFetch(gql: Query): Promise<string> {
    let ghToken = process.env.GITHUB_API_TOKEN;
    if (ghToken === undefined) {
        throw "env GITHUB_API_TOKEN not defined."
    }
    const headers = {
        'Content-type': 'application/json',
        'Authorization': 'token ' + ghToken,
    };

    let req = await axios.post("https://api.github.com/graphql", JSON.stringify(gql),
        {
            headers: headers
        });

    return req.data;
}

async function getContributions(login: string, startYear: number, endYear: number) {
    const filename = process.env.GITHUB_LIST_CONTRIB_OUTPUT_FILE;
    if (filename === undefined) {
        throw "env GITHUB_LIST_CONTRIB_OUTPUT_FILE not defined."
    }
    const file = await fs.open(filename, 'w');

    for (let year = startYear; year < endYear; ++year) {
        const yearStr = year.toString();
        const gql = {
            query: `
        {
            user(login: "${login}") {
                contributionsCollection(from: "${yearStr}-01-01T00:00:00", to: "${yearStr}-12-31T23:59:59") {
                    commitContributionsByRepository(maxRepositories: 100) {
                        repository {
                            nameWithOwner
                        }
                        contributions(first: 10) {
                            totalCount
                        }
                    }
                    issueContributionsByRepository(maxRepositories: 100) {
                        repository {
                            nameWithOwner
                        }
                        contributions(first: 10) {
                            totalCount
                        }
                    }
                    pullRequestContributionsByRepository(maxRepositories: 100) {
                        repository {
                            nameWithOwner
                        }
                        contributions(first: 10) {
                            totalCount
                        }
                    }
                    pullRequestReviewContributionsByRepository(maxRepositories: 100) {
                        repository {
                            nameWithOwner
                        }
                        contributions(first: 10) {
                            totalCount
                        }
                    }
                }
            }
          }`};
        const contrib: any = await doFetch(gql);
        process.stdout.write('.');
        for (let repo of contrib.data.user.contributionsCollection.commitContributionsByRepository) {
            file.write(`${yearStr},${login},${repo.repository.nameWithOwner},commits,${repo.contributions.totalCount}\n`);
        }
        for (let repo of contrib.data.user.contributionsCollection.issueContributionsByRepository) {
            file.write(`${yearStr},${login},${repo.repository.nameWithOwner},issues,${repo.contributions.totalCount}\n`);
        }
        for (let repo of contrib.data.user.contributionsCollection.pullRequestContributionsByRepository) {
            file.write(`${yearStr},${login},${repo.repository.nameWithOwner},pr,${repo.contributions.totalCount}\n`);
        }
        for (let repo of contrib.data.user.contributionsCollection.pullRequestReviewContributionsByRepository) {
            file.write(`${yearStr},${login},${repo.repository.nameWithOwner},review,${repo.contributions.totalCount}\n`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    process.stdout.write('\n');
    await file.close();
}

function main() {
    dotenv.config();
    let ghUser = process.env.GITHUB_LIST_CONTRIB_USER;
    if (ghUser === undefined) {
        throw "env GITHUB_LIST_CONTRIB_USER not defined."
    }
    getContributions(ghUser, 2012, 2021);
}

main();
