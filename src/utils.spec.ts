import { SemVer } from "semver";
import { matchTitle, verDiff } from "./utils";

const titles = [
  "chore(deps-dev): bump @rollup/plugin-commonjs from 11.1.0 to 13.0.0",
  "chore(deps-dev): bump @otto-ec/toolbox from 1.13.0 to 1.13.1",
  "chore(deps-dev): bump @mdi/font from 5.2.45 to 5.3.45",
  "chore(deps-dev): bump jest from 25.4.0 to 26.0.1",
  "chore(deps): bump actions/setup-node from v1 to v2.0.0",
  "chore(deps-dev): foo bar 35.4.0",
  "chore(deps-dev): bump foobaz from 5.4.0 to 06.0.0",
  "Bump actions/setup-java from v1 to v2",
  "npm(deps-dev): bump @vue/test-utils from 2.0.0-rc.4 to 2.0.0-rc.6",
];

describe("utils", () => {
  describe("matchTitle", () => {
    it("Should match title", () => {
      titles.forEach((t) => expect(matchTitle(t)).toMatchSnapshot(t));
    });
  });

  describe("verDiff", () => {
    it("Should compare versions", () => {
      [
        { from: "0.3.4", to: "0.4.0" },
        { from: "1.3.4", to: "1.3.5" },
        { from: "1.3.4", to: "1.4.5" },
        { from: "1.3.4", to: "2.4.5" },
        { from: "1.3.4-rc.3", to: "1.3.4-rc.4" },
      ].forEach((v) =>
        expect(verDiff(new SemVer(v.from), new SemVer(v.to))).toMatchSnapshot(
          `${v.from}:${v.to}`
        )
      );
    });
  });

  describe("getEvent", () => {
    it("Should read event from runner", async () => {
      jest.resetModules();

      const { promises: fs } = await import("fs");
      const readFileSpy = jest.spyOn(fs, "readFile");
      readFileSpy.mockResolvedValue(JSON.stringify({ some: "foo" }));

      process.env.GITHUB_EVENT_PATH = "The Foo Path";
      const { getEvent } = await import("./utils");

      const res = await getEvent();

      expect(res).toEqual({ some: "foo" });
      expect(readFileSpy).toHaveBeenCalledWith("The Foo Path", "utf8");
    });
  });
});
