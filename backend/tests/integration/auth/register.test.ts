import request from "supertest";
import app from "../../../src/app.js";
import { describe, it, expect } from "vitest";

describe("Register API", () => {

    it("should register a new organization and owner", async () => {

        const response = await request(app)
            .post("/api/v1/auth/register")
            .send({
                organization: {
                    name: "Acme Technologies"
                },
                user: {
                    firstName: "Anshu",
                    lastName: "Vishwakarma",
                    email: "anshu@test.com",
                    password: "Password@123"
                }
            });

        expect(response.status).toBe(201);

        expect(response.body.success).toBe(true);

        expect(response.body.data.user.email)
            .toBe("anshu@test.com");

    });

});