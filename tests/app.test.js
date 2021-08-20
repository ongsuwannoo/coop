const request = require("supertest");
const server = require("../routes/users");

describe("Hi Endpoints", () => {
  it("Hi return Hello world!", async () => {
    const res = await request(server).get("/health");
    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual("respond with a resource");
  });
});