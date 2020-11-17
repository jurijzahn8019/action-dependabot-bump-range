import { SemVer } from "semver";
import { matchTitle, verDiff } from "./utils";

const titles = [
  "chore(deps-dev): bump @rollup/plugin-commonjs from 11.1.0 to 13.0.0",
  "chore(deps-dev): bump @otto-ec/toolbox from 1.13.0 to 1.13.1",
  "chore(deps-dev): bump @mdi/font from 5.2.45 to 5.3.45",
  "chore(deps-dev): bump jest from 25.4.0 to 26.0.1",
  "chore(deps): bump actions/setup-node from v1 to v2.0.0",
  "chore(deps-dev): foo bar 35.4.0",
];

describe("utils/matchTitle", () => {
  it("Should match title", () => {
    titles.forEach((t) => expect(matchTitle(t)).toMatchSnapshot(t));
  });
});

describe("utils/verDiff", () => {
  it("Should compare versions", () => {
    [
      { from: "0.3.4", to: "0.4.0" },
      { from: "1.3.4", to: "1.3.5" },
      { from: "1.3.4", to: "1.4.5" },
      { from: "1.3.4", to: "2.4.5" },
    ].forEach((v) =>
      expect(verDiff(new SemVer(v.from), new SemVer(v.to))).toMatchSnapshot(
        `${v.from}:${v.to}`
      )
    );
  });
});
