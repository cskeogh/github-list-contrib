import axios from 'axios';

let ghToken = 'bc639a3054f5bcb8bbd9ec71818bd35fece4e742'

interface Query {
    query: string
}

async function doFetch(gql: Query): Promise<string> {
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

async function getContributions(login: string) {
    const gql = {
        query: `
        {
            user(login: "${login}") {
                contributionsCollection(from: "2016-06-01T00:00:00", to: "2016-12-01T00:00:00") {
                    issueContributionsByRepository(maxRepositories: 100) {
                        repository {
                            name
                        }
                        contributions(first: 100) {
                            nodes {
                                issue {
                                    title
                                }
                            }
                        }  
                    }
                }
            }
          }`}
        //   {
        //     user(login: "${login}") {
        //         contributionsCollection(from: "2016-06-01T00:00:00", to: "2016-12-01T00:00:00") {
        //             issueContributions(first: 100) {
        //               nodes {
        //                   issue {
        //                       title
        //                   }
        //               }
        //             }
        //         }
        //     }
        //   }`}

    //       {
    //   user(login: "${login}") {
    //     repositoriesContributedTo(first: 100, contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, REPOSITORY]) {
    //         totalCount
    //             nodes {
    //                 nameWithOwner
    //             }
    //         pageInfo {
    //             endCursor
    //             hasNextPage
    //         }
    //     }
    //   }
    // }`}

    // {
    //     user(login: "${login}") {
    //       repositoriesContributedTo(orderBy: {field: UPDATED_AT, direction: ASC}, first: 10) {
    //         edges {
    //           node {
    //             id
    //             nameWithOwner
    //             shortDescriptionHTML(limit: 120)
    //             stargazers {
    //               totalCount
    //             }
    //             url
    //             openGraphImageUrl
    //           }
    //         }
    //       }
    //     }
    //   }
    //   `}
  

    let contrib = await doFetch(gql)
    console.log(contrib);
    //console.log((contrib as any).user.repositoriesContributedTo.edges);
}

function main() {
    console.log('main');
    getContributions('cskeogh');
}

main();
