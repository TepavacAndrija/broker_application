package com.example.BrokerService.controller;

import com.example.BrokerService.service.AuthDTO;
import com.example.BrokerService.service.AuthService;
import com.example.BrokerService.service.LoginDTO;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO authDTO, HttpServletResponse httpResponse){
        try{
            AuthDTO authResponse = authService.authenticate(authDTO.getName(),authDTO.getPassword());
            httpResponse.addHeader("Authorization", "Bearer "+authResponse.getToken());

            return ResponseEntity.ok().body(authResponse);
        }
        catch(Exception e){
            return ResponseEntity.status(401).body("Invalid Credentials");
        }
    }
}
