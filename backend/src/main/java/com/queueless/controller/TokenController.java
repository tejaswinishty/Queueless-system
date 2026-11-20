package com.queueless.controller;

import com.queueless.dto.TokenRequest;
import com.queueless.dto.TokenResponse;
import com.queueless.model.ServiceCategory;
import com.queueless.model.Token;
import com.queueless.service.QueueService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/tokens")
public class TokenController {

    private final QueueService queueService;

    public TokenController(QueueService queueService) {
        this.queueService = queueService;
    }

    @PostMapping
    public ResponseEntity<TokenResponse> createToken(@Valid @RequestBody TokenRequest request) {
        TokenResponse response = queueService.issueToken(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{tokenNumber}")
    public ResponseEntity<TokenResponse> getToken(@PathVariable String tokenNumber) {
        try {
            return ResponseEntity.ok(queueService.getTokenDetails(tokenNumber));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/waiting")
    public ResponseEntity<List<Token>> getWaitingTokens() {
        return ResponseEntity.ok(queueService.getAllWaitingTokens());
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Map<String, Object>>> getCategories() {
        List<Map<String, Object>> categories = new ArrayList<>();
        for (ServiceCategory cat : ServiceCategory.values()) {
            Map<String, Object> map = new HashMap<>();
            map.put("code", cat.name());
            map.put("prefix", cat.getPrefix());
            map.put("displayName", cat.getDisplayName());
            map.put("estimatedMinutesPerPerson", cat.getEstimatedMinutesPerPerson());
            categories.add(map);
        }
        return ResponseEntity.ok(categories);
    }
}
