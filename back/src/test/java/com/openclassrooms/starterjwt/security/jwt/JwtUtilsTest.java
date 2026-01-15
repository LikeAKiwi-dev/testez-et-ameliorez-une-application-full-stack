package com.openclassrooms.starterjwt.security.jwt;

import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.lang.reflect.Field;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;

class JwtUtilsTest {

    // 64 bytes (512 bits) en Base64 => OK pour HS512
    private static final String BASE64_SECRET =
            "AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQ==";

    private JwtUtils jwtUtilsWithSecret(String secret, int expirationMs) {
        JwtUtils jwtUtils = new JwtUtils();
        try {
            Field secretField = JwtUtils.class.getDeclaredField("jwtSecret");
            secretField.setAccessible(true);
            secretField.set(jwtUtils, secret);

            Field expField = JwtUtils.class.getDeclaredField("jwtExpirationMs");
            expField.setAccessible(true);
            expField.setInt(jwtUtils, expirationMs);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return jwtUtils;
    }

    private static Authentication auth(String email) {
        UserDetailsImpl principal = UserDetailsImpl.builder()
                .id(1L)
                .username(email)
                .firstName("First")
                .lastName("Last")
                .admin(false)
                .password("pwd")
                .build();
        return new UsernamePasswordAuthenticationToken(principal, null);
    }

    @Test
    void generateAndValidateToken_shouldWork() {
        JwtUtils jwtUtils = jwtUtilsWithSecret(BASE64_SECRET, 60_000);

        String token = jwtUtils.generateJwtToken(auth("u@test.local"));

        assertThat(jwtUtils.validateJwtToken(token)).isTrue();
        assertThat(jwtUtils.getUserNameFromJwtToken(token)).isEqualTo("u@test.local");
    }

    @Test
    void validateJwtToken_shouldReturnFalse_whenMalformed() {
        JwtUtils jwtUtils = jwtUtilsWithSecret(BASE64_SECRET, 60_000);
        assertThat(jwtUtils.validateJwtToken("not.a.jwt")).isFalse();
    }

    @Test
    void validateJwtToken_shouldReturnFalse_whenNullOrEmpty() {
        JwtUtils jwtUtils = jwtUtilsWithSecret(BASE64_SECRET, 60_000);
        assertThat(jwtUtils.validateJwtToken(null)).isFalse();
        assertThat(jwtUtils.validateJwtToken("")).isFalse();
    }

    @Test
    void validateJwtToken_shouldReturnFalse_whenExpired() {
        JwtUtils jwtUtils = jwtUtilsWithSecret(BASE64_SECRET, 60_000);

        String expiredToken = Jwts.builder()
                .setSubject("u@test.local")
                .setIssuedAt(new Date(System.currentTimeMillis() - 5_000))
                .setExpiration(new Date(System.currentTimeMillis() - 1_000))
                .signWith(SignatureAlgorithm.HS512, BASE64_SECRET)
                .compact();

        assertThat(jwtUtils.validateJwtToken(expiredToken)).isFalse();
    }

    @Test
    void validateJwtToken_shouldReturnFalse_whenSignatureInvalid() {
        JwtUtils jwtUtilsA = jwtUtilsWithSecret(BASE64_SECRET, 60_000);

        // Autre secret (toujours 512 bits) pour provoquer SignatureException
        String otherSecret =
                "AgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg==";
        JwtUtils jwtUtilsB = jwtUtilsWithSecret(otherSecret, 60_000);

        String tokenSignedWithA = jwtUtilsA.generateJwtToken(auth("u@test.local"));

        assertThat(jwtUtilsB.validateJwtToken(tokenSignedWithA)).isFalse();
    }

    @Test
    void validateJwtToken_shouldReturnFalse_whenUnsupported() {
        JwtUtils jwtUtils = jwtUtilsWithSecret(BASE64_SECRET, 60_000);

        // JWT "alg":"none" => souvent UnsupportedJwtException (ou Malformed selon version)
        String algNone = "eyJhbGciOiJub25lIn0.eyJzdWIiOiJ4In0.";

        assertThat(jwtUtils.validateJwtToken(algNone)).isFalse();
    }
}
