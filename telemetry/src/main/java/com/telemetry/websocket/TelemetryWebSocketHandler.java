package com.telemetry.websocket;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class TelemetryWebSocketHandler extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(TelemetryWebSocketHandler.class);

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final Map<UUID, CopyOnWriteArrayList<WebSocketSession>> operatorSessions = new ConcurrentHashMap<>();
    private final Map<String, UUID> sessionToOperator = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        try {
            UUID operatorId = extractOperatorId(session);
            if (operatorId == null) {
                closeWithError(session, "Missing operatorId");
                return;
            }

            operatorSessions
                    .computeIfAbsent(operatorId, k -> new CopyOnWriteArrayList<>())
                    .add(session);
            sessionToOperator.put(session.getId(), operatorId);

            Map<String,Object> ok = Map.of(
                    "type", "CONNECTION_SUCCESS",
                    "operatorId", operatorId.toString()
            );
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(ok)));

            log.info("WS {} connected to operator {}", session.getId(), operatorId);

        } catch (Exception e) {
            log.error("WS error: {}", e.getMessage());
            closeWithError(session, "Connection error");
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        UUID oid = sessionToOperator.remove(session.getId());
        if (oid != null) {
            var list = operatorSessions.get(oid);
            if (list != null) {
                list.remove(session);
                if (list.isEmpty()) operatorSessions.remove(oid);
            }
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession s, TextMessage m) {
        try {
            JsonNode n = objectMapper.readTree(m.getPayload());
            if ("PING".equals(n.path("type").asText())) {
                s.sendMessage(new TextMessage("{\"type\":\"PONG\"}"));
            }
        } catch (Exception ignore) {}
    }

    public void sendMessageToOperator(UUID operatorId, TextMessage msg) {
        var sessions = operatorSessions.get(operatorId);
        if (sessions == null) return;
        sessions.forEach(ws -> {
            try { if (ws.isOpen()) ws.sendMessage(msg); }
            catch (IOException ignored) {}
        });
    }

    // helpers
    private UUID extractOperatorId(WebSocketSession s) {
        String q = s.getUri() != null ? s.getUri().getQuery() : null;
        if (q == null) return null;
        for (String p : q.split("&")) {
            String[] kv = p.split("=",2);
            if (kv.length==2 && (kv[0].equals("operatorId") || kv[0].equals("enterpriseId"))) {
                // Support both new operatorId and legacy enterpriseId parameter names
                return UUID.fromString(URLDecoder.decode(kv[1], StandardCharsets.UTF_8));
            }
        }
        return null;
    }

    private void closeWithError(WebSocketSession s, String msg) {
        try {
            s.sendMessage(new TextMessage("{\"type\":\"ERROR\",\"message\":\""+msg+"\"}"));
            s.close(CloseStatus.POLICY_VIOLATION);
        } catch (IOException ignored) {}
    }
}