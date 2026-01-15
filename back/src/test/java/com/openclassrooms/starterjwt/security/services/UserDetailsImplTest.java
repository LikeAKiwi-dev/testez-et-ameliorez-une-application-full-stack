package com.openclassrooms.starterjwt.security.services;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class UserDetailsImplTest {

    @Test
    void getAuthorities_shouldBeEmpty_inThisProject() {
        UserDetailsImpl u = UserDetailsImpl.builder()
                .id(1L)
                .username("admin@test.local")
                .firstName("A")
                .lastName("B")
                .admin(true)
                .password("pwd")
                .build();

        assertThat(u.getAuthorities()).isNotNull();
        assertThat(u.getAuthorities()).isEmpty();
    }

    @Test
    void equals_shouldCoverBranches() {
        UserDetailsImpl u1 = UserDetailsImpl.builder()
                .id(1L).username("a").firstName("A").lastName("B").admin(false).password("pwd").build();

        UserDetailsImpl u2 = UserDetailsImpl.builder()
                .id(1L).username("b").firstName("C").lastName("D").admin(false).password("pwd").build();

        Object otherType = "not a UserDetailsImpl";

        assertThat(u1.equals(u1)).isTrue();
        assertThat(u1.equals(null)).isFalse();
        assertThat(u1.equals(otherType)).isFalse();
        assertThat(u1.equals(u2)).isTrue();
    }
}
