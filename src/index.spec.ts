import { run } from "./action";

jest.mock("./action");

const runMock = run as jest.MockedFunction<typeof run>;
runMock.mockResolvedValue();

describe("index", () => {
  it("Should execute run function", async () => {
    await expect((await import("./index")).default).resolves.toBeUndefined();
    expect(runMock).toHaveBeenCalledTimes(1);
  });
});
