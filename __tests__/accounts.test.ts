import request from "supertest";

import app from "../src/main";

const date = Date.now();

describe("Test accounts routes", () => {
    test("create user", async () => {
        const res = await request(app).post("/api/accounts/create").send({
            email: date,
            password: date,
            username: date
        }).expect(200);
    });

    test("delete user", async () => {
        const res = await request(app).post("/api/accounts/login").send({
            password: date,
            username: date
        });

        console.log(res);
    });
})