package com.openclassrooms.starterjwt.security.services;

import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserDetailsServiceImplTest {

    @Mock UserRepository userRepository;
    @InjectMocks UserDetailsServiceImpl userDetailsService;

    @Test
    void loadUserByUsername_shouldReturnUserDetails() {
        User u = User.builder()
                .id(1L)
                .email("a@test.local")
                .firstName("A")
                .lastName("B")
                .password("encoded")
                .admin(false)
                .build();

        when(userRepository.findByEmail("a@test.local")).thenReturn(Optional.of(u));

        var details = userDetailsService.loadUserByUsername("a@test.local");

        assertThat(details.getUsername()).isEqualTo("a@test.local");
        assertThat(details.getPassword()).isEqualTo("encoded");
    }

    @Test
    void loadUserByUsername_shouldThrow_whenMissing() {
        when(userRepository.findByEmail("x@test.local")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userDetailsService.loadUserByUsername("x@test.local"))
                .isInstanceOf(UsernameNotFoundException.class);
    }
}
