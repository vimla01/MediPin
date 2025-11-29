package com.vimla.medipin.config;

import com.vimla.medipin.entity.User;
import com.vimla.medipin.service.AuthService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class CustomOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    @Autowired
    private AuthService authService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String name = oAuth2User.getAttribute("name");
        String email = oAuth2User.getAttribute("email");
        String picture = oAuth2User.getAttribute("picture");

        try {
            
            authService.registerGoogleUser(name, email, picture);

            
            User dbUser = authService.getUserByEmail(email);

            
            HttpSession session = request.getSession(true);
            session.setAttribute("user", dbUser);

            System.out.println("Google login successful for: " + email);

            response.sendRedirect("http://localhost:5500/index.html");

        } catch (Exception e) {
            System.err.println("Google login error: " + e.getMessage());
            response.sendRedirect("http://localhost:5500/login.html?error=google_login_failed");
        }
    }
}
