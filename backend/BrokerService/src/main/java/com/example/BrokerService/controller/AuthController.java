package com.example.BrokerService.controller;

import com.example.BrokerService.model.User;
import com.example.BrokerService.repository.UserRepository;
import com.example.BrokerService.security.JwtUtils;
import com.example.BrokerService.service.AuthDTO;
import com.example.BrokerService.service.AuthService;
import com.example.BrokerService.service.LoginDTO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<AuthDTO> getCurrentUser(HttpServletRequest req) {
        String token = jwtUtils.extractTokenFromCookie(req);
        if(token != null && jwtUtils.validateToken(token)){
            String username = jwtUtils.getUsernameFromJWT(token);
            User user = userRepository.findByName(username).orElse(null);
            if(user != null){
                return ResponseEntity.ok(new AuthDTO(user.getName(),user.getRole()));
            }
        }
        return ResponseEntity.status(401).build();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO authDTO, HttpServletResponse httpResponse){
        try{
            AuthDTO authResponse = authService.authenticate(authDTO.getName(),authDTO.getPassword(), httpResponse);

            return ResponseEntity.ok().body(authResponse);
        }
        catch(Exception e){
            return ResponseEntity.status(401).body("Invalid Credentials");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse httpResponse){
        ResponseCookie emptyCookie = ResponseCookie.from("authToken", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .build();

        httpResponse.addHeader("Set-Cookie", emptyCookie.toString());

        return ResponseEntity.ok().build();
    }
}
