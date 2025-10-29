package khoindn.swp391.be.app.service;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

@Service
public class SupabaseService implements ISupabaseService{
    private static final String SUPABASE_URL = "https://cwizvisvfifuqgbnesyu.supabase.co/storage/v1/object/uploadsPDF/";
    private static final String SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3aXp2aXN2ZmlmdXFnYm5lc3l1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTYzMjE1NiwiZXhwIjoyMDc3MjA4MTU2fQ.ZRHHFfSwqw-CTx6rwhQgY8rdvl6x5ERPcpRP_kr95V4";
    private static final String SUPABASE_LINK_URL = "https://cwizvisvfifuqgbnesyu.supabase.co/storage/v1/object/public/uploadsPDF/";

    @Override
    public String uploadFile(MultipartFile file) throws Exception {
        String fileName = file.getOriginalFilename(); // giữ tên file gốc
        if (isFileExist(fileName)) {
            throw new RuntimeException("file is existed!");
        }
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
            // trả public link nếu bucket public
            return SUPABASE_LINK_URL + fileName;
        } else {
            throw new RuntimeException("Upload thất bại, code: " + responseCode);
        }
    }

    public boolean isFileExist(String fileName) {
        try {
            URL url = new URL(SUPABASE_LINK_URL + fileName);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.connect();
            int code = conn.getResponseCode();
            return code == 200;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public String getFileUrl(String fileName) {
        // Chỉ cần nối SUPABASE_LINK_URL với filename nếu bucket public
        return SUPABASE_LINK_URL + fileName;
    }

}
