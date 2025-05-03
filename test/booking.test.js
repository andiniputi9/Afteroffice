const request = require("supertest");
const chai = require("chai");
const expect = chai.expect;
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config();

const BASE_URL = "https://restful-booker.herokuapp.com";

describe("API Automation Testing", () => {
    let token;
    let bookingId;
    const bookingData = JSON.parse(fs.readFileSync("data/booking.json", "utf8"));

    it("TCID001 -> API auth - Generate Token", async () => {
        const res = await request(BASE_URL)
            .post("/auth")
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .send({
                username: process.env.USERNAME,
                password: process.env.PASSWORD
            });
            console.log("Status Code:", res.status);
            console.log("Retrieved Token:", res.body.token);

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property("token");
        token = res.body.token;
    });

    it("TCID002 ->  API createBooking - Create New Booking", async () => {
        const res = await request(BASE_URL)
            .post("/booking")
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .send(bookingData);

            console.log("Response Body:\n", JSON.stringify(res.body, null, 2));

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property("bookingid");
        expect(res.body).to.have.property("booking");

        bookingId = res.body.bookingid;

        // Match actual returned booking with sent data (excluding bookingid)
        expect(res.body.booking).to.include.all.keys(
            "firstname",
            "lastname",
            "totalprice",
            "depositpaid",
            "bookingdates",
            "additionalneeds"
        );
        
        expect(res.body.booking).to.deep.include(bookingData);
    });

    it("TCID003 ->  API getBooking - Verify Booking Data", async () => {
        expect(bookingId).to.exist;

        const res = await request(BASE_URL)
            .get(`/booking/${bookingId}`)
            .set("Accept", "application/json");

            console.log("Status Code:", res.status);
            console.log("Response Body:\n", JSON.stringify(res.body, null, 2));

        expect(res.status).to.equal(200);
        expect(res.body).to.deep.include(bookingData);
    });

    it("TCID004 ->  API deleteBooking - Delete Booking Data", async () => {
        expect(token).to.exist;
        expect(bookingId).to.exist;

        const res = await request(BASE_URL)
            .delete(`/booking/${bookingId}`)
            .set("Cookie", `token=${token}`);

            console.log("Status Code:", res.status);

        expect(res.status).to.equal(201);
    });
});