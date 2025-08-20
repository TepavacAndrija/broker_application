package com.example.BrokerService.service;

import com.example.BrokerService.model.Role;
import lombok.Data;

@Data
public class CreateUserDTO {
    String name;
    Role role;
}
