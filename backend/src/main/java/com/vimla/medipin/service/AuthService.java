package com.vimla.medipin.service;

import com.vimla.medipin.entity.User;
import com.vimla.medipin.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;


    public String registerUser(User user) {
        User existingUser = userRepository.findByEmail(user.getEmail());

        if (existingUser != null) {
            if ("GOOGLE_LOGIN".equals(existingUser.getPassword())) {
                return "Account already exists with Google login. Please sign in with Google.";
            }
            return "User already exists with this email.";
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("USER"); // default role
        userRepository.save(user);
        return "User registered successfully!";
    }

  
    public String loginUser(String email, String password) {
        User existingUser = userRepository.findByEmail(email);

        if (existingUser == null) {
            return "User not found. Please register first.";
        }

        if ("GOOGLE_LOGIN".equals(existingUser.getPassword())) {
            return "Please log in using Google for this account.";
        }

        if (!passwordEncoder.matches(password, existingUser.getPassword())) {
            return "Invalid password.";
        }

        return "Login successful!";
    }

   
    public User validateUser(String email, String password) {
        User existingUser = userRepository.findByEmail(email);

        if (existingUser != null &&
                !"GOOGLE_LOGIN".equals(existingUser.getPassword()) &&
                passwordEncoder.matches(password, existingUser.getPassword())) {
            return existingUser;
        }

        return null;
    }


    public void registerGoogleUser(String name, String email, String pictureUrl) {
        User existingUser = userRepository.findByEmail(email);

        if (existingUser == null) {
            User googleUser = User.builder()
                    .name(name)
                    .email(email)
                    .password("GOOGLE_LOGIN") // placeholder, not used for Google users
                    .role("USER")
                    .location("Unknown")
                    .profilePicture(pictureUrl)
                    .build();

            userRepository.save(googleUser);
            System.out.println("New Google user registered: " + email);

        } else {
            boolean updated = false;

            if (pictureUrl != null && !pictureUrl.equals(existingUser.getProfilePicture())) {
                existingUser.setProfilePicture(pictureUrl);
                updated = true;
            }

            if (name != null && !name.equals(existingUser.getName())) {
                existingUser.setName(name);
                updated = true;
            }

            if (updated) {
                userRepository.save(existingUser);
                System.out.println("Updated Google user details for: " + email);
            } else {
                System.out.println("ℹ️ Google user already up-to-date: " + email);
            }
        }
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
