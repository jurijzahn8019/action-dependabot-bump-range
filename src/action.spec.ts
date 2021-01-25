/* eslint-disable @typescript-eslint/no-explicit-any */
import { getInput, info, setFailed, setOutput, warning } from "@actions/core";
import { getOctokit } from "@actions/github";
import { SemVer } from "semver";
import { run } from "./action";
import { getEvent, matchTitle, verDiff } from "./utils";

jest.mock("@actions/core");
jest.mock("@actions/github");
jest.mock("./utils");

const verDiffMock = verDiff as jest.MockedFunction<typeof verDiff>;
const getEventMock = getEvent as jest.MockedFunction<typeof getEvent>;
const matchTitleMock = matchTitle as jest.MockedFunction<typeof matchTitle>;
const getInputMock = getInput as jest.MockedFunction<typeof getInput>;
const setFailedMock = setFailed as jest.MockedFunction<typeof setFailed>;
const getOctokitMock = getOctokit as jest.MockedFunction<typeof getOctokit>;
const infoMock = info as jest.MockedFunction<typeof info>;
const setOutputMock = setOutput as jest.MockedFunction<typeof setOutput>;
const warningMock = warning as jest.MockedFunction<typeof warning>;

const octokit = {
  pulls: { get: jest.fn() },
};

describe("action", () => {
  beforeEach(() => {
    getOctokitMock.mockReturnValue(octokit as any);
    getEventMock.mockResolvedValue({ pull_request: { number: 666 } });

    octokit.pulls.get.mockResolvedValue({ data: { title: "The Foo PR" } });
    matchTitleMock.mockReturnValue({
      from: new SemVer("2.0.0"),
      to: new SemVer("3.0.0"),
    });
    verDiffMock.mockReturnValue("major");

    getInputMock.mockReturnValueOnce("THE TOKEN");
  });

  it("happy path", async () => {
    await expect(run()).resolves.toBeUndefined();

    expect(warningMock).not.toHaveBeenCalled();
    expect(setFailedMock).not.toHaveBeenCalled();

    expect(getInputMock).toHaveBeenCalledTimes(1);
    expect(getOctokitMock).toHaveBeenCalledTimes(1);
    expect(getOctokitMock).toHaveBeenCalledWith("THE TOKEN");

    expect(matchTitleMock).toHaveBeenCalledTimes(1);
    expect(matchTitleMock).toHaveBeenCalledWith("The Foo PR");

    expect(verDiffMock).toHaveBeenCalledTimes(1);
    expect(verDiffMock).toHaveBeenCalledWith(
      new SemVer("2.0.0"),
      new SemVer("3.0.0")
    );

    expect(setOutputMock).toHaveBeenCalledTimes(3);
    expect(setOutputMock).toHaveBeenNthCalledWith(1, "from", "2.0.0");
    expect(setOutputMock).toHaveBeenNthCalledWith(2, "to", "3.0.0");
    expect(setOutputMock).toHaveBeenNthCalledWith(3, "diff", "major");

    expect(infoMock).toHaveBeenCalledTimes(1);
    expect(infoMock).toHaveBeenCalledWith(
      "Calculated Range from: 2.0.0 to: 3.0.0 diff: major"
    );
  });

  it("Should fail if error", async () => {
    getEventMock.mockRejectedValue(new Error("THE FOO"));

    await expect(run()).resolves.toBeUndefined();

    expect(warningMock).not.toHaveBeenCalled();
    expect(setFailedMock).toHaveBeenCalledTimes(1);
    expect(setFailedMock).toHaveBeenCalledWith("THE FOO");

    expect(setOutputMock).not.toHaveBeenCalled();
    expect(verDiffMock).not.toHaveBeenCalled();
    expect(infoMock).not.toHaveBeenCalled();
    expect(matchTitleMock).not.toHaveBeenCalled();
    expect(octokit.pulls.get).not.toHaveBeenCalled();
  });

  it("Should skip if no pr info", async () => {
    getEventMock.mockResolvedValue({});

    await expect(run()).resolves.toBeUndefined();

    expect(warningMock).not.toHaveBeenCalled();
    expect(setFailedMock).not.toHaveBeenCalled();

    expect(setOutputMock).toHaveBeenCalledTimes(1);
    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      "result",
      "no pr info provided"
    );

    expect(verDiffMock).not.toHaveBeenCalled();
    expect(infoMock).not.toHaveBeenCalled();
    expect(matchTitleMock).not.toHaveBeenCalled();
    expect(octokit.pulls.get).not.toHaveBeenCalled();
  });

  it("Should skip if not match title", async () => {
    matchTitleMock.mockReturnValue(undefined);

    await expect(run()).resolves.toBeUndefined();

    expect(warningMock).toHaveBeenCalledTimes(1);
    expect(warningMock).toHaveBeenCalledWith("Not dependabot: The Foo PR");

    expect(setFailedMock).not.toHaveBeenCalled();

    expect(getInputMock).toHaveBeenCalledTimes(1);
    expect(getOctokitMock).toHaveBeenCalledTimes(1);
    expect(getOctokitMock).toHaveBeenCalledWith("THE TOKEN");

    expect(matchTitleMock).toHaveBeenCalledTimes(1);
    expect(matchTitleMock).toHaveBeenCalledWith("The Foo PR");

    expect(verDiffMock).not.toHaveBeenCalled();
    expect(infoMock).not.toHaveBeenCalled();

    expect(setOutputMock).toHaveBeenCalledTimes(1);
    expect(setOutputMock).toHaveBeenNthCalledWith(1, "error", "not dependabot");
  });

  it("Should skip if no range", async () => {
    verDiffMock.mockReturnValue(null);

    await expect(run()).resolves.toBeUndefined();

    expect(setFailedMock).not.toHaveBeenCalled();

    expect(getInputMock).toHaveBeenCalledTimes(1);
    expect(getOctokitMock).toHaveBeenCalledTimes(1);
    expect(getOctokitMock).toHaveBeenCalledWith("THE TOKEN");

    expect(matchTitleMock).toHaveBeenCalledTimes(1);
    expect(matchTitleMock).toHaveBeenCalledWith("The Foo PR");

    expect(verDiffMock).toHaveBeenCalledTimes(1);
    expect(verDiffMock).toHaveBeenCalledWith(
      new SemVer("2.0.0"),
      new SemVer("3.0.0")
    );

    expect(warningMock).toHaveBeenCalledTimes(1);
    expect(warningMock).toHaveBeenCalledWith("Not semver range: The Foo PR");

    expect(setOutputMock).toHaveBeenCalledTimes(1);
    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      "error",
      "not semver range"
    );

    expect(infoMock).not.toHaveBeenCalled();
  });
});
