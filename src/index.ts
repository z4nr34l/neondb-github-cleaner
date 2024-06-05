import { parseArgs } from "util";
import {Octokit} from "octokit";
import {createApiClient} from "@neondatabase/api-client";

const { values: options, positionals } = parseArgs({
  args: Bun.argv,
  options: {
    repository: {
      type: 'string',
    },
    owner: {
      type: 'string'
    },
    ghToken: {
      type: 'string',
    },
    neonToken: {
      type: 'string',
    },
    neonProjectId: {
      type: 'string',
    }
  },
  strict: true,
  allowPositionals: true,
});

const octokit = new Octokit({ auth: options.ghToken });
const branchesRes = await octokit.rest.repos.listBranches({
  owner: options.owner!,
  repo: options.repository!
})
const ghBranches = branchesRes.data.map((branch) => `preview/${branch.name}`).concat(["main", "master", "dev", "release", "test", "vercel-dev"])

const neonClient = createApiClient({
  apiKey: options.neonToken!,
});

const neonBranchesRes = await neonClient.listProjectBranches(options.neonProjectId!)
const neonBranches = neonBranchesRes.data.branches.map((neonBranch) => ({
  id: neonBranch.id,
  name: neonBranch.name
}))

neonBranches.forEach(async (neonBranch) => {
  if(!ghBranches.includes(neonBranch.name)) {
    await neonClient.deleteProjectBranch(options.neonProjectId!, neonBranch.id).then((response) => {
      if (response.status === 200) {
        console.log(`${neonBranch.name} removed!`, response.data)
      } else {
       throw new Error(response.statusText)
      }
    }).catch((error) => {
      console.error(`Error deleting ${neonBranch.name}`,error.response.data)
    })
  }
})