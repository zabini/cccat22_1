import axios, { AxiosResponse } from "axios";

test("Should create account", async () => {
    // Given
    const input = {
        name: "John Doe",
        email: `john.doe+${crypto.randomUUID()}@gmail.com`,
        document: "97456321558",
        password: "asdQWE123",
    };
    // When
    const responseSignup = await axios.post(
        "http://localhost:3000/signup",
        input
    );
    const outputSignup = responseSignup.data;
    // Then
    expect(outputSignup.accountId).toBeDefined();
    const responseGetAccount = await axios.get(
        `http://localhost:3000/accounts/${outputSignup.accountId}`
    );
    const outputGetAccount = responseGetAccount.data;
    expect(outputGetAccount.name).toBe(input.name);
    expect(outputGetAccount.email).toBe(input.email);
    expect(outputGetAccount.document).toBe(input.document);
    expect(outputGetAccount.password).toBe(input.password);
});

test.each([null, undefined, 1.2, "", " Homer   "])(
    "Should validate wrong names",
    async (name: any) => {
        // Given
        const input = {
            name: name,
        };

        // When
        let response: AxiosResponse | undefined;
        try {
            response = await axios.post(`http://localhost:3000/signup`, input);
        } catch (error: any) {
            response = error.response;
        }

        // then
        expect(response).toBeDefined();
        expect(response?.status).toBe(422);
        expect(response?.data.title).toBe("Name must be valid");
    }
);

test.each([
    null,
    undefined,
    1.2,
    "",
    "emailATemail.com",
    " this is my email ",
    " email @ email.com",
    "em@il@email",
    "  @email.com  ",
    "email@  ",
    "email@emailDOTcom",
])("Should validate wrong email", async (email: any) => {
    // Given
    const input = {
        name: "Homer Simpson",
        email: email,
    };

    // When
    let response: AxiosResponse | undefined;
    try {
        response = await axios.post(`http://localhost:3000/signup`, input);
    } catch (error: any) {
        response = error.response;
    }

    // then
    expect(response).toBeDefined();
    expect(response?.status).toBe(422);
    expect(response?.data.title).toBe("Email must be valid");
});

test("Should validate existing email", async () => {
    // Given
    const input = {
        name: "Homer Simpson",
        email: `email+${crypto.randomUUID()}@email.com`,
        document: "97456321558",
        password: "asdQWE123",
    };

    let correctResponse: AxiosResponse | undefined,
        wrongResponse: AxiosResponse | undefined;

    // When
    correctResponse = await axios.post(`http://localhost:3000/signup`, input);
    const correctResponseGetAccount = await axios.get(
        `http://localhost:3000/accounts/${correctResponse?.data.accountId}`
    );

    try {
        wrongResponse = await axios.post(`http://localhost:3000/signup`, input);
    } catch (error: any) {
        wrongResponse = error.response;
    }

    // then
    expect(correctResponse?.data.accountId).toBeDefined();
    expect(correctResponseGetAccount.data.email).toBe(input.email);

    expect(wrongResponse).toBeDefined();
    expect(wrongResponse?.status).toBe(422);
    expect(wrongResponse?.data.title).toBe("Email already in use, choose another");
});
