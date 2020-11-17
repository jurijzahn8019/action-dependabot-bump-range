/* eslint-disable camelcase */
import { getInput, setFailed, setOutput, warning, info } from "@actions/core";
import { getOctokit, context } from "@actions/github";
import debug from "debug";
import { getEvent, matchTitle, verDiff } from "./utils";

const dbg = debug("action-dependabot-bump-range");

export async function run(): Promise<void> {
  dbg("Check whether user is memebr of teams");
  try {
    dbg("Retrieve inputs");
    const token = getInput("token", { required: true });
    const { pull_request: { number: prNumber } = {} } = await getEvent();
    const client = getOctokit(token);

    // dbg("Process Event: %j", event);
    if (prNumber === undefined) {
      setOutput("result", "no pr info provided");
      return;
    }

    dbg("Fetch pull request data");
    const params = { ...context.repo, pull_number: prNumber };
    const { data: pr } = await client.pulls.get(params);

    dbg("Process pull request title: %s", pr.title);
    const match = matchTitle(pr.title);
    if (!match) {
      warning(`Not dependabot: ${pr.title}`);
      setOutput("error", "not dependabot");
      return;
    }

    dbg(
      "Calculate version diff from: %s to: %s",
      match.from.version,
      match.to.version
    );
    const diff = verDiff(match.from, match.to);
    if (!diff) {
      warning(`Not semver range: ${pr.title}`);
      setOutput("error", "not semver range");
      return;
    }

    info(
      `Calculated Range from: ${match.from.version} to: ${match.to.version} diff: ${diff}`
    );
    setOutput("from", match.from.version);
    setOutput("to", match.to.version);
    setOutput("diff", diff);
  } catch (e) {
    dbg("Failed:", e);
    setFailed(e.message);
  }
}

export const result = run();
