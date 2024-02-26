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
const ghBranches = branchesRes.data.map((branch) => branch.name)

const neonClient = createApiClient({
  apiKey: options.neonToken!,
});

const neonBranchesRes = await neonClient.listProjectBranches(options.neonProjectId!)
const neonBranches = neonBranchesRes.data.branches.map((neonBranch) => neonBranch.name)

neonBranches.forEach(async (neonBranch) => {
  if(!ghBranches.includes(neonBranch)) {
    const removalRes = await neonClient.deleteProjectBranch(options.neonProjectId!, neonBranch)
    if (removalRes.status === 200) {
      console.log(`${neonBranch} removed!`)
    } else {
      console.log(`Error removing ${neonBranch}!`)
    }
  }
})