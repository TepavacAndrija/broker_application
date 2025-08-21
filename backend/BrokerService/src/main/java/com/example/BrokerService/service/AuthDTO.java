package com.example.BrokerService.service;

import com.example.BrokerService.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthDTO {
    String token;
    String name;
    Role role;
}
