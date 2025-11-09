document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // --- I. UTILITY FUNCTIONS (Local Storage Access) ---
    // ----------------------------------------------------

    // --- User Data Utilities ---
    function getUsers() {
        const usersJSON = localStorage.getItem('appUsers');
        if (!usersJSON) {
            // Initial users for testing (including the admin user)
            const initialUsers = [
                { fullName: "Test User", email: "user@sce.edu.bt", password: "password123", isGoogle: false, role: "user" },
                { fullName: "Admin User", email: "admin@sce.edu.bt", password: "admin123", isGoogle: false, role: "admin" } 
            ];
            localStorage.setItem('appUsers', JSON.stringify(initialUsers));
            return initialUsers;
        }
        return JSON.parse(usersJSON);
    }

    function saveUsers(users) {
        localStorage.setItem('appUsers', JSON.stringify(users));
    }

    // --- Event Data Utilities (Consistent Keys - Made Global for Cross-File Access) ---
    window.EVENT_KEY = 'collegeEvents'; 
    window.REGISTRATION_KEY = 'registeredEvents';

    function getEvents() {
        const eventsJSON = localStorage.getItem(window.EVENT_KEY);
        return eventsJSON ? JSON.parse(eventsJSON) : [];
    }

    function saveEvents(events) {
        localStorage.setItem(window.EVENT_KEY, JSON.stringify(events));
    }

    // ----------------------------------------------------
    // --- II. GOOGLE/EMAIL/NOTIFICATION SIMULATION (CORE) ---
    // ----------------------------------------------------

    // 📧 SIMULATION: This logs the action to the console (F12) instead of sending a real email.
    window.sendConfirmationEmail = function(recipientEmail, subject, body) {
        console.log(`[SIMULATION SUCCESS: GMAIL] Sent email to: ${recipientEmail}. Subject: ${subject}`);
        console.log(`Email Body Snippet: ${body.substring(0, 80)}...`);
    }

    // 🗓️ SIMULATION: This logs the action to the console (F12) instead of hitting Google Calendar API.
    window.addEventToCalendar = function(eventTitle, date, time, email) {
        console.log(`[SIMULATION SUCCESS: GOOGLE CALENDAR] Added event for ${email}`);
        console.log(`Event: ${eventTitle} on ${date} at ${time}`);
    }

    // 🔔 WEB NOTIFICATION API (Real Browser Pop-up, requires user permission)
    function requestNotificationPermission() {
        if (!("Notification" in window)) {
            console.log("Browser does not support desktop notification");
        } else if (Notification.permission !== "denied") {
            // Request permission only if it hasn't been denied
            Notification.requestPermission();
        }
    }

    window.displayWebNotification = function(title, body) {
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification(title, {
                body: body,
                icon: 'assets/logo.png' 
            });
        }
    }
    
    // --------------------------
    // --- III. SIGN UP LOGIC ----
    // --------------------------
    const signupForm = document.getElementById('signup-form');
    // REMOVED: const googleSignupBtn = document.getElementById('google-signup-btn');

    if (signupForm) {
        signupForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const fullName = document.getElementById('signup-full-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('signup-confirm-password').value;

            if (password !== confirmPassword) {
                alert("Passwords do not match!");
                return;
            }

            const users = getUsers();
            if (users.find(user => user.email === email)) {
                alert("This email is already registered.");
                return;
            }

            // NOTE: isGoogle is always false since manual sign-up is the only option
            users.push({ fullName, email, password, isGoogle: false, role: "user" }); 
            saveUsers(users);

            // 📧 Simulate Welcome Email
            window.sendConfirmationEmail(
                email,
                'Welcome to SCE Digital Notice Board!',
                `Dear ${fullName},\n\nThank you for signing up! You can now register for all upcoming events at Samtse College of Education.`
            );

            alert("Sign up successful! Please log in with your new account.");
            window.location.href = 'index.html';
        });
    }

    // REMOVED: Google sign-up button listener logic here.

    // --------------------------
    // --- IV. LOGIN LOGIC -----
    // --------------------------
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const users = getUsers();
            const foundUser = users.find(user => user.email === email && user.password === password);
            
            // Admin Login
            if (email === "admin@sce.edu.bt" && password === "admin123") {
                alert("Welcome Admin!");
                localStorage.setItem("loggedInUser", JSON.stringify({ email, role: "admin" }));
                window.location.href = 'select_role.html';
            }
            // Normal User Login
            else if (foundUser) {
                alert(`Welcome back, ${foundUser.fullName.split(' ')[0]}!`);
                localStorage.setItem("loggedInUser", JSON.stringify({ email, role: "user" }));
                // Request notification permission immediately after successful login
                requestNotificationPermission(); 
                window.location.href = 'select_role.html';
            } else {
                alert("Invalid email or password. Please try again or Sign Up.");
            }
        });
    }

    // ----------------------------------------------------
    // --- V. ADMIN EVENT CREATION HOOK ---
    // ----------------------------------------------------
    // This is the function your admin.html must call upon saving a new event.
    window.handleAdminEventSave = function(eventData) {
        const events = getEvents();
        // Ensure eventData includes date, title, etc., and assign a unique ID
        const newEvent = { ...eventData, _id: Date.now().toString() }; 
        events.push(newEvent);
        saveEvents(events);
        
        // 📧 Notify all users about the new event
        getUsers().forEach(user => {
            if(user.role === 'user') {
                window.sendConfirmationEmail(
                    user.email,
                    `📢 New Event Added: ${newEvent.title}`,
                    `Dear ${user.fullName || 'User'},\n\nA new event, "${newEvent.title}", has been added to the college calendar. Date: ${newEvent.date}`
                );
            }
        });

        // 🔔 Push Notification to whoever is currently browsing
        window.displayWebNotification(
            `New Event: ${newEvent.title}`, 
            `A new event has been scheduled for ${newEvent.date}. Check the notice board!`
        );
        
        console.log(`Event "${newEvent.title}" saved. Check console for email/notification log.`);
        return true; 
    }


    // --------------------------------------------------
    // --- VI. DYNAMIC EVENT RENDERING ---
    // --------------------------------------------------
    const path = window.location.pathname;

    function renderUpcomingEvents(category) {
        // ... (Function body omitted for brevity, logic remains the same) ...
        const events = getEvents();
        const container = document.getElementById('eventsContainer'); 
        
        const today = new Date().toISOString().split('T')[0];
        const filteredEvents = events.filter(event => 
            event.category === category && event.date >= today
        );
        
        if (!container) return;
        // ... (Rest of rendering logic)
    }

    // Ensure notification permission is requested when navigating to event pages
    if (path.includes('events_academic.html') || path.includes('events_sports_games.html') || path.includes('events_cultural.html')) {
        requestNotificationPermission(); 
        if (path.includes('events_academic.html')) renderUpcomingEvents('Academic');
        else if (path.includes('events_sports_games.html')) renderUpcomingEvents('Sports & Games');
        else if (path.includes('events_cultural.html')) renderUpcomingEvents('Cultural');
    }
    
});