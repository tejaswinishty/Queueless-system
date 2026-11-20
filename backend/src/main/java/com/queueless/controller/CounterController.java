package com.queueless.controller;

import com.queueless.model.Counter;
import com.queueless.service.QueueService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/counters")
public class CounterController {

    private final QueueService queueService;

    public CounterController(QueueService queueService) {
        this.queueService = queueService;
    }

    @GetMapping
    public ResponseEntity<List<Counter>> getCounters() {
        return ResponseEntity.ok(queueService.getAllCounters());
    }

    @PostMapping("/{counterNumber}/call-next")
    public ResponseEntity<Counter> callNext(@PathVariable Integer counterNumber) {
        try {
            return ResponseEntity.ok(queueService.callNext(counterNumber));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{counterNumber}/complete")
    public ResponseEntity<Counter> completeCurrent(@PathVariable Integer counterNumber) {
        try {
            return ResponseEntity.ok(queueService.completeCurrent(counterNumber));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{counterNumber}/skip")
    public ResponseEntity<Counter> skipCurrent(@PathVariable Integer counterNumber) {
        try {
            return ResponseEntity.ok(queueService.skipCurrent(counterNumber));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
