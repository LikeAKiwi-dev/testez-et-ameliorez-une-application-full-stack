package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.ArrayList;
import java.util.Date;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SessionControllerIntegrationTest extends IntegrationTestSupport {

    @Autowired TeacherRepository teacherRepository;
    @Autowired SessionRepository sessionRepository;

    private String auth;
    private Teacher teacher;
    private User admin;
    private User attendee;
    private Session existingSession;

    @BeforeEach
    void setup() throws Exception {
        sessionRepository.deleteAll();
        teacherRepository.deleteAll();
        userRepository.deleteAll();

        admin = createUser("admin@test.local", "password", true);
        attendee = createUser("attendee@test.local", "password", false);

        auth = loginAndGetBearerToken("admin@test.local", "password");

        teacher = teacherRepository.save(Teacher.builder().firstName("T").lastName("One").build());

        existingSession = sessionRepository.save(Session.builder()
                .name("Existing Session")
                .date(new Date())
                .description("Existing desc")
                .teacher(teacher)
                .users(new ArrayList<>())
                .build());
    }

    @Test
    void endpoints_shouldRequireAuth() throws Exception {
        mockMvc.perform(get("/api/session"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void findAll_shouldReturnSessions() throws Exception {
        mockMvc.perform(get("/api/session").header("Authorization", auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void findById_shouldReturnOne() throws Exception {
        mockMvc.perform(get("/api/session/" + existingSession.getId()).header("Authorization", auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(existingSession.getId()));
    }

    @Test
    void findById_unknown_shouldReturn404_withApiError() throws Exception {
        mockMvc.perform(get("/api/session/999999").header("Authorization", auth))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void create_update_delete_shouldWork() throws Exception {
        // La colonne sessions.teacher_id est UNIQUE en base (un teacher ne peut avoir qu'une seule session).
        // Comme le @BeforeEach crée déjà une session liée à "teacher", on utilise un 2e teacher pour ce scénario.
        Teacher otherTeacher = teacherRepository.save(Teacher.builder().firstName("T").lastName("Two").build());

        String create = objectMapper.writeValueAsString(new java.util.HashMap<>() {{
            put("name", "New Session");
            put("date", System.currentTimeMillis());
            put("teacher_id", otherTeacher.getId());
            put("description", "Desc");
            put("users", new ArrayList<>());
        }});

        String createdBody = mockMvc.perform(post("/api/session").header("Authorization", auth)
                        .contentType("application/json").content(create))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andReturn().getResponse().getContentAsString();

        long createdId = objectMapper.readTree(createdBody).get("id").asLong();

        String update = objectMapper.writeValueAsString(new java.util.HashMap<>() {{
            put("name", "Updated");
            put("date", System.currentTimeMillis());
            put("teacher_id", otherTeacher.getId());
            put("description", "Updated desc");
            put("users", new ArrayList<>());
        }});

        mockMvc.perform(put("/api/session/" + createdId).header("Authorization", auth)
                        .contentType("application/json").content(update))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated"));

        mockMvc.perform(delete("/api/session/" + createdId).header("Authorization", auth))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/session/" + createdId).header("Authorization", auth))
                .andExpect(status().isNotFound());
    }
    @Test
    void participate_and_noLongerParticipate_shouldWork() throws Exception {
        // participate
        mockMvc.perform(post("/api/session/" + existingSession.getId() + "/participate/" + attendee.getId())
                        .header("Authorization", auth))
                .andExpect(status().isOk());

        // second participation => 400
        mockMvc.perform(post("/api/session/" + existingSession.getId() + "/participate/" + attendee.getId())
                        .header("Authorization", auth))
                .andExpect(status().isBadRequest());

        // no longer participate
        mockMvc.perform(delete("/api/session/" + existingSession.getId() + "/participate/" + attendee.getId())
                        .header("Authorization", auth))
                .andExpect(status().isOk());

        // second remove => 400
        mockMvc.perform(delete("/api/session/" + existingSession.getId() + "/participate/" + attendee.getId())
                        .header("Authorization", auth))
                .andExpect(status().isBadRequest());
    }
}
