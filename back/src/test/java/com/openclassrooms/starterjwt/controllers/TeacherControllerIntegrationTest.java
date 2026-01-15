package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TeacherControllerIntegrationTest extends IntegrationTestSupport {

    @Autowired TeacherRepository teacherRepository;
    @Autowired SessionRepository sessionRepository;

    private String auth;

    @BeforeEach
    void setup() throws Exception {
        sessionRepository.deleteAll();
        teacherRepository.deleteAll();
        userRepository.deleteAll();

        createUser("admin@test.local", "password", true);
        auth = loginAndGetBearerToken("admin@test.local", "password");

        teacherRepository.save(Teacher.builder().firstName("Alice").lastName("Anderson").build());
    }

    @Test
    void findAll_shouldReturnList_whenAuthenticated() throws Exception {
        mockMvc.perform(get("/api/teacher").header("Authorization", auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].firstName").value("Alice"));
    }

    @Test
    void findById_shouldReturnTeacher() throws Exception {
        Teacher t = teacherRepository.findAll().get(0);

        mockMvc.perform(get("/api/teacher/" + t.getId()).header("Authorization", auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lastName").value("Anderson"));
    }

    @Test
    void findById_unknown_shouldReturn404_withApiError() throws Exception {
        mockMvc.perform(get("/api/teacher/999999").header("Authorization", auth))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }
}
