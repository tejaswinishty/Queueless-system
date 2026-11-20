package com.queueless.controller;

import com.queueless.dto.CrowdOverviewDTO;
import com.queueless.dto.HourlyPredictionDTO;
import com.queueless.dto.LiveQueueStatusDTO;
import com.queueless.service.PredictionService;
import com.queueless.service.QueueService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class PredictionController {

    private final PredictionService predictionService;
    private final QueueService queueService;

    public PredictionController(PredictionService predictionService, QueueService queueService) {
        this.predictionService = predictionService;
        this.queueService = queueService;
    }

    @GetMapping("/predictions/overview")
    public ResponseEntity<CrowdOverviewDTO> getCrowdOverview() {
        return ResponseEntity.ok(predictionService.getCrowdOverview());
    }

    @GetMapping("/predictions/hourly")
    public ResponseEntity<List<HourlyPredictionDTO>> getHourlyForecast() {
        return ResponseEntity.ok(predictionService.generateHourlyForecast());
    }

    @GetMapping("/queue/live")
    public ResponseEntity<LiveQueueStatusDTO> getLiveQueueStatus() {
        return ResponseEntity.ok(queueService.getLiveStatus());
    }
}
