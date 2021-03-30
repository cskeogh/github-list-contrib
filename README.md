# github-list-contrib

Generates a summary report (csv) of user's GitHub contributions. Report is grouped by year, then repository.

The fields in the report:
1. Year
2. Repository
3. number of commits (the user has committed to that repository in that year)
4. number of issues
5. number of pull requests
6. number of reviews

Usage:
Set the following environment variables or use `.env`:

`GITHUB_API_TOKEN=`<[github api token](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token)><BR />
`GITHUB_LIST_CONTRIB_USER=<username>`<BR />
`GITHUB_LIST_CONTRIB_OUTPUT_FILE=<filename>`
