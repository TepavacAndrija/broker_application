package com.example.BrokerService.service;

import com.example.BrokerService.model.Role;
import com.example.BrokerService.model.User;
import com.example.BrokerService.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataRetrievalFailureException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public Optional<User> getUserById(UUID id) {
        return userRepository.findById(id);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User createUser(CreateUserDTO userDTO) {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setName(userDTO.getName());
        user.setRole(userDTO.getRole());
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        return userRepository.save(user);
    }

    public User updateUser(UUID id, UpdateUserDTO userDTO) {
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent()) {
            User userToUpdate = user.get();
            if(userDTO.getName() != null) {
                userToUpdate.setName(userDTO.getName());
            }
            if(userDTO.getRole() != null) {
                userToUpdate.setRole(userDTO.getRole());
            }
            return userRepository.save(userToUpdate);
        }
        else  {
            throw new DataRetrievalFailureException("User with id " + id + " not found");
        }
    }

    public void deleteUser(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new DataRetrievalFailureException("User with id " + id + " not found");
        }
        userRepository.deleteById(id);
    }
}
