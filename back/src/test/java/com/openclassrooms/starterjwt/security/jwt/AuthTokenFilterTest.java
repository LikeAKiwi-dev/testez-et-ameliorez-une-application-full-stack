package com.openclassrooms.starterjwt.security.jwt;

import com.openclassrooms.starterjwt.security.services.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.lang.reflect.Field;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class AuthTokenFilterTest {

    @AfterEach
    void cleanup() {
        SecurityContextHolder.clearContext();
    }

    private static AuthTokenFilter filterWith(JwtUtils jwtUtils, UserDetailsServiceImpl uds) {
        AuthTokenFilter filter = new AuthTokenFilter();
        try {
            Field f1 = AuthTokenFilter.class.getDeclaredField("jwtUtils");
            f1.setAccessible(true);
            f1.set(filter, jwtUtils);

            Field f2 = AuthTokenFilter.class.getDeclaredField("userDetailsService");
            f2.setAccessible(true);
            f2.set(filter, uds);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return filter;
    }

    @Test
    void shouldPassThrough_whenNoAuthorizationHeader() throws Exception {
        JwtUtils jwtUtils = mock(JwtUtils.class);
        UserDetailsServiceImpl uds = mock(UserDetailsServiceImpl.class);
        AuthTokenFilter filter = filterWith(jwtUtils, uds);

        MockHttpServletRequest req = new MockHttpServletRequest();
        MockHttpServletResponse res = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(req, res, chain);

        verify(chain).doFilter(req, res);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void shouldPassThrough_whenTokenInvalid() throws Exception {
        JwtUtils jwtUtils = mock(JwtUtils.class);
        when(jwtUtils.validateJwtToken("token")).thenReturn(false);

        UserDetailsServiceImpl uds = mock(UserDetailsServiceImpl.class);
        AuthTokenFilter filter = filterWith(jwtUtils, uds);

        MockHttpServletRequest req = new MockHttpServletRequest();
        req.addHeader("Authorization", "Bearer token");
        MockHttpServletResponse res = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(req, res, chain);

        verify(chain).doFilter(req, res);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void shouldAuthenticate_whenTokenValid() throws Exception {
        JwtUtils jwtUtils = mock(JwtUtils.class);
        when(jwtUtils.validateJwtToken("token")).thenReturn(true);
        when(jwtUtils.getUserNameFromJwtToken("token")).thenReturn("u@test.local");

        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername("u@test.local")
                .password("x")
                .authorities("USER")
                .build();

        UserDetailsServiceImpl uds = mock(UserDetailsServiceImpl.class);
        when(uds.loadUserByUsername("u@test.local")).thenReturn(userDetails);

        AuthTokenFilter filter = filterWith(jwtUtils, uds);

        MockHttpServletRequest req = new MockHttpServletRequest();
        req.addHeader("Authorization", "Bearer token");
        MockHttpServletResponse res = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(req, res, chain);

        verify(chain).doFilter(req, res);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getName()).isEqualTo("u@test.local");
    }

    @Test
    void shouldNotCrash_whenExceptionOccurs() throws Exception {
        JwtUtils jwtUtils = mock(JwtUtils.class);
        when(jwtUtils.validateJwtToken("token")).thenReturn(true);
        when(jwtUtils.getUserNameFromJwtToken("token")).thenReturn("u@test.local");

        UserDetailsServiceImpl uds = mock(UserDetailsServiceImpl.class);
        when(uds.loadUserByUsername("u@test.local")).thenThrow(new RuntimeException("boom"));

        AuthTokenFilter filter = filterWith(jwtUtils, uds);

        MockHttpServletRequest req = new MockHttpServletRequest();
        req.addHeader("Authorization", "Bearer token");
        MockHttpServletResponse res = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(req, res, chain);

        verify(chain).doFilter(req, res);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }
}
