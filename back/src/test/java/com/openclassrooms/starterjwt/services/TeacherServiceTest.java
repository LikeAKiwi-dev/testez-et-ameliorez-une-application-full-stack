package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TeacherServiceTest {

    @Mock TeacherRepository teacherRepository;

    @InjectMocks TeacherService teacherService;

    @Test
    void findAll_shouldReturnTeachers() {
        when(teacherRepository.findAll()).thenReturn(List.of(
                Teacher.builder().id(1L).firstName("A").lastName("B").build()
        ));

        assertThat(teacherService.findAll()).hasSize(1);
    }

    @Test
    void findById_shouldReturnTeacher_whenExists() {
        Teacher t = Teacher.builder().id(5L).firstName("John").lastName("Doe").build();
        when(teacherRepository.findById(5L)).thenReturn(Optional.of(t));

        assertThat(teacherService.findById(5L)).isSameAs(t);
    }

    @Test
    void findById_shouldThrowNotFound_whenMissing() {
        when(teacherRepository.findById(5L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> teacherService.findById(5L))
                .isInstanceOf(NotFoundException.class);
    }
}
