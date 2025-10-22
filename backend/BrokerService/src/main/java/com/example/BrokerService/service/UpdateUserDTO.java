package com.example.BrokerService.service;

import com.example.BrokerService.model.Role;
import lombok.Data;

@Data
public class UpdateUserDTO {
    private String name;
    private Role role;
}
