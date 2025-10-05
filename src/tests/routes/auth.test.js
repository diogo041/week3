const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../server');
const User = require('../../models/User');

describe('Auth Routes: /api/auth', () => {

    // Clear the User collection to ensure a clean slate.
    beforeEach(async () => {
        await User.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    /**
     * Test suite for the POST /signup endpoint
     */
    describe('POST /signup', () => {

        // Test Case 1: Successful User Registration
        it('should create a new user, return 201, and set auth cookies', async () => {
            const validNewUser = {
                name: 'John Doe',
                username: 'johndoe',
                email: 'john.doe@example.com',
                password: 'securePassword123',
            };

            // Send a POST request to the /signup endpoint
            const res = await request(app)
                .post('/api/auth/signup')
                .send(validNewUser);

            // 1. Assert the HTTP status code is 201 (Created)
            expect(res.statusCode).toBe(201);

            // 2. Assert the response body contains the correct public user data
            expect(res.body).toHaveProperty('id');
            expect(res.body.name).toBe(validNewUser.name);
            expect(res.body.username).toBe(validNewUser.username);
            expect(res.body.email).toBe(validNewUser.email);
            // Ensure sensitive data like the password hash is NOT returned
            expect(res.body).not.toHaveProperty('passwordHash');

            // 3. Assert that the access and refresh token cookies are being set
            const cookies = res.get('Set-Cookie');
            expect(cookies).toBeDefined();
            expect(cookies.some(cookie => cookie.startsWith('accessToken='))).toBe(true);
            expect(cookies.some(cookie => cookie.startsWith('refreshToken='))).toBe(true);
        });
    });
});