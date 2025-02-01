package com.SCM.SCM20.Services.Impl;


import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.List;
import java.util.Map;

@Service
public class GoogleContactService {

    private final RestTemplate restTemplate = new RestTemplate();

    public List<Map<String, Object>> getContacts(String accessToken) {
        String url = "https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);

        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);

        return (List<Map<String, Object>>) response.getBody().get("connections");
    }
}

