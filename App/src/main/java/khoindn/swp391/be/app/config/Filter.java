package khoindn.swp391.be.app.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import khoindn.swp391.be.app.exception.exceptions.AuthenticationException;
import khoindn.swp391.be.app.service.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

import java.io.IOException;
import java.util.List;

@Component
public class Filter extends OncePerRequestFilter {
    @Autowired
    @Qualifier("handlerExceptionResolver")
    private HandlerExceptionResolver resolver;

    @Autowired
    TokenService tokenService;

    private final List<String> PUBLIC_API = List.of(
            "POST:/Users/register",
            "POST:/Users/login",
            "POST:/UserRole/",
            "POST:/Group/register"
    );

    public boolean isPublicAPI(String uri, String method) {
        AntPathMatcher matcher = new AntPathMatcher();

        if (method.equals("GET")) return true;

        return PUBLIC_API.stream().anyMatch(pattern -> {
            String[] parts = pattern.split(":", 2);
            if (parts.length != 2) return false;

            String allowedMethod = parts[0];
            String allowedUri = parts[1];

            return matcher.match(allowedUri, uri);
        });
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        System.out.println("Filter is called");

        String uri = request.getRequestURI();
        String method = request.getMethod();
        if (isPublicAPI(uri, method)) {
            //API public
            filterChain.doFilter(request, response);
        } else {
            // API by role
            String token = getToken(request);
            if (token == null) {
                resolver.resolveException(request, response, null, new AuthenticationException("Empty token!"));
            }
        }


    }

    public String getToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null) return null;
        return authHeader.substring(7);
    }
}
