package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.UnauthorizedOperationException;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void delete(Long id) {
        User user = this.findById(id);

        UserDetails userDetails = (UserDetails) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        if (Objects.equals(userDetails.getUsername(), user.getEmail())) {
            throw new UnauthorizedOperationException("You cannot delete your own account");
        }

        this.userRepository.deleteById(id);
    }

    public User findById(Long id) {
        return this.userRepository.findById(id).orElse(null);
    }
}
