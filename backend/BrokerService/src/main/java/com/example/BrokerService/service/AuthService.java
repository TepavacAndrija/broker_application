package com.example.BrokerService.service;

import com.example.BrokerService.model.User;
import com.example.BrokerService.repository.UserRepository;
import com.example.BrokerService.security.JwtUtils;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthDTO authenticate(String username, String password, HttpServletResponse response) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password));

        String jwtToken = jwtUtils.generateToken(authentication);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByName(username)
                .orElseThrow(()-> new UsernameNotFoundException("User not found"));

        ResponseCookie jwtCookie = ResponseCookie.from("authToken", jwtToken)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(86400)
                .sameSite("Strict")
                .build();

        response.addHeader("Set-Cookie", jwtCookie.toString());

        return new AuthDTO(user.getName(),user.getRole());
    }
}

