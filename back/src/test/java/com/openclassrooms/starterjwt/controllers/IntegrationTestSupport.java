package com.openclassrooms.starterjwt.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.ActiveProfiles;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Helpers for integration tests (MockMvc + auth token creation).
 */
@ActiveProfiles("test")
abstract class IntegrationTestSupport {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired UserRepository userRepository;
    @Autowired PasswordEncoder passwordEncoder;

    protected User createUser(String email, String rawPassword, boolean admin) {
        User u = User.builder()
                .email(email)
                .firstName("Test")
                .lastName("User")
                .password(passwordEncoder.encode(rawPassword))
                .admin(admin)
                .build();
        return userRepository.save(u);
    }

    protected String loginAndGetBearerToken(String email, String password) throws Exception {
        String payload = objectMapper.writeValueAsString(new java.util.HashMap<>() {{
            put("email", email);
            put("password", password);
        }});

        String body = mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content(payload))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JsonNode json = objectMapper.readTree(body);
        return "Bearer " + json.get("token").asText();
    }
}
