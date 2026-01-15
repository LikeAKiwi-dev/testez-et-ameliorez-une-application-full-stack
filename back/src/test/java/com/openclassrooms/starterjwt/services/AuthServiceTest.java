package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.payload.request.SignupRequest;
import com.openclassrooms.starterjwt.payload.response.JwtResponse;
import com.openclassrooms.starterjwt.payload.response.MessageResponse;
import com.openclassrooms.starterjwt.repository.UserRepository;
import com.openclassrooms.starterjwt.security.jwt.JwtUtils;
import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.junit.jupiter.api.Assertions.*;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock AuthenticationManager authenticationManager;
    @Mock JwtUtils jwtUtils;
    @Mock PasswordEncoder passwordEncoder;
    @Mock UserRepository userRepository;
    @Mock Authentication authentication;

    @InjectMocks AuthService authService;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void login_shouldReturnJwtResponse() {
        LoginRequest req = new LoginRequest();
        req.setEmail("admin@test.local");
        req.setPassword("password");

        UserDetailsImpl principal = UserDetailsImpl.builder()
                .id(10L)
                .username("admin@test.local")
                .firstName("Admin")
                .lastName("User")
                .password("encoded")
                .build();

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(principal);
        when(jwtUtils.generateJwtToken(authentication)).thenReturn("jwt-token");

        JwtResponse res = authService.login(req);

        assertThat(res.getToken()).isEqualTo("jwt-token");
        assertThat(res.getId()).isEqualTo(10L);
        assertThat(res.getUsername()).isEqualTo("admin@test.local");
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isEqualTo(authentication);
    }

    @Test
    void register_shouldFailWhenEmailExists() {
        // Arrange
        SignupRequest req = new SignupRequest();
        req.setEmail("test@test.com");
        req.setFirstName("John");
        req.setLastName("Doe");
        req.setPassword("password123");

        when(userRepository.existsByEmail("test@test.com")).thenReturn(true);

        // Act
        MessageResponse res = authService.register(req);

        // Assert
        assertThat(res).isNotNull();
        assertEquals("Error: Email is already taken!", res.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }


    @Test
    void register_shouldSaveUserWithEncodedPasswordAndAdminFalse() {
        SignupRequest req = new SignupRequest();
        req.setEmail("new@test.local");
        req.setFirstName("John");
        req.setLastName("Doe");
        req.setPassword("secret123");

        when(userRepository.existsByEmail("new@test.local")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("encoded-secret");

        MessageResponse res = authService.register(req);

        assertThat(res.getMessage()).contains("registered successfully");

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());

        User saved = captor.getValue();
        assertThat(saved.getEmail()).isEqualTo("new@test.local");
        assertThat(saved.getFirstName()).isEqualTo("John");
        assertThat(saved.getLastName()).isEqualTo("Doe");
        assertThat(saved.getPassword()).isEqualTo("encoded-secret");
        assertThat(saved.isAdmin()).isFalse();
    }
}
