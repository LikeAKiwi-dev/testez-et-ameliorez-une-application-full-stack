package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SessionServiceTest {

    @Mock
    SessionRepository sessionRepository;

    @Mock
    UserRepository userRepository;

    @InjectMocks
    SessionService sessionService;

    /**
     * Helper : crée un User complet via setters (pas de builder),
     * pour éviter les problèmes Lombok @NonNull et l'accès private aux champs.
     */
    private static User user(Long id) {
        User u = new User();
        u.setId(id);
        u.setEmail("user" + id + "@test.local");
        u.setFirstName("First" + id);
        u.setLastName("Last" + id);
        u.setPassword("pwd");
        u.setAdmin(false);
        return u;
    }

    @Test
    void participate_shouldAddUser_whenNotAlreadyParticipating() {
        User u = user(1L);

        Session s = Session.builder()
                .id(2L)
                .name("Yoga")
                .description("Desc")
                .users(new ArrayList<>())
                .build();

        when(sessionRepository.findById(2L)).thenReturn(Optional.of(s));
        when(userRepository.findById(1L)).thenReturn(Optional.of(u));

        sessionService.participate(2L, 1L);

        assertThat(s.getUsers()).hasSize(1);
        assertThat(s.getUsers().get(0).getId()).isEqualTo(1L);
        verify(sessionRepository).save(s);
    }

    @Test
    void participate_shouldThrowNotFound_whenSessionOrUserMissing() {
        when(sessionRepository.findById(2L)).thenReturn(Optional.empty());
        when(userRepository.findById(1L)).thenReturn(Optional.of(user(1L)));

        assertThatThrownBy(() -> sessionService.participate(2L, 1L))
                .isInstanceOf(NotFoundException.class);

        verify(sessionRepository, never()).save(any());
    }

    @Test
    void participate_shouldThrowBadRequest_whenAlreadyParticipating() {
        User u = user(1L);
        Session s = Session.builder()
                .id(2L)
                .users(new ArrayList<>(List.of(u)))
                .build();

        when(sessionRepository.findById(2L)).thenReturn(Optional.of(s));
        when(userRepository.findById(1L)).thenReturn(Optional.of(u));

        assertThatThrownBy(() -> sessionService.participate(2L, 1L))
                .isInstanceOf(BadRequestException.class);

        verify(sessionRepository, never()).save(any());
    }

    @Test
    void noLongerParticipate_shouldRemoveUser_whenParticipating() {
        User u1 = user(1L);
        User u2 = user(2L);

        Session s = Session.builder()
                .id(10L)
                .users(new ArrayList<>(List.of(u1, u2)))
                .build();

        when(sessionRepository.findById(10L)).thenReturn(Optional.of(s));

        sessionService.noLongerParticipate(10L, 2L);

        assertThat(s.getUsers()).extracting(User::getId).containsExactly(1L);
        verify(sessionRepository).save(s);
    }

    @Test
    void noLongerParticipate_shouldThrowNotFound_whenSessionMissing() {
        when(sessionRepository.findById(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sessionService.noLongerParticipate(10L, 2L))
                .isInstanceOf(NotFoundException.class);

        verify(sessionRepository, never()).save(any());
    }

    @Test
    void noLongerParticipate_shouldThrowBadRequest_whenUserNotParticipating() {
        User u1 = user(1L);

        Session s = Session.builder()
                .id(10L)
                .users(new ArrayList<>(List.of(u1)))
                .build();

        when(sessionRepository.findById(10L)).thenReturn(Optional.of(s));

        assertThatThrownBy(() -> sessionService.noLongerParticipate(10L, 999L))
                .isInstanceOf(BadRequestException.class);

        verify(sessionRepository, never()).save(any());
    }
}
