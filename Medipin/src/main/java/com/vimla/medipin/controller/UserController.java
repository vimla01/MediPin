package com.vimla.medipin.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class UserController {
    @GetMapping("/user/me")
    public Map<String, Object> me(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return Map.of("message", "No user logged in");
        }

        return Map.of(
                "name", principal.getAttribute("name"),
                "email", principal.getAttribute("email"),
                "picture", principal.getAttribute("picture")
        );
    }
}
