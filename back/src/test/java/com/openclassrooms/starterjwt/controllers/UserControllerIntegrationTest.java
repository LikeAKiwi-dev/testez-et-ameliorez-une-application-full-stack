package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.models.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserControllerIntegrationTest extends IntegrationTestSupport {

    private String auth;
    private User admin;
    private User target;

    @BeforeEach
    void setup() throws Exception {
        userRepository.deleteAll();

        admin = createUser("admin@test.local", "password", true);
        target = createUser("target@test.local", "password", false);

        auth = loginAndGetBearerToken("admin@test.local", "password");
    }

    @Test
    void findById_shouldReturnUserDto() throws Exception {
        mockMvc.perform(get("/api/user/" + target.getId()).header("Authorization", auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("target@test.local"));
    }

    @Test
    void delete_shouldDeleteOtherUser() throws Exception {
        mockMvc.perform(delete("/api/user/" + target.getId()).header("Authorization", auth))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/user/" + target.getId()).header("Authorization", auth))
                .andExpect(status().isNotFound());
    }

    @Test
    void delete_self_shouldReturn401_withApiError() throws Exception {
        mockMvc.perform(delete("/api/user/" + admin.getId()).header("Authorization", auth))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").exists());
    }
}
