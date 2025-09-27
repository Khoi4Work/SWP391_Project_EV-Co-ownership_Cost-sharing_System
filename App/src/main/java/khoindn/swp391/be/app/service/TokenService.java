package khoindn.swp391.be.app.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import khoindn.swp391.be.app.pojo.Users;
import khoindn.swp391.be.app.repository.IAuthenticationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;

import java.util.Date;
import java.util.function.Function;


@Service

public class TokenService {
    private final String SECRET_KEY = "khoimapu2k56h7l8o9p3r4s5t6u7v8w9x0y1z2a3b4c5d6e7f8g9h0i1j2k3l4m5n6";
    @Autowired
    IAuthenticationRepository authenticationRepository;

    //generate and validate token
    public SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(Users account) {
        return Jwts.builder()
                .subject(account.getId() + "")
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() * 1000 * 60 * 60 * 24)
                ).signWith(getSignInKey()).compact();
    }

    public Users extractToken(String token) {
        String value = extractClaim(token, Claims::getSubject);
        int id = Integer.parseInt(value);
        return authenticationRepository.findUserById(id);
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parser().
                verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        Claims claims = extractAllClaims(token);
        return resolver.apply(claims);
    }

}
