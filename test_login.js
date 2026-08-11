async function testLogin() {
    const url = 'https://urbaniq-backend-14tl.onrender.com/auth/login';
    
    try {
        console.log("Registering test account...");
        const reg = await fetch('https://urbaniq-backend-14tl.onrender.com/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                full_name: "Test User",
                email: "test.android.bug@example.com",
                password: "Password123!",
                role: "researcher"
            })
        });
        const regBody = await reg.json();
        if (reg.ok) {
            console.log("Registered successfully.");
        } else if (reg.status === 400 && regBody.detail === "Email already registered") {
            console.log("Account already registered.");
        } else {
            console.error("Failed to register:", regBody);
        }
    } catch (err) {
        console.error("Network error during registration:", err.message);
    }

    const testCases = [
        { desc: "Exact match", email: "test.android.bug@example.com" },
        { desc: "Capitalized First Letter", email: "Test.android.bug@example.com" },
        { desc: "Trailing space", email: "test.android.bug@example.com " },
        { desc: "Leading space", email: " test.android.bug@example.com" },
    ];

    for (let tc of testCases) {
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: tc.email,
                    password: "Password123!"
                })
            });
            const body = await res.json();
            if (res.ok) {
                console.log(`[${tc.desc}] SUCCESS. Token received.`);
            } else {
                console.log(`[${tc.desc}] FAILED. Status:`, res.status, "Detail:", body.detail);
            }
        } catch (err) {
            console.log(`[${tc.desc}] FAILED with network error:`, err.message);
        }
    }
}

testLogin();
