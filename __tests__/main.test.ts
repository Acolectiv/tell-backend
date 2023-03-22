import request from "supertest";

import app from "../src/main";

describe("Test Main file (main.ts)", () => {
    test("get /", async () => {
        const res = await request(app).get("/");
        expect(res.body).toEqual({ success: true, msg: "online" });
    })
})