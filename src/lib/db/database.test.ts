import { CvGeniusDatabase } from "./database";

describe("CvGeniusDatabase", () => {
  it("instantiates without throwing", () => {
    expect(() => new CvGeniusDatabase()).not.toThrow();
  });

  it("exposes all expected tables", () => {
    const database = new CvGeniusDatabase();
    expect(database.profiles).toBeDefined();
    expect(database.cvs).toBeDefined();
    expect(database.snapshots).toBeDefined();
    expect(database.workingStates).toBeDefined();
    expect(database.themes).toBeDefined();
    expect(database.settings).toBeDefined();
    expect(database.blobs).toBeDefined();
  });

  it("uses the correct database name", () => {
    const database = new CvGeniusDatabase();
    expect(database.name).toBe("cv-genius");
  });

  it("is at schema version 1", () => {
    const database = new CvGeniusDatabase();
    expect(database.verno).toBe(1);
  });
});
