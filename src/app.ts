import axios from 'axios';
import dotenv from 'dotenv';
import * as fs from 'fs/promises';
import * as chartnode from 'chartjs-node-canvas';

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

async function chart() {

    const width = 400;
    const height = 400;
    const chartCallback = (ChartJS: any) => {

        // Global config example: https://www.chartjs.org/docs/latest/configuration/
        ChartJS.defaults.global.elements.rectangle.borderWidth = 2;
        // Global plugin example: https://www.chartjs.org/docs/latest/developers/plugins.html
        ChartJS.plugins.register({
            // plugin implementation
        });
        // New chart type example: https://www.chartjs.org/docs/latest/developers/charts.html
        ChartJS.controllers.MyType = ChartJS.DatasetController.extend({
            // chart implementation
        });
    };
    const chartJSNodeCanvas = new chartnode.ChartJSNodeCanvas({ width, height, chartCallback });

    const configuration = {
        type: 'bar',
        data: {
            labels: ['2003', '2004'],
            datasets: [{
                label: 'commit',
                backgroundColor: 'rgba(255, 0, 0, 1.0)',
                stack: 'proj 1',
                data: [1, 5],
            }, {
                label: 'issue',
                backgroundColor: 'rgba(0, 255, 0, 1.0)',
                stack: 'proj 1',
                data: [2, 7],
            }, {
                label: 'pr',
                backgroundColor: 'rgba(0, 0, 255, 1.0)',
                stack: 'proj 1',
                data: [3, 3],
            }, {
                label: 'issue',
                backgroundColor: 'rgba(0, 255, 0, 1.0)',
                stack: 'proj 2',
                data: [2, 7],
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    stacked: true,
                }],
                yAxes: [{
                    stacked: true
                }]
            }
        }
    };
    const image = await chartJSNodeCanvas.renderToBuffer(configuration);
    // const dataUrl = await chartJSNodeCanvas.renderToDataURL(configuration);
    // const stream = chartJSNodeCanvas.renderToStream(configuration);

    const file = await fs.open('output/out.png', 'w');
    file.write(image);
    file.close();
}

async function main() {
    dotenv.config();
    let ghUser = process.env.GITHUB_LIST_CONTRIB_USER;
    if (ghUser === undefined) {
        throw "env GITHUB_LIST_CONTRIB_USER not defined."
    }
    //getContributions(ghUser, 2012, 2021);
    await chart();
}

main();
