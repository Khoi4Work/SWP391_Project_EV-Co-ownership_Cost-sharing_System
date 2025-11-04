// TẠO FILE MỚI NÀY
// Đường dẫn: src/main/java/khoindn/swp391/be/app/service/UserDetailsServiceImpl.java
package khoindn.swp391.be.app.service;

import khoindn.swp391.be.app.pojo.Users;
import khoindn.swp391.be.app.repository.IUserRepository; // (Dùng IUserRepository của bạn)
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final IUserRepository userRepository; // (Dùng IUserRepository của bạn)

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Dùng hàm findByEmail (không Optional) của bạn
        Users user = userRepository.findByEmail(email);

        if (user == null) {
            throw new UsernameNotFoundException("Không tìm thấy user với email: " + email);
        }
        // Trả về user (vì Users của bạn đã implements UserDetails)
        return user;
    }
}