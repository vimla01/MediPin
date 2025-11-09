package com.vimla.medipin.controller;

import com.vimla.medipin.entity.User;
import com.vimla.medipin.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(
        origins = {"http://localhost:5500", "http://127.0.0.1:5500"},
        allowCredentials = "true"
)
public class AuthController {

    @Autowired
    private AuthService authService;

    // -----------------------------------------------
    // ✅ Register New User
    // -----------------------------------------------
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        String result = authService.registerUser(user);
        Map<String, Object> response = new HashMap<>();
        response.put("message", result);

        if (result.contains("successfully")) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    // -----------------------------------------------
    // ✅ Manual Login
    // -----------------------------------------------
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user, HttpServletRequest request) {
        try {
            User loggedInUser = authService.validateUser(user.getEmail(), user.getPassword());
            if (loggedInUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid email or password"));
            }

            HttpSession session = request.getSession(true);
            session.setAttribute("user", loggedInUser);

            // ✅ Ensure default profile picture if none exists
            String profilePic = loggedInUser.getProfilePicture();
            if (profilePic == null || profilePic.isBlank()) {
                profilePic = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                loggedInUser.setProfilePicture(profilePic);
            }

            // ✅ Include user_id in response (important for frontend review system)
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login successful");
            response.put("user_id", loggedInUser.getId());  // ✅ Added line
            response.put("name", loggedInUser.getName());
            response.put("email", loggedInUser.getEmail());
            response.put("profilePicture", profilePic);
            response.put("loginType", "MANUAL");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Something went wrong while logging in."));
        }
    }

    // -----------------------------------------------
// ✅ Google Login Success Handler (Fixed)
// -----------------------------------------------
    @GetMapping("/google/success")
    public ResponseEntity<?> googleSuccess(
            @org.springframework.security.core.annotation.AuthenticationPrincipal OAuth2User principal,
            HttpServletRequest request) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "No user found"));
        }

        String name = principal.getAttribute("name");
        String email = principal.getAttribute("email");
        String picture = principal.getAttribute("picture");

        System.out.println("🔐 Google sign-in for: " + email);

        // Register or update Google user
        authService.registerGoogleUser(name, email, picture);

        // Fetch the saved user from DB to get user_id
        User user = authService.getUserByEmail(email);

        // Store in session
        HttpSession session = request.getSession(true);
        session.setAttribute("user", user);

        // ✅ Proper response
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Google login successful");
        response.put("user_id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("profilePicture", user.getProfilePicture());
        response.put("loginType", "GOOGLE");

        return ResponseEntity.ok(response);
    }


    // -----------------------------------------------
    // ✅ Get Current Logged-in User
    // -----------------------------------------------
    @GetMapping("/user")
    public ResponseEntity<?> getUser(HttpSession session) {
        User user = (User) session.getAttribute("user");

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No user logged in");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId()); // ✅ Always return 'id'
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("profilePicture", user.getProfilePicture());
        response.put("loginType", user.getAuthProvider() != null ? user.getAuthProvider() : "MANUAL");

        return ResponseEntity.ok(response);
    }


    // -----------------------------------------------
    // ✅ Logout
    // -----------------------------------------------
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}
