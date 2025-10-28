package khoindn.swp391.be.app.service;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

@Service
public class SupabaseService implements ISupabaseService{

    private static final String SUPABASE_URL = "https://cwizvisvfifuqgbnesyu.storage.supabase.co/storage/v1/s3";
    private static final String SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3aXp2aXN2ZmlmdXFnYm5lc3l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MzIxNTYsImV4cCI6MjA3NzIwODE1Nn0.DFNL_U3tlBvzFyEYlmongjUDNPblH1tD4HSs2sI71zE";
    private static final String SUPABASE_LINK_URL = "https://cwizvisvfifuqgbnesyu.supabase.co/storage/v1/object/public/uploadsPDF/";

    @Override
    public String uploadFile(MultipartFile file) throws Exception {
        String fileName = file.getOriginalFilename(); // giữ tên file gốc
        URL url = new URL(SUPABASE_URL + fileName);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();

        conn.setDoOutput(true);
        conn.setRequestMethod("PUT");
        conn.setRequestProperty("Authorization", "Bearer " + SUPABASE_KEY);
        conn.setRequestProperty("Content-Type", file.getContentType());

        try (InputStream is = file.getInputStream()) {
            byte[] buffer = new byte[4096];
            int bytesRead;
            while ((bytesRead = is.read(buffer)) != -1) {
                conn.getOutputStream().write(buffer, 0, bytesRead);
            }
        }

        int responseCode = conn.getResponseCode();
        if (responseCode == 200) {
            // Nếu bucket public
            return SUPABASE_LINK_URL + fileName;
        } else {
            throw new RuntimeException("Upload thất bại, code: " + responseCode);
        }
    }
}
