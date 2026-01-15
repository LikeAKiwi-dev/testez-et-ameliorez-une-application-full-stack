package com.openclassrooms.starterjwt.controllers;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerIntegrationTest extends IntegrationTestSupport {

    @Test
    void register_then_login_shouldReturnToken() throws Exception {
        String register = objectMapper.writeValueAsString(new java.util.HashMap<>() {{
            put("email", "it_user@test.local");
            put("firstName", "John");
            put("lastName", "Doe");
            put("password", "password123");
        }});

        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content(register))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());

        String login = objectMapper.writeValueAsString(new java.util.HashMap<>() {{
            put("email", "it_user@test.local");
            put("password", "password123");
        }});

        String body = mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content(login))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn().getResponse().getContentAsString();

        assertThat(body).contains("token");
    }

    @Test
    void register_invalidPayload_shouldReturn400_withApiError() throws Exception {
        // invalid email + too short names + too short password
        String register = objectMapper.writeValueAsString(new java.util.HashMap<>() {{
            put("email", "not-an-email");
            put("firstName", "a");
            put("lastName", "b");
            put("password", "123");
        }});

        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content(register))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").exists());
    }
}
