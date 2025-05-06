// src/main/java/com/telemetry/kafka/TelemetryKafkaConsumer.java
package com.telemetry.kafka;

import com.telemetry.config.KafkaConfig;
import com.telemetry.websocket.TelemetryWebSocketHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.kafka.common.header.Headers;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;

import java.util.Map;
import java.util.UUID;

@Service
public class TelemetryKafkaConsumer {

    private static final Logger log = LoggerFactory.getLogger(TelemetryKafkaConsumer.class);

    @Autowired
    private TelemetryWebSocketHandler webSocketHandler;

    @Autowired
    private ObjectMapper objectMapper;

    @KafkaListener(
            topics   = KafkaConfig.TOPIC_TELEMETRY,
            groupId  = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumeTelemetry(
            @Payload Map<String,Object> payload,
            @Header(KafkaHeaders.RECEIVED_KEY) String key
    ) {
        forward(payload, key);
    }

    @KafkaListener(
            topics   = KafkaConfig.TOPIC_TELEMETRY_ALERT,
            groupId  = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumeAlerts(
            @Payload Map<String,Object> payload,
            @Header(KafkaHeaders.RECEIVED_KEY) String key
    ) {
        forward(payload, key);
    }

    private void forward(Map<String,Object> msg, String key) {
        try {
            // The key is still the UUID, but we're interpreting it as operatorId now
            UUID operatorId = UUID.fromString(key);
            String json = objectMapper.writeValueAsString(msg);
            webSocketHandler.sendMessageToOperator(operatorId, new TextMessage(json));
        } catch (Exception e) {
            log.error("Forwarding error: {}", e.getMessage(), e);
        }
    }
}