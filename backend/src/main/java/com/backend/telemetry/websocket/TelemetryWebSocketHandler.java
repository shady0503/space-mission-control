package com.backend.telemetry.websocket;

import com.backend.telemetry.model.TelemetryResponse;
import com.backend.telemetry.service.TelemetryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Component
public class TelemetryWebSocketHandler extends TextWebSocketHandler {

    @Autowired
    private TelemetryService telemetryService;

    // Scheduler to fetch telemetry data continuously
    private ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        scheduler.scheduleAtFixedRate(() -> {
            try {
                TelemetryResponse telemetryResponse = telemetryService.fetchAndProcessTelemetry();
                String outgoingMessage = telemetryService.getObjectMapper().writeValueAsString(telemetryResponse);
                session.sendMessage(new TextMessage(outgoingMessage));
            } catch (Exception e) {
                try {
                    session.sendMessage(new TextMessage("{\"error\": \"Error fetching telemetry data: " + e.getMessage() + "\"}"));
                } catch (Exception sendEx) {
                    // Log sending error if necessary
                }
                e.printStackTrace();
            }
        }, 0, 5, TimeUnit.SECONDS);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, org.springframework.web.socket.CloseStatus status)
            throws Exception {
        scheduler.shutdown();
        super.afterConnectionClosed(session, status);
    }
}
